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
    if (route === "codex-capture" && context.request.method === "POST") return codexCapture(context);
    if (route === "ask" && context.request.method === "POST") return askPmAgent(context);
    if (route === "process-note" && context.request.method === "POST") return processNote(context);
    if (route === "daily-news-localize" && context.request.method === "POST") return localizeDailyNews(context);
    if (route === "fetch-url" && context.request.method === "POST") return fetchUrlResource(context);
    if (route === "open-web" && context.request.method === "GET") return getOpenWeb(url);
    if (route === "stock-price" && context.request.method === "GET") return getStockPrice(url);
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

function toDbCompany(company, includeUniverse = true) {
  const base = {
    id: company.id,
    name: company.name,
    ticker: company.ticker || null,
    cik: company.cik || null,
    topics: company.topics || [],
    notes: company.notes || "",
    updated_at: new Date().toISOString()
  };
  if (!includeUniverse) return base;
  return {
    ...base,
    industry: company.industry || null,
    universe_type: company.universeType || null,
    portfolio_status: company.portfolioStatus || null,
    coverage_status: company.coverageStatus || null,
    position_weight: company.positionWeight || null,
    position_shares: company.positionShares || null,
    cost_basis: company.costBasis || null,
    coverage_priority: company.coveragePriority || null,
    universe_note: company.universeNote || null
  };
}

function fromDbCompany(company) {
  return {
    ...company,
    universeType: company.universe_type || company.universeType || "",
    portfolioStatus: company.portfolio_status || company.portfolioStatus || "",
    coverageStatus: company.coverage_status || company.coverageStatus || "",
    positionWeight: company.position_weight || company.positionWeight || "",
    positionShares: company.position_shares || company.positionShares || "",
    costBasis: company.cost_basis || company.costBasis || "",
    coveragePriority: company.coverage_priority || company.coveragePriority || "",
    universeNote: company.universe_note || company.universeNote || ""
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
    await supabase(env, "companies?on_conflict=id", { method: "POST", body: JSON.stringify(defaultCompanies.map((company) => toDbCompany(company, false))) });
    await supabase(env, "intel_items?on_conflict=id", { method: "POST", body: JSON.stringify(defaultItems.map(toDbItem)) });
    return json({ companies: defaultCompanies, items: defaultItems, lastFetchedAt: new Date().toISOString(), backend: "supabase-seeded" });
  }

  return json({
    companies: companies.map(fromDbCompany),
    items: items.map(fromDbItem),
    lastFetchedAt: new Date().toISOString(),
    backend: "supabase"
  });
}

async function upsertCompany(context) {
  const company = await context.request.json();
  if (!company?.id || !company?.name) return json({ error: "Missing company id or name" }, 400);
  if (!hasSupabase(context.env)) return json({ company, backend: "local-fallback" });

  let rows;
  try {
    rows = await supabase(context.env, "companies?on_conflict=id", {
      method: "POST",
      body: JSON.stringify([toDbCompany(company)])
    });
  } catch (error) {
    rows = await supabase(context.env, "companies?on_conflict=id", {
      method: "POST",
      body: JSON.stringify([toDbCompany(company, false)])
    });
  }
  return json({ company: rows?.[0] ? fromDbCompany(rows[0]) : company, backend: "supabase" });
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

function captureToken(context, payload) {
  return cleanText(context.request.headers.get("x-codex-token"))
    || cleanText(context.request.headers.get("authorization")).replace(/^bearer\s+/i, "")
    || cleanText(payload?.token);
}

function validateCodexCapture(context, payload) {
  const expected = cleanText(context.env.CODEX_CAPTURE_TOKEN);
  if (!expected) return null;
  return captureToken(context, payload) === expected ? null : json({ error: "Codex capture token is missing or invalid" }, 401);
}

async function resolveCaptureCompany(env, payload) {
  const requestedId = cleanText(payload.companyId || payload.company_id);
  const ticker = safeTicker(payload.ticker || payload.symbol);
  const companyName = cleanText(payload.companyName || payload.company || payload.name);
  const industry = cleanText(payload.industry || payload.sector);

  if (!hasSupabase(env)) {
    const id = requestedId || slugId(ticker || companyName || "codex-inbox");
    return ticker || companyName ? { id, ticker, name: companyName || ticker, industry } : null;
  }

  const companies = await supabase(env, "companies?select=*&order=created_at.asc");
  const matched = companies.map(fromDbCompany).find((company) => {
    const companyTicker = cleanText(company.ticker).toUpperCase();
    return (requestedId && company.id === requestedId)
      || (ticker && companyTicker === ticker)
      || (companyName && cleanText(company.name).toLowerCase() === companyName.toLowerCase());
  });
  if (matched) return matched;
  if (!ticker && !companyName) return null;

  const company = {
    id: requestedId || slugId(ticker || companyName),
    name: companyName || ticker,
    ticker,
    cik: "",
    topics: [],
    notes: "",
    industry,
    universeType: "coverage",
    coverageStatus: "covered"
  };
  const rows = await supabase(env, "companies?on_conflict=id", {
    method: "POST",
    body: JSON.stringify([toDbCompany(company)])
  });
  return rows?.[0] ? fromDbCompany(rows[0]) : company;
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

async function codexCapture(context) {
  const payload = await context.request.json().catch(() => ({}));
  const unauthorized = validateCodexCapture(context, payload);
  if (unauthorized) return unauthorized;

  const url = cleanText(payload.url);
  const hasProvidedText = Boolean(cleanText(payload.text || payload.content || payload.markdown || payload.sourceText));
  if (!url && !hasProvidedText) return json({ error: "请提供 url，或直接提供 text/content 正文。" }, 400);

  const company = await resolveCaptureCompany(context.env, payload);
  let resource = {};
  if (url && !hasProvidedText) {
    resource = await fetchUrlPayload(url);
  } else if (url) {
    try {
      resource = await fetchUrlPayload(url);
    } catch {
      resource = { url, source: new URL(url).hostname.replace(/^www\./, "") };
    }
  }

  const item = captureItemFromPayload(payload, company, resource);
  if (hasSupabase(context.env)) {
    const rows = await supabase(context.env, "intel_items?on_conflict=id", {
      method: "POST",
      body: JSON.stringify([toDbItem(item)])
    });
    return json({ item: rows?.[0] ? fromDbItem(rows[0]) : item, company, backend: "supabase" });
  }

  return json({ item, company, backend: "local-fallback" });
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
  if (task === "deep-research") {
    const questions = Array.isArray(options.questions) ? options.questions : [];
    const existingAnswers = options.existingAnswers || {};
    return [
      "你是基金经理的单公司深度研究分析师。请严格按照给定 checklist，对目标公司逐项生成深研初稿。",
      "硬性要求：",
      "- 只基于输入的公司资料、笔记、已有答案和用户特别关注，不要编造没有依据的信息。",
      "- 每个问题都必须回答；如果资料不足，明确写“资料不足 / 待验证”，并说明还需要什么材料。",
      "- 答案要适合基金经理阅读：事实、判断、风险和待验证点清楚分开。",
      "- 如果用户给了特别关注，优先在相关问题中体现。",
      "- 只返回 JSON，不要 Markdown，不要代码块。",
      "JSON 格式必须是：",
      "{\"answers\":{\"q1\":\"...\",\"q2\":\"...\"}}",
      `目标公司：${options.company?.name || ""} ${options.company?.ticker || ""}`,
      `本次特别关注：${options.focus || "无"}`,
      "Checklist：",
      questions.map((question, index) => `q${index + 1}. ${question}`).join("\n"),
      "已有答案：",
      JSON.stringify(existingAnswers).slice(0, 30000),
      "公司资料：",
      source
    ].join("\n");
  }

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
    mimo: env.MIMO_BASE_URL || "https://api.mimo-v2.com/v1/chat/completions"
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

  const prompt = noteProcessPrompt(title, source.slice(0, 120000), task, {
    companies: payload.companies || [],
    company: payload.company || {},
    focus: payload.focus || "",
    questions: payload.questions || [],
    existingAnswers: payload.existingAnswers || {}
  });
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

async function localizeDailyNews(context) {
  const payload = await context.request.json().catch(() => ({}));
  const items = Array.isArray(payload.items) ? payload.items.slice(0, 100) : [];
  if (!items.length) return json({ items: [], categorySummaries: {} });
  const apiKey = cleanText(payload.apiKey) || context.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return json(localizeDailyNewsFallback(items, "Missing GOOGLE_AI_API_KEY"));
  }

  const prompt = [
    "你是基金经理的中文新闻晨报编辑。请把英文新闻标题翻译成简洁自然的中文，并按分类生成今日中文总结。",
    "要求：",
    "- 只基于输入新闻，不要编造新事实。",
    "- 标题翻译保留公司名、产品名、金额、百分比、模型名等专有名词。",
    "- 中文标题要像财经新闻标题，短而清楚。",
    "- 每个分类总结 1-2 句中文，说明今日主线、重要事实和需要跟踪的投研含义。",
    "- 只返回 JSON，不要 Markdown，不要代码块。",
    "JSON 格式：",
    "{\"items\":[{\"id\":\"...\",\"zhTitle\":\"...\"}],\"categorySummaries\":{\"科技资讯\":\"...\"}}",
    "输入新闻：",
    JSON.stringify(items.map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      summary: item.summary,
      source: item.source
    }))).slice(0, 80000)
  ].join("\n");

  try {
    const text = await callGoogleModel(apiKey, "gemini-3.1-flash-lite", prompt);
    const parsed = parseJsonObject(text);
    return json({
      items: Array.isArray(parsed.items) ? parsed.items : [],
      categorySummaries: parsed.categorySummaries || {},
      backend: "gemini"
    });
  } catch (error) {
    return json(localizeDailyNewsFallback(items, error.message || "Gemini localization failed"));
  }
}

function localizeDailyNewsFallback(items, error = "") {
  const categoryRows = {};
  const localizedItems = items.map((item) => {
    const zhTitle = localizeTitleFallback(item.title);
    const category = item.category || "未分类";
    if (!categoryRows[category]) categoryRows[category] = [];
    if (categoryRows[category].length < 3) categoryRows[category].push(zhTitle);
    return { id: item.id, zhTitle };
  });
  const categorySummaries = Object.fromEntries(Object.entries(categoryRows).map(([category, titles]) => [
    category,
    `${category}今日主要关注：${titles.join("；")}。需要继续跟踪对相关公司、行业格局和盈利预期的影响。`
  ]));
  return { items: localizedItems, categorySummaries, backend: "fallback", error };
}

function localizeTitleFallback(value) {
  let title = cleanHtmlText(value || "");
  if (/[\u4e00-\u9fff]/.test(title)) return title;
  [
    [/latest/gi, "最新"],
    [/news/gi, "新闻"],
    [/analysis/gi, "分析"],
    [/earnings/gi, "财报"],
    [/revenue/gi, "收入"],
    [/guidance/gi, "指引"],
    [/partnership/gi, "合作"],
    [/funding/gi, "融资"],
    [/startup/gi, "初创公司"],
    [/markets?/gi, "市场"],
    [/business/gi, "商业"],
    [/stock/gi, "股票"],
    [/semiconductor/gi, "半导体"],
    [/chip/gi, "芯片"],
    [/cloud/gi, "云"],
    [/model/gi, "模型"],
    [/release/gi, "发布"],
    [/benchmark/gi, "基准测试"],
    [/agent/gi, "智能体"],
    [/\bAI\b/g, "AI"],
    [/crypto/gi, "加密"],
    [/payment/gi, "支付"],
    [/gaming/gi, "游戏"],
    [/advertising/gi, "广告"],
    [/media/gi, "媒体"]
  ].forEach(([pattern, replacement]) => {
    title = title.replace(pattern, replacement);
  });
  return title;
}

function parseJsonObject(text) {
  const raw = String(text || "").replace(/^```json\s*|\s*```$/g, "").trim();
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return {};
    return JSON.parse(match[0]);
  }
}

async function callGoogleModel(apiKey, model, prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey
    },
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
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, input: prompt, max_output_tokens: 16384 })
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text().then(readableProviderError)}`);
  const data = await response.json();
  return cleanModelText(
    data.output_text
    || data.output?.flatMap((item) => item.content || []).map((part) => part.text || part.output_text || "").join("\n")
  ) || "模型暂无返回。";
}

async function callOpenAiCompatible(apiKey, model, prompt, url, label) {
  if (!url) throw new Error(`${label} endpoint is not configured`);
  const response = await fetch(normalizeChatCompletionsUrl(url), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
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

async function fetchUrlResource(context) {
  const payload = await context.request.json().catch(() => ({}));
  const target = cleanText(payload.url);
  if (!/^https?:\/\//i.test(target)) return json({ error: "请输入 http 或 https 开头的链接" }, 400);
  try {
    return json(await fetchUrlPayload(target));
  } catch (error) {
    return json({ error: error.message || "无法读取链接" }, 400);
  }
}

async function fetchUrlPayload(targetValue) {
  const target = cleanText(targetValue);
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

async function getStockPrice(url) {
  const ticker = safeTicker(url.searchParams.get("ticker"));
  const range = cleanText(url.searchParams.get("range")) || "3y";
  const interval = cleanText(url.searchParams.get("interval")) || "1wk";
  if (!ticker) return json({ error: "Missing ticker" }, 400);

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
  if (!result) {
    const message = data?.chart?.error?.description || `No quote data for ${ticker}`;
    return json({ error: message }, 404);
  }

  const quote = result.indicators?.quote?.[0] || {};
  const timestamps = result.timestamp || [];
  const history = timestamps.map((timestamp, index) => ({
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

  return json({
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
  });
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
