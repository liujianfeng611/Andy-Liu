import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 4173);
const defaultCompanies = [
  { id: "amzn", name: "Amazon.com Inc.", ticker: "AMZN", cik: "0001018724", topics: ["AI", "AWS", "retail margin", "agent commerce"], notes: "" },
  { id: "msft", name: "Microsoft Corporation", ticker: "MSFT", cik: "0000789019", topics: ["Azure", "Copilot", "OpenAI", "enterprise demand"], notes: "" },
  { id: "nvda", name: "NVIDIA Corporation", ticker: "NVDA", cik: "0001045810", topics: ["AI capex", "data center", "gross margin"], notes: "" },
  { id: "pltr", name: "Palantir Technologies", ticker: "PLTR", cik: "0001321655", topics: ["AIP", "government", "commercial"], notes: "" }
];

const defaultItems = [
  sample("amzn", "open", "Amazon Launches Supply Chain Service for Sellers", "Amazon is expanding seller tools into logistics orchestration; watch fulfillment margin and seller adoption.", "AMZN", "2026-05-04T21:45:00"),
  sample("msft", "open", "OpenAI与私募股权公司敲定价值100亿美元合作", "微软生态的企业AI渗透继续扩展，关注 Azure 训练/推理负载与渠道转化。", "MSFT", "2026-05-04T21:03:00"),
  sample("nvda", "open", "AI Infra：为何推理优化在2026年成为主线", "推理需求、内存带宽与网络互联仍是半导体 Agent 的核心监控项。", "NVDA", "2026-05-04T20:00:00"),
  sample("pltr", "local", "Information on Palantir", "本地纪要显示 AIP bootcamp 转化率改善，需和合同公告交叉验证。", "Palantir", "2026-05-04T19:00:00")
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  res.end(status === 204 ? "" : JSON.stringify(payload));
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stableIdPart(value) {
  let hash = 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function slugId(value, fallback = "codex") {
  return cleanText(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || fallback;
}

function cleanModelText(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sample(companyId, type, title, summary, source, publishedAt) {
  return { id: `${companyId}-${title}`, companyId, type, title, summary, source, publishedAt, createdAt: publishedAt };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "InvestmentIntelWorkstation/0.1 contact: local-user",
      ...headers
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchText(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "InvestmentIntelWorkstation/0.1 contact: local-user",
      ...headers
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

function cleanHtmlText(value) {
  return cleanText(String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("\u00a0", " "));
}

async function fetchUrlResourceLocal(value) {
  const target = cleanText(value);
  if (!/^https?:\/\//i.test(target)) throw new Error("请输入 http 或 https 开头的链接");
  const response = await fetch(target, {
    headers: {
      "user-agent": "AndyWorkstation/0.1",
      accept: "text/html,text/plain,application/json,text/csv,*/*"
    }
  });
  if (!response.ok) throw new Error(`无法读取链接：${response.status} ${response.statusText}`);
  const contentType = response.headers.get("content-type") || "";
  const source = new URL(target).hostname.replace(/^www\./, "");
  const isReadable = /text|json|xml|csv|html|markdown|javascript/i.test(contentType);
  if (!isReadable) {
    return {
      title: target.split("/").filter(Boolean).pop() || target,
      source,
      url: target,
      contentType,
      text: "",
      description: `已保存链接。该文件类型暂不直接读取正文：${contentType || "unknown"}`
    };
  }
  const raw = (await response.text()).slice(0, 300000);
  const title = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const description = raw.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || raw.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]
    || "";
  return {
    title: cleanHtmlText(title || target.split("/").filter(Boolean).pop() || target),
    source,
    url: target,
    contentType,
    description: cleanHtmlText(description),
    text: cleanHtmlText(raw)
  };
}

function captureItemFromPayload(payload, company, resource = {}) {
  const now = new Date().toISOString();
  const url = cleanText(payload.url || resource.url);
  const title = cleanText(payload.title || resource.title || url || "Codex 抓取笔记");
  const source = cleanText(payload.source || resource.source || (url ? new URL(url).hostname.replace(/^www\./, "") : "Codex"));
  const providedText = cleanModelText(payload.text || payload.content || payload.markdown || payload.sourceText || "");
  const fetchedText = cleanModelText(resource.text || "");
  const sourceText = (providedText || fetchedText || cleanText(payload.summary || resource.description || `已保存链接：${url}`)).slice(0, 500000);
  const summary = cleanText(payload.summary || resource.description || sourceText || title).slice(0, 360);
  const tags = [
    "Codex抓取",
    sourceText ? "可读正文" : "链接",
    ...(Array.isArray(payload.tags) ? payload.tags : cleanText(payload.tags).split(/[，,、;]/))
  ].map(cleanText).filter(Boolean);
  const unique = url || `${title}-${source}-${now}`;
  return {
    id: `codex-${company?.id || "inbox"}-${stableIdPart(unique)}`,
    companyId: company?.id || null,
    type: cleanText(payload.type) || "local",
    folderId: cleanText(payload.folderId) || "cloud",
    tags: [...new Set(tags)].slice(0, 12),
    title,
    source,
    url,
    sourceText,
    viewText: "",
    createdAt: now,
    publishedAt: cleanText(payload.publishedAt || payload.published_at) || now,
    summary,
    capture: {
      by: "codex",
      mode: providedText ? "provided-text" : url ? "url-fetch" : "manual",
      capturedAt: now,
      contentType: resource.contentType || ""
    }
  };
}

async function codexCaptureLocal(payload) {
  const url = cleanText(payload.url);
  const hasProvidedText = Boolean(cleanText(payload.text || payload.content || payload.markdown || payload.sourceText));
  if (!url && !hasProvidedText) throw new Error("请提供 url，或直接提供 text/content 正文。");
  const ticker = safeTicker(payload.ticker || payload.symbol);
  const companyName = cleanText(payload.companyName || payload.company || payload.name);
  const company = ticker || companyName || payload.companyId
    ? {
      id: cleanText(payload.companyId) || slugId(ticker || companyName),
      ticker,
      name: companyName || ticker
    }
    : null;
  let resource = {};
  if (url && !hasProvidedText) {
    resource = await fetchUrlResourceLocal(url);
  } else if (url) {
    try {
      resource = await fetchUrlResourceLocal(url);
    } catch {
      resource = { url, source: new URL(url).hostname.replace(/^www\./, "") };
    }
  }
  return { item: captureItemFromPayload(payload, company, resource), company, backend: "node-local" };
}

function decodeXml(value) {
  return cleanText(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function tagValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1].replace(/^<!\[CDATA\[|\]\]>$/g, "")) : "";
}

function normalizeGdeltArticle(article) {
  return {
    id: article.url || `${article.title}-${article.seendate}`,
    title: cleanText(article.title),
    source: cleanText(article.domain || article.sourceCountry || "Open web"),
    url: article.url,
    publishedAt: article.seendate,
    summary: cleanText(article.snippet || article.title),
    language: article.language,
    sentiment: Number.isFinite(article.tone) ? article.tone : null
  };
}

async function getOpenWebNews(query) {
  const params = new URLSearchParams({
    query: `"${query}"`,
    mode: "ArtList",
    format: "json",
    maxrecords: "25",
    sort: "DateDesc"
  });
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
  try {
    const data = await fetchJson(url);
    return (data.articles || []).map(normalizeGdeltArticle);
  } catch {
    const rssParams = new URLSearchParams({
      q: query,
      hl: "en-US",
      gl: "US",
      ceid: "US:en"
    });
    const xml = await fetchText(`https://news.google.com/rss/search?${rssParams}`);
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    return items.slice(0, 25).map((item) => ({
      id: tagValue(item, "guid") || tagValue(item, "link") || tagValue(item, "title"),
      title: tagValue(item, "title"),
      source: tagValue(item, "source") || "Google News",
      url: tagValue(item, "link"),
      publishedAt: tagValue(item, "pubDate"),
      summary: tagValue(item, "description").replace(/<[^>]+>/g, " "),
      language: "en",
      sentiment: null
    }));
  }
}

async function getSecFilings(cik) {
  const padded = String(cik || "").replace(/\D/g, "").padStart(10, "0");
  if (!padded || padded === "0000000000") return [];

  const data = await fetchJson(`https://data.sec.gov/submissions/CIK${padded}.json`);
  const recent = data?.filings?.recent;
  if (!recent?.accessionNumber) return [];

  return recent.accessionNumber.slice(0, 20).map((accession, index) => {
    const accessionClean = accession.replaceAll("-", "");
    const primary = recent.primaryDocument?.[index] || "";
    return {
      id: accession,
      form: recent.form?.[index],
      title: `${recent.form?.[index] || "SEC"} - ${recent.primaryDocDescription?.[index] || primary}`,
      filedAt: recent.filingDate?.[index],
      reportDate: recent.reportDate?.[index],
      url: `https://www.sec.gov/Archives/edgar/data/${Number(padded)}/${accessionClean}/${primary}`
    };
  });
}

function safeTicker(value) {
  return cleanText(value).toUpperCase().replace(/[^A-Z0-9.\-=]/g, "").slice(0, 24);
}

function fixedNumber(value, digits = 2) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "";
}

function movingAverageDelta(history, days, latest) {
  const rows = history.slice(-days).map((row) => Number(row.close)).filter(Number.isFinite);
  if (!rows.length || !Number.isFinite(Number(latest))) return "";
  const average = rows.reduce((sum, value) => sum + value, 0) / rows.length;
  return fixedNumber(Number(latest) - average, 2);
}

async function getStockPrice(tickerValue, range = "3y", interval = "1wk") {
  const ticker = safeTicker(tickerValue);
  if (!ticker) throw new Error("Missing ticker");
  const params = new URLSearchParams({
    range,
    interval,
    includePrePost: "false",
    events: "div,splits"
  });
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?${params}`, {
    accept: "application/json"
  });
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(data?.chart?.error?.description || `No quote data for ${ticker}`);

  const quote = result.indicators?.quote?.[0] || {};
  const history = (result.timestamp || []).map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString(),
    open: quote.open?.[index] ?? null,
    high: quote.high?.[index] ?? null,
    low: quote.low?.[index] ?? null,
    close: quote.close?.[index] ?? null,
    volume: quote.volume?.[index] ?? null
  })).filter((row) => Number.isFinite(Number(row.close)));

  const meta = result.meta || {};
  const latest = Number(meta.regularMarketPrice ?? history.at(-1)?.close);
  const previousClose = Number(meta.previousClose ?? history.at(-2)?.close ?? latest);
  const changeAmount = latest - previousClose;
  const change = previousClose ? (changeAmount / previousClose) * 100 : 0;
  const highs = history.map((row) => Number(row.high ?? row.close)).filter(Number.isFinite);
  const lows = history.map((row) => Number(row.low ?? row.close)).filter(Number.isFinite);
  const rangeHigh = highs.length ? Math.max(...highs) : latest;
  const rangeLow = lows.length ? Math.min(...lows) : latest;
  const rangeChange = history[0]?.close ? ((latest - Number(history[0].close)) / Number(history[0].close)) * 100 : change;
  const rangePosition = rangeHigh === rangeLow ? 50 : ((latest - rangeLow) / (rangeHigh - rangeLow)) * 100;
  const distanceFromHigh = rangeHigh ? ((latest - rangeHigh) / rangeHigh) * 100 : 0;

  return {
    ticker,
    price: fixedNumber(latest),
    change: fixedNumber(change),
    changeAmount: fixedNumber(changeAmount),
    open: fixedNumber(meta.regularMarketOpen ?? history.at(-1)?.open),
    high: fixedNumber(meta.regularMarketDayHigh ?? history.at(-1)?.high ?? rangeHigh),
    low: fixedNumber(meta.regularMarketDayLow ?? history.at(-1)?.low ?? rangeLow),
    previousClose: fixedNumber(previousClose),
    volume: Number(meta.regularMarketVolume ?? history.at(-1)?.volume ?? 0),
    currency: meta.currency || "",
    exchange: meta.exchangeName || meta.fullExchangeName || "",
    marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toLocaleDateString("zh-CN") : "",
    range,
    interval,
    rangeLow: fixedNumber(rangeLow),
    rangeHigh: fixedNumber(rangeHigh),
    rangeChange: fixedNumber(rangeChange),
    rangePosition: fixedNumber(rangePosition, 1),
    distanceFromHigh: fixedNumber(distanceFromHigh),
    ma50Delta: movingAverageDelta(history, 50, latest),
    ma100Delta: movingAverageDelta(history, 100, latest),
    ma200Delta: movingAverageDelta(history, 200, latest),
    history: history.map((row) => ({
      date: row.date,
      open: fixedNumber(row.open),
      high: fixedNumber(row.high),
      low: fixedNumber(row.low),
      close: fixedNumber(row.close),
      volume: Number(row.volume || 0)
    })),
    source: "Yahoo Finance",
    updatedAt: new Date().toISOString()
  };
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});

    if (url.pathname === "/api/bootstrap") {
      return sendJson(res, 200, {
        companies: defaultCompanies,
        items: defaultItems,
        lastFetchedAt: new Date().toISOString(),
        backend: "node-local"
      });
    }

    if (url.pathname === "/api/companies" && req.method === "POST") {
      const company = await readJsonBody(req);
      return sendJson(res, 200, { company, backend: "node-local" });
    }

    if (url.pathname === "/api/items" && req.method === "POST") {
      const payload = await readJsonBody(req);
      return sendJson(res, 200, { items: payload.items || [], backend: "node-local" });
    }

    if (url.pathname === "/api/codex-capture" && req.method === "POST") {
      const payload = await readJsonBody(req);
      const result = await codexCaptureLocal(payload);
      return sendJson(res, 200, result);
    }

    if (url.pathname === "/api/ask" && req.method === "POST") {
      const payload = await readJsonBody(req);
      const question = cleanText(payload.question);
      const company = payload.company || {};
      const answer = await generatePmAnswer(question, company, payload.items || []);
      return sendJson(res, 200, {
        answer,
        item: {
          id: `${company.id || "portfolio"}-ai-${Date.now()}`,
          companyId: company.id,
          type: "ai",
          title: `Andy PM问答：${question}`,
          summary: answer,
          source: "Andy PM",
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        backend: process.env.GOOGLE_AI_API_KEY ? "google-ai" : "node-local"
      });
    }

    if (url.pathname === "/api/process-note" && req.method === "POST") {
      const payload = await readJsonBody(req);
      const result = await processNoteLocal(payload);
      return sendJson(res, 200, result);
    }

    if (url.pathname === "/api/fetch-url" && req.method === "POST") {
      const payload = await readJsonBody(req);
      const result = await fetchUrlResourceLocal(payload.url);
      return sendJson(res, 200, result);
    }

    if (url.pathname === "/api/open-web") {
      const query = cleanText(url.searchParams.get("q"));
      if (!query) return sendJson(res, 400, { error: "Missing q" });
      const articles = await getOpenWebNews(query);
      return sendJson(res, 200, { articles, fetchedAt: new Date().toISOString() });
    }

    if (url.pathname === "/api/sec") {
      const cik = cleanText(url.searchParams.get("cik"));
      const filings = await getSecFilings(cik);
      return sendJson(res, 200, { filings, fetchedAt: new Date().toISOString() });
    }

    if (url.pathname === "/api/stock-price") {
      const result = await getStockPrice(
        url.searchParams.get("ticker"),
        cleanText(url.searchParams.get("range")) || "3y",
        cleanText(url.searchParams.get("interval")) || "1wk"
      );
      return sendJson(res, 200, result);
    }

    return sendJson(res, 404, { error: "Unknown API route" });
  } catch (error) {
    return sendJson(res, 502, { error: error.message || "Upstream request failed" });
  }
}

async function generatePmAnswer(question, company, items) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    const top = items[0]?.summary || "暂无足够资料";
    return `初步判断：围绕 ${company.ticker || company.name || "当前标的"}，最需要先核对的信息是：${top}。建议动作：补充资料、标记仓位影响，并在研究队列中记录下一步验证。`;
  }

  const model = process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash";
  const prompt = [
    "你是基金经理的投研助理 Andy PM Agent。",
    "请用中文，输出三段：1) 结论，2) 对仓位/估值/盈利假设的影响，3) 下一步待办。",
    `当前公司：${company.name || ""} ${company.ticker || ""}`,
    `用户问题：${question}`,
    "可用资料：",
    ...items.slice(0, 12).map((item, index) => `${index + 1}. [${item.type}/${item.source || ""}] ${item.title}: ${item.summary || ""}`)
  ].join("\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": process.env.GOOGLE_AI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 16384
      }
    })
  });

  if (!response.ok) throw new Error(`Google AI ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return cleanText(data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n")) || "AI 暂无返回。";
}

function portfolioImpactPrompt(title, source, companies) {
  const universe = (Array.isArray(companies) ? companies : [])
    .slice(0, 80)
    .map((company, index) => [
      `${index + 1}. ${company.name || company.ticker || "Unknown"} (${company.ticker || "N/A"})`,
      `类型：${company.portfolioStatus ? "Portfolio" : ""}${company.coverageStatus ? " Coverage" : ""}`.trim(),
      `行业：${company.industry || ""}`,
      `主题：${Array.isArray(company.topics) ? company.topics.join(" / ") : company.topics || ""}`,
      `仓位：${company.positionWeight || company.positionShares || ""}`,
      `备注：${company.universeNote || company.notes || ""}`
    ].filter(Boolean).join("；"))
    .join("\n");

  return [
    "你是基金经理的组合影响分析师。请只基于笔记整理稿，分析它对 Portfolio / Coverage 公司可能产生的正面或负面影响。",
    "硬性要求：",
    "- 逐个公司分析，优先覆盖 Portfolio 公司；如果 Coverage 公司明显相关也要写。",
    "- 必须按四个维度判断：上下游维度、替代（substitute）维度、竞争维度、可寻址市场（TAM）维度。",
    "- 每家公司必须明确方向：正面 / 负面 / 中性 / 不确定，并说明原因。",
    "- 不要编造笔记没有的信息；如果影响链条需要验证，标注为“待验证”。",
    "- 输出必须使用 Markdown，适合直接放在 Port 栏阅读。",
    "输出格式：",
    "## 组合影响总览",
    "- ...",
    "## 按公司影响",
    "### TICKER / 公司名",
    "- 总体影响：正面/负面/中性/不确定",
    "- 上下游：...",
    "- 替代：...",
    "- 竞争：...",
    "- TAM：...",
    "- 需要验证：...",
    "## 优先跟踪事项",
    "- ...",
    `标题：${title || "未命名笔记"}`,
    "Portfolio / Coverage 公司清单：",
    universe || "未导入 Portfolio / Coverage 公司。",
    "笔记整理稿：",
    source
  ].join("\n");
}

function noteProcessPrompt(title, source, task = "analyze", options = {}) {
  if (task === "translate") {
    return [
      "你是专业投研笔记整理员。你的任务不是只做字面翻译，而是把原始笔记完整整理成更易读、易分析的中文材料。",
      "硬性要求：",
      "- 必须覆盖原文的全部段落和要点，不能只提炼核心意思，不能省略例子、数字、限定条件、转折、引用和细节。",
      "- 原文是英文时，完整翻译为自然、易读、有逻辑的中文；原文已有中文时，做轻度润色、去噪和结构化整理，不改变含义。",
      "- 可以在不改变含义的前提下重排段落、补小标题、拆长句、整理列表，让材料更符合投研阅读习惯。",
      "- 保留所有公司名、人名、产品名、日期、金额、百分比、专有名词和关键英文术语；必要时在中文后用括号保留英文原词。",
      "- 不要新增投资判断，不要写 Facts/Opinion，不要写核心结论，不要添加原文没有的信息；这些留给“小分析师”。",
      "- 输出应是完整整理稿，不是摘要。按原文逻辑分段，每段表达完整、连贯，适合基金经理后续分析。",
      "- 如果原文很长，也要尽量完整整理到输出上限，不要自行压缩成摘要。",
      `标题：${title || "未命名笔记"}`,
      "原始笔记：",
      source
    ].join("\n");
  }

  if (task === "portfolio") {
    return portfolioImpactPrompt(title, source, options.companies);
  }

  return [
    "你是基金经理的投研笔记处理器。请把原始笔记清洗成易于分析、可归档、可复盘的中文材料。",
    "严格要求：不要编造原文没有的信息；事实和观点必须分开；所有内容必须使用 bullet points。",
    "Facts 只能写原文明确出现或可以直接引用的信息，例如数字、人物、公司、日期、交易、产品、事件、原文表述。",
    "Opinion / 判断 只能写作者观点、市场解读、投资含义、推论、风险判断或你的分析判断，并标明不确定性。",
    "每个 bullet 尽量短、具体、可复核。不要写大段落。",
    "每个 ## 标题必须独占一行；标题下面只能写 bullet points，不要写段落。",
    "输出格式必须严格如下：",
    "## 核心结论",
    "- ...",
    "## Facts（原文事实）",
    "- ...",
    "## Opinion / 判断（观点与推论）",
    "- ...",
    "## 重要数字与实体",
    "- ...",
    "## 待验证问题",
    "- ...",
    "## 可归档摘要",
    "- ...",
    `标题：${title || "未命名笔记"}`,
    "原始笔记：",
    source
  ].join("\n");
}

function envKeyForProvider(provider) {
  return {
    google: "GOOGLE_AI_API_KEY",
    openai: "OPENAI_API_KEY",
    glm: "GLM_API_KEY",
    minimax: "MINIMAX_API_KEY",
    mimo: "MIMO_API_KEY"
  }[provider];
}

async function processNoteLocal(payload) {
  const provider = cleanText(payload.provider);
  const model = cleanText(payload.model);
  const task = cleanText(payload.task) || "analyze";
  const source = String(payload.source || "").trim();
  if (!provider || !model || !source) throw new Error("Missing provider, model, or source");
  const keyName = envKeyForProvider(provider);
  const apiKey = cleanText(payload.apiKey) || process.env[keyName];
  if (!apiKey) throw new Error(`Missing API key. Set ${keyName}, or paste it in the processor panel.`);
  const prompt = noteProcessPrompt(cleanText(payload.title), source.slice(0, 120000), task, { companies: payload.companies || [] });
  const result = provider === "google"
    ? await callGoogleModel(apiKey, model, prompt)
    : provider === "openai"
      ? await callOpenAiResponses(apiKey, model, prompt, process.env.OPENAI_BASE_URL)
      : await callOpenAiCompatible(apiKey, model, prompt, {
        glm: process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        minimax: process.env.MINIMAX_BASE_URL || "https://api.minimax.io/v1/chat/completions",
        mimo: process.env.MIMO_BASE_URL || "https://api.mimo-v2.com/v1/chat/completions"
      }[provider], provider);
  return { result, provider, model, task, processedAt: new Date().toISOString() };
}

async function callGoogleModel(apiKey, model, prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 16384
      }
    })
  });
  if (!response.ok) throw new Error(`Google AI ${response.status}: ${await response.text().then(readableProviderError)}`);
  const data = await response.json();
  return cleanModelText(data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n")) || "模型暂无返回。";
}

async function callOpenAiResponses(apiKey, model, prompt, baseUrl = "https://api.openai.com/v1") {
  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: prompt, max_output_tokens: 16384 })
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text().then(readableProviderError)}`);
  const data = await response.json();
  return cleanModelText(data.output_text || data.output?.flatMap((item) => item.content || []).map((part) => part.text || part.output_text || "").join("\n")) || "模型暂无返回。";
}

async function callOpenAiCompatible(apiKey, model, prompt, endpoint, label) {
  const response = await fetch(normalizeChatCompletionsUrl(endpoint), {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "你是严谨的投研资料处理器，会严格遵守用户要求：整理时完整保留并优化可读性，分析时结构化拆解。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 16384
    })
  });
  if (!response.ok) throw new Error(`${label} ${response.status}: ${await response.text().then(readableProviderError)}`);
  const data = await response.json();
  return cleanModelText(data.choices?.[0]?.message?.content || data.output_text || data.text) || "模型暂无返回。";
}

function normalizeChatCompletionsUrl(value) {
  const url = cleanText(value).replace(/\/+$/, "");
  return /\/chat\/completions$/i.test(url) ? url : `${url}/chat/completions`;
}

function readableProviderError(text) {
  try {
    const data = JSON.parse(text);
    return cleanText(data.error?.message || data.error || data.message || text).slice(0, 800);
  } catch {
    return cleanText(text).slice(0, 800);
  }
}

async function handleStatic(req, res, url) {
  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const target = path.normalize(path.join(publicDir, requested));

  if (!target.startsWith(publicDir) || !existsSync(target)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(target);
  const file = await readFile(target);
  res.writeHead(200, { "content-type": mimeTypes[ext] || "application/octet-stream" });
  res.end(file);
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }
  await handleStatic(req, res, url);
}).listen(port, () => {
  console.log(`Investment intel workstation running at http://localhost:${port}`);
});
