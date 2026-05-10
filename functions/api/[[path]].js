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
    if (context.request.method === "OPTIONS") return cors(null, 204);
    if (route === "bootstrap" && context.request.method === "GET") return getBootstrap(context.env);
    if (route === "companies" && context.request.method === "POST") return upsertCompany(context);
    if (route === "items" && context.request.method === "POST") return upsertItems(context);
    if (route === "items" && context.request.method === "DELETE") return deleteItems(context);
    if (route === "ask" && context.request.method === "POST") return askPmAgent(context);
    if (route === "process-note" && context.request.method === "POST") return processNote(context);
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
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

function cors(body = null, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
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

function cleanHtmlText(value) {
  return cleanText(
    decodeXml(value)
      .replace(/<[^>]+>/g, " ")
      .replaceAll("\u00a0", " ")
  );
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

async function deleteItems(context) {
  const payload = await context.request.json().catch(() => ({}));
  const ids = Array.isArray(payload?.ids) ? payload.ids.filter(Boolean) : [];
  if (!ids.length) return json({ deleted: [] });
  if (!hasSupabase(context.env)) return json({ deleted: ids, backend: "local-fallback" });

  const encoded = ids.map((id) => `"${String(id).replaceAll('"', '\\"')}"`).join(",");
  await supabase(context.env, `intel_items?id=in.(${encoded})`, {
    method: "DELETE",
    headers: { prefer: "return=minimal" }
  });
  return json({ deleted: ids, backend: "supabase" });
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

function providerEnvKey(provider) {
  return {
    google: "GOOGLE_AI_API_KEY",
    openai: "OPENAI_API_KEY",
    glm: "GLM_API_KEY",
    minimax: "MINIMAX_API_KEY",
    mimo: "MIMO_API_KEY"
  }[provider];
}

function providerBaseUrl(env, provider) {
  return {
    glm: env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    minimax: env.MINIMAX_BASE_URL || "https://api.minimax.io/v1/chat/completions",
    mimo: env.MIMO_BASE_URL || "https://api.mimo.ai/v1/chat/completions"
  }[provider];
}

async function processNote(context) {
  const payload = await context.request.json();
  const provider = cleanText(payload.provider);
  const model = cleanText(payload.model);
  const title = cleanText(payload.title);
  const task = cleanText(payload.task) || "analyze";
  const source = String(payload.source || "").trim();
  if (!provider || !model || !source) return json({ error: "Missing provider, model, or source" }, 400);

  const envKey = providerEnvKey(provider);
  const apiKey = cleanText(payload.apiKey) || (envKey ? context.env[envKey] : "");
  if (!apiKey) return json({ error: `Missing API key. Set ${envKey || "provider API key"} in Cloudflare, or paste it in the processor panel.` }, 400);

  const prompt = noteProcessPrompt(title, source.slice(0, 120000), task);
  let result = "";
  if (provider === "google") {
    result = await callGoogleModel(apiKey, model, prompt);
  } else if (provider === "openai") {
    result = await callOpenAiResponses(apiKey, model, prompt, context.env.OPENAI_BASE_URL);
  } else {
    result = await callOpenAiCompatible(apiKey, model, prompt, providerBaseUrl(context.env, provider), provider);
  }

  return json({ result, model, provider, task, processedAt: new Date().toISOString() });
}

async function callGoogleModel(apiKey, model, prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  if (!response.ok) throw new Error(`Google AI ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return cleanModelText(data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n")) || "模型暂无返回。";
}

async function callOpenAiResponses(apiKey, model, prompt, baseUrl = "https://api.openai.com/v1") {
  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, input: prompt })
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return cleanModelText(
    data.output_text
    || data.output?.flatMap((item) => item.content || []).map((part) => part.text || part.output_text || "").join("\n")
  ) || "模型暂无返回。";
}

async function callOpenAiCompatible(apiKey, model, prompt, url, label) {
  if (!url) throw new Error(`${label} endpoint is not configured`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
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
  } catch (primaryError) {
    const rssParams = new URLSearchParams({ q: query, hl: "en-US", gl: "US", ceid: "US:en" });
    try {
      const xml = await fetchText(`https://news.google.com/rss/search?${rssParams}`);
      const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
      return json({
        articles: items.slice(0, 25).map((item) => ({
          id: tagValue(item, "guid") || tagValue(item, "link") || tagValue(item, "title"),
          title: cleanHtmlText(tagValue(item, "title")),
          source: tagValue(item, "source") || "Google News",
          url: tagValue(item, "link"),
          publishedAt: tagValue(item, "pubDate"),
          summary: cleanHtmlText(tagValue(item, "description")),
          language: "en",
          sentiment: null
        })),
        fetchedAt: new Date().toISOString(),
        backend: "google-news-rss"
      });
    } catch (fallbackError) {
      return json({
        articles: [],
        error: `Open internet unavailable: ${fallbackError.message || primaryError.message || "unknown error"}`,
        fetchedAt: new Date().toISOString(),
        backend: "open-web-empty"
      });
    }
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
