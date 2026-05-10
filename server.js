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
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!response.ok) throw new Error(`Google AI ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return cleanText(data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n")) || "AI 暂无返回。";
}

function noteProcessPrompt(title, source, task = "analyze") {
  if (task === "translate") {
    return [
      "你是专业投研翻译员。请把原始笔记完整翻译成中文。",
      "要求：",
      "- 尽量保留原文全部信息、数字、公司名、人名、时间、术语和语气。",
      "- 不要总结，不要做投资分析，不要添加原文没有的信息。",
      "- 如果原文已有中文，可润色成更通顺的中文；英文术语可保留括号原文。",
      "- 按原文逻辑分段，输出易读中文。",
      `标题：${title || "未命名笔记"}`,
      "原始笔记：",
      source
    ].join("\n");
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
  const prompt = noteProcessPrompt(cleanText(payload.title), source.slice(0, 120000), task);
  const result = provider === "google"
    ? await callGoogleModel(apiKey, model, prompt)
    : provider === "openai"
      ? await callOpenAiResponses(apiKey, model, prompt, process.env.OPENAI_BASE_URL)
      : await callOpenAiCompatible(apiKey, model, prompt, {
        glm: process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        minimax: process.env.MINIMAX_BASE_URL || "https://api.minimax.io/v1/chat/completions",
        mimo: process.env.MIMO_BASE_URL || "https://api.mimo.ai/v1/chat/completions"
      }[provider], provider);
  return { result, provider, model, task, processedAt: new Date().toISOString() };
}

async function callGoogleModel(apiKey, model, prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  if (!response.ok) throw new Error(`Google AI ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return cleanModelText(data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n")) || "模型暂无返回。";
}

async function callOpenAiResponses(apiKey, model, prompt, baseUrl = "https://api.openai.com/v1") {
  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: prompt })
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return cleanModelText(data.output_text || data.output?.flatMap((item) => item.content || []).map((part) => part.text || part.output_text || "").join("\n")) || "模型暂无返回。";
}

async function callOpenAiCompatible(apiKey, model, prompt, endpoint, label) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "你是严谨的投研笔记清洗处理器。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    })
  });
  if (!response.ok) throw new Error(`${label} ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return cleanModelText(data.choices?.[0]?.message?.content || data.output_text || data.text) || "模型暂无返回。";
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
