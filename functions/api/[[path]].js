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

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const route = url.pathname.replace(/^\/api\/?/, "") || "bootstrap";

  try {
    if (context.request.method === "OPTIONS") return json({}, 204);
    if (route === "bootstrap" && context.request.method === "GET") return getBootstrap(context.env);
    if (route === "companies" && context.request.method === "POST") return upsertCompany(context);
    if (route === "items" && context.request.method === "POST") return upsertItems(context);
    if (route === "ask" && context.request.method === "POST") return askPmAgent(context);
    if (route === "open-web" && context.request.method === "GET") return getOpenWeb(url);
    if (route === "sec" && context.request.method === "GET") return getSec(url);
    return json({ error: "Unknown API route" }, 404);
  } catch (error) {
    return json({ error: error.message || "Request failed" }, 500);
  }
}

function sample(companyId, type, title, summary, source, publishedAt) {
  return { id: `${companyId}-${title}`, companyId, type, title, summary, source, publishedAt, createdAt: publishedAt };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function hasSupabase(env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabase(env, path, init = {}) {
  if (!hasSupabase(env)) throw new Error("Supabase is not configured");
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      prefer: "return=representation,resolution=merge-duplicates",
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase ${response.status}: ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function toDbItem(item) {
  return {
    id: item.id,
    company_id: item.companyId || item.company_id,
    type: item.type,
    title: item.title,
    summary: item.summary || "",
    source: item.source || null,
    url: item.url || null,
    form: item.form || null,
    published_at: item.publishedAt || item.published_at || item.createdAt || null,
    raw: item
  };
}

function fromDbItem(item) {
  return {
    ...(item.raw || {}),
    id: item.id,
    companyId: item.company_id,
    type: item.type,
    title: item.title,
    summary: item.summary,
    source: item.source,
    url: item.url,
    form: item.form,
    publishedAt: item.published_at,
    createdAt: item.created_at
  };
}

async function getBootstrap(env) {
  if (!hasSupabase(env)) {
    return json({ companies: defaultCompanies, items: defaultItems, lastFetchedAt: new Date().toISOString(), backend: "local-fallback" });
  }

  const [companies, items] = await Promise.all([
    supabase(env, "companies?select=*&order=created_at.asc"),
    supabase(env, "intel_items?select=*&order=published_at.desc.nullslast&limit=600")
  ]);

  if (!companies.length) {
    await supabase(env, "companies?on_conflict=id", { method: "POST", body: JSON.stringify(defaultCompanies) });
    await supabase(env, "intel_items?on_conflict=id", { method: "POST", body: JSON.stringify(defaultItems.map(toDbItem)) });
    return json({ companies: defaultCompanies, items: defaultItems, lastFetchedAt: new Date().toISOString(), backend: "supabase-seeded" });
  }

  return json({
    companies,
    items: items.map(fromDbItem),
    lastFetchedAt: new Date().toISOString(),
    backend: "supabase"
  });
}

async function upsertCompany(context) {
  const company = await context.request.json();
  if (!company?.id || !company?.name) return json({ error: "Missing company id or name" }, 400);
  if (!hasSupabase(context.env)) return json({ company, backend: "local-fallback" });

  const rows = await supabase(context.env, "companies?on_conflict=id", {
    method: "POST",
    body: JSON.stringify([{ ...company, updated_at: new Date().toISOString() }])
  });
  return json({ company: rows?.[0] || company, backend: "supabase" });
}

async function upsertItems(context) {
  const payload = await context.request.json();
  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (!items.length) return json({ items: [] });
  if (!hasSupabase(context.env)) return json({ items, backend: "local-fallback" });

  const rows = await supabase(context.env, "intel_items?on_conflict=id", {
    method: "POST",
    body: JSON.stringify(items.map(toDbItem))
  });
  return json({ items: rows.map(fromDbItem), backend: "supabase" });
}

async function askPmAgent(context) {
  const payload = await context.request.json();
  const question = cleanText(payload.question);
  if (!question) return json({ error: "Missing question" }, 400);

  const company = payload.company || {};
  const items = (payload.items || []).slice(0, 12);
  const answer = await generatePmAnswer(context.env, question, company, items);
  const item = {
    id: `${company.id || "portfolio"}-ai-${Date.now()}`,
    companyId: company.id,
    type: "ai",
    title: `Andy PM问答：${question}`,
    summary: answer,
    source: "Andy PM",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  if (hasSupabase(context.env)) {
    await supabase(context.env, "intel_items?on_conflict=id", { method: "POST", body: JSON.stringify([toDbItem(item)]) });
  }

  return json({ item, answer, backend: context.env.GOOGLE_AI_API_KEY ? "google-ai" : "rules-fallback" });
}

async function generatePmAnswer(env, question, company, items) {
  if (!env.GOOGLE_AI_API_KEY) {
    const top = items[0]?.summary || "暂无足够资料";
    return `初步判断：围绕 ${company.ticker || company.name || "当前标的"}，最需要先核对的信息是：${top}。建议动作：补充资料、标记仓位影响，并在研究队列中记录下一步验证。`;
  }

  const model = env.GOOGLE_AI_MODEL || "gemini-2.5-flash";
  const prompt = [
    "你是基金经理的投研助理 Andy PM Agent。",
    "请用中文，输出三段：1) 结论，2) 对仓位/估值/盈利假设的影响，3) 下一步待办。",
    `当前公司：${company.name || ""} ${company.ticker || ""}`,
    `用户问题：${question}`,
    "可用资料：",
    ...items.map((item, index) => `${index + 1}. [${item.type}/${item.source || ""}] ${item.title}: ${item.summary || ""}`)
  ].join("\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": env.GOOGLE_AI_API_KEY
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!response.ok) throw new Error(`Google AI ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return cleanText(data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n")) || "AI 暂无返回。";
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers: { "user-agent": "AndyWorkstation/0.1", ...headers } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchText(url, headers = {}) {
  const response = await fetch(url, { headers: { "user-agent": "AndyWorkstation/0.1", ...headers } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function decodeXml(value) {
  return cleanText(value).replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"").replaceAll("&#39;", "'");
}

function tagValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1].replace(/^<!\[CDATA\[|\]\]>$/g, "")) : "";
}

async function getOpenWeb(url) {
  const query = cleanText(url.searchParams.get("q"));
  if (!query) return json({ error: "Missing q" }, 400);

  try {
    const params = new URLSearchParams({ query: `"${query}"`, mode: "ArtList", format: "json", maxrecords: "25", sort: "DateDesc" });
    const data = await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`);
    return json({
      articles: (data.articles || []).map((article) => ({
        id: article.url || `${article.title}-${article.seendate}`,
        title: cleanText(article.title),
        source: cleanText(article.domain || "Open web"),
        url: article.url,
        publishedAt: article.seendate,
        summary: cleanText(article.snippet || article.title),
        language: article.language,
        sentiment: Number.isFinite(article.tone) ? article.tone : null
      })),
      fetchedAt: new Date().toISOString()
    });
  } catch {
    const rssParams = new URLSearchParams({ q: query, hl: "en-US", gl: "US", ceid: "US:en" });
    const xml = await fetchText(`https://news.google.com/rss/search?${rssParams}`);
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    return json({
      articles: items.slice(0, 25).map((item) => ({
        id: tagValue(item, "guid") || tagValue(item, "link") || tagValue(item, "title"),
        title: tagValue(item, "title"),
        source: tagValue(item, "source") || "Google News",
        url: tagValue(item, "link"),
        publishedAt: tagValue(item, "pubDate"),
        summary: tagValue(item, "description").replace(/<[^>]+>/g, " "),
        language: "en",
        sentiment: null
      })),
      fetchedAt: new Date().toISOString()
    });
  }
}

async function getSec(url) {
  const padded = String(url.searchParams.get("cik") || "").replace(/\D/g, "").padStart(10, "0");
  if (!padded || padded === "0000000000") return json({ filings: [], fetchedAt: new Date().toISOString() });

  const data = await fetchJson(`https://data.sec.gov/submissions/CIK${padded}.json`);
  const recent = data?.filings?.recent;
  const filings = recent?.accessionNumber ? recent.accessionNumber.slice(0, 20).map((accession, index) => {
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
  }) : [];
  return json({ filings, fetchedAt: new Date().toISOString() });
}
