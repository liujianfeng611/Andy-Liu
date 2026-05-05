const storageKey = "investment-intel-workstation-v2";

const defaultState = {
  activeCompanyId: "amzn",
  companies: [
    { id: "amzn", name: "Amazon.com Inc.", ticker: "AMZN", cik: "0001018724", topics: ["AI", "AWS", "retail margin", "agent commerce"], notes: "" },
    { id: "msft", name: "Microsoft Corporation", ticker: "MSFT", cik: "0000789019", topics: ["Azure", "Copilot", "OpenAI", "enterprise demand"], notes: "" },
    { id: "nvda", name: "NVIDIA Corporation", ticker: "NVDA", cik: "0001045810", topics: ["AI capex", "data center", "gross margin"], notes: "" },
    { id: "pltr", name: "Palantir Technologies", ticker: "PLTR", cik: "0001321655", topics: ["AIP", "government", "commercial"], notes: "" }
  ],
  items: [
    sample("amzn", "open", "Amazon Launches Supply Chain Service for Sellers", "Amazon is expanding seller tools into logistics orchestration; watch fulfillment margin and seller adoption.", "AMZN", "2026-05-04T21:45:00"),
    sample("msft", "open", "OpenAI与私募股权公司敲定价值100亿美元合作", "微软生态的企业AI渗透继续扩展，关注 Azure 训练/推理负载与渠道转化。", "MSFT", "2026-05-04T21:03:00"),
    sample("nvda", "open", "AI Infra：为何推理优化在2026年成为主线", "推理需求、内存带宽与网络互联仍是半导体 Agent 的核心监控项。", "NVDA", "2026-05-04T20:00:00"),
    sample("pltr", "local", "Information on Palantir", "本地纪要显示 AIP bootcamp 转化率改善，需和合同公告交叉验证。", "Palantir", "2026-05-04T19:00:00"),
    sample("amzn", "local", "EchoTik：2026年第一季度TikTok Shop观察", "跨境电商与广告预算迁移对 Amazon marketplace 形成对照样本。", "AMZN", "2026-05-04T16:14:00")
  ],
  lastFetchedAt: "2026-05-04T19:02:00"
};

const workflowStages = [
  {
    id: "triage",
    label: "1 信息分诊",
    metric: "18条",
    title: "公开互联网 / 订阅资料 / 本地文件",
    detail: "把新增信息按公司、主题、来源可信度和时效性进入队列。"
  },
  {
    id: "impact",
    label: "2 持仓影响",
    metric: "+35bps",
    title: "估值、盈利、情绪、仓位",
    detail: "把事件映射到 EPS、multiple、position sizing 和风险预算。"
  },
  {
    id: "catalyst",
    label: "3 催化剂日历",
    metric: "7天",
    title: "财报、产品、政策、供应链",
    detail: "给每个持仓维护下一次验证窗口和预期差。"
  },
  {
    id: "decision",
    label: "4 动作记录",
    metric: "待确认",
    title: "加仓 / 减仓 / 对冲 / 观察",
    detail: "把判断沉淀为可复盘的投资动作，而不是只停留在阅读。"
  }
];

const regionalMarkets = [
  { name: "🇺🇸 美国", quotes: [["S&P 500", "7,228", "-0.02"], ["Dow", "49,293", "-0.42"], ["Nasdaq", "25,130", "+0.06"]] },
  { name: "🇭🇰 中港", quotes: [["恒生", "26,096", "+1.24"], ["恒生科技", "4.87", "+2.05"], ["上证", "4,112", "+0.11"]] },
  { name: "🇯🇵 日韩", quotes: [["日经225", "59,513", "+0.38"], ["KOSPI", "6,927", "+4.97"]] },
  { name: "🇮🇳 印度", quotes: [["India 50", "43.3", "-0.59"], ["MSCI India", "48.9", "-0.45"]] },
  { name: "🇪🇺 欧洲", quotes: [["DAX", "24,206", "-0.36"], ["FTSE 100", "10,364", "-0.14"]] }
];

const assetMarkets = [
  ["WTI 原油", "102", "+0.13"],
  ["黄金", "4,574", "-1.52"],
  ["铜", "590", "-1.35"],
  ["天然气", "2.86", "+2.70"],
  ["美元指数", "98.2", "+0.16"],
  ["EUR/USD", "1.17", "-0.05"]
];

const queueTemplates = [
  "核对最新公开信息是否改变收入/利润假设",
  "把关键研报或会议纪要导入资料入口",
  "记录仓位动作：加仓、减仓、对冲或继续观察",
  "更新下一次财报/产品/政策催化剂"
];

let state = loadState();
let backendStatus = "local";

const els = {
  noteStream: document.querySelector("#noteStream"),
  briefList: document.querySelector("#briefList"),
  workflowGrid: document.querySelector("#workflowGrid"),
  impactMatrix: document.querySelector("#impactMatrix"),
  researchQueue: document.querySelector("#researchQueue"),
  regionalMarkets: document.querySelector("#regionalMarkets"),
  assetMarkets: document.querySelector("#assetMarkets"),
  companyList: document.querySelector("#companyList"),
  companyNameInput: document.querySelector("#companyNameInput"),
  tickerInput: document.querySelector("#tickerInput"),
  cikInput: document.querySelector("#cikInput"),
  topicsInput: document.querySelector("#topicsInput"),
  activeTicker: document.querySelector("#activeTicker"),
  saveCompanyBtn: document.querySelector("#saveCompanyBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  fileInput: document.querySelector("#fileInput"),
  noteInput: document.querySelector("#noteInput"),
  saveNoteBtn: document.querySelector("#saveNoteBtn"),
  addCompanyBtn: document.querySelector("#addCompanyBtn"),
  companyDialog: document.querySelector("#companyDialog"),
  confirmAddCompany: document.querySelector("#confirmAddCompany"),
  newCompanyName: document.querySelector("#newCompanyName"),
  newTicker: document.querySelector("#newTicker"),
  newCik: document.querySelector("#newCik"),
  lastUpdate: document.querySelector("#lastUpdate"),
  askForm: document.querySelector("#askForm"),
  askInput: document.querySelector("#askInput")
};

function sample(companyId, type, title, summary, source, publishedAt) {
  return {
    id: `${companyId}-${title}`,
    companyId,
    type,
    title,
    summary,
    source,
    publishedAt,
    createdAt: publishedAt
  };
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored?.companies?.length) return stored;
  } catch {
    return structuredClone(defaultState);
  }
  return structuredClone(defaultState);
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function mergeById(localRows, remoteRows) {
  const rows = new Map();
  [...remoteRows, ...localRows].forEach((row) => {
    if (row?.id) rows.set(row.id, row);
  });
  return [...rows.values()];
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function api(path, options = {}) {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || response.statusText);
  }

  return response.json();
}

async function syncFromBackend() {
  try {
    const data = await api("bootstrap");
    if (data.companies?.length) {
      state = {
        ...state,
        companies: mergeById(state.companies, data.companies),
        items: data.items?.length ? mergeById(state.items, data.items) : state.items,
        activeCompanyId: state.activeCompanyId || data.companies[0].id,
        lastFetchedAt: data.lastFetchedAt || state.lastFetchedAt
      };
      if (!state.companies.some((company) => company.id === state.activeCompanyId)) {
        state.activeCompanyId = state.companies[0].id;
      }
      backendStatus = data.backend || "api";
      saveState();
      render();
    }
  } catch (error) {
    backendStatus = "local";
    console.warn("Using local workstation data:", error.message);
  }
}

async function persistCompany(company) {
  try {
    await api("companies", { method: "POST", body: JSON.stringify(company) });
  } catch (error) {
    console.warn("Company saved locally only:", error.message);
  }
}

async function persistItems(items) {
  try {
    await api("items", { method: "POST", body: JSON.stringify({ items }) });
  } catch (error) {
    console.warn("Items saved locally only:", error.message);
  }
}

function activeCompany() {
  return state.companies.find((company) => company.id === state.activeCompanyId) || state.companies[0];
}

function activeItems() {
  const activeId = activeCompany().id;
  return state.items
    .filter((item) => item.companyId === activeId || item.type === "local")
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
}

function formatTime(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "刚刚";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${min}`;
}

function companyQuery(company) {
  return [company.name, company.ticker].filter(Boolean).join(" ");
}

function addItems(items) {
  const known = new Set(state.items.map((item) => item.id));
  const fresh = items.filter((item) => item.id && !known.has(item.id));
  state.items = [...fresh, ...state.items].slice(0, 600);
  state.lastFetchedAt = new Date().toISOString();
  saveState();
  render();
  persistItems(fresh);
}

function renderNotes() {
  const rows = [...state.items]
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)))
    .slice(0, 18);

  els.noteStream.innerHTML = rows.map((item) => `
    <article class="note-item">
      <div class="note-title">${escapeHtml(item.title)}</div>
      <div class="note-meta">
        <span>${escapeHtml(formatTime(item.publishedAt || item.createdAt))}</span>
        <span class="tag">${escapeHtml(item.source || item.form || "OPEN")}</span>
      </div>
    </article>
  `).join("");
}

function briefLine(item, index) {
  const side = index === 0 ? "多头证据" : index === 1 ? "空头信号" : index === 2 ? "基本面" : "待验证";
  const source = item.type === "filing" ? "sec agent" : item.type === "local" ? "local analyst" : "daily analyst";
  return `
    <li>
      <span class="brief-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="source-chip">${source}</span>
      <div class="brief-copy">
        <strong>${escapeHtml(source)}</strong>
        <p>${escapeHtml(side)}：${escapeHtml(item.summary || item.title)}</p>
      </div>
    </li>
  `;
}

function renderBrief() {
  const rows = activeItems().slice(0, 4);
  const fallback = [
    sample("amzn", "open", "TEAM Q1收入加速至28%", "估值仅13x，Rovo Agent 被集成进逻辑，指引强。", "daily analyst", new Date().toISOString()),
    sample("amzn", "open", "Claude Code GitHub提交持续渗透", "开发工作流直接抢占生态，关注中间件价值。", "daily analyst", new Date().toISOString()),
    sample("amzn", "open", "Azure AI业务继续扩张", "AI业务370亿，Fabric客户+60%，数据权重增强。", "daily analyst", new Date().toISOString()),
    sample("amzn", "local", "资料库等待更新", "导入你的研报、纪要、模型后会进入这里。", "local analyst", new Date().toISOString())
  ];
  els.briefList.innerHTML = (rows.length ? rows : fallback).map(briefLine).join("");
  els.lastUpdate.textContent = new Date(state.lastFetchedAt || Date.now()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function renderMarkets() {
  els.regionalMarkets.innerHTML = regionalMarkets.map((region) => `
    <div class="market-region">
      <div class="region-title">${escapeHtml(region.name)}</div>
      ${region.quotes.map(quoteRow).join("")}
    </div>
  `).join("");

  els.assetMarkets.innerHTML = assetMarkets.map(quoteRow).join("");
}

function renderWorkflow() {
  const company = activeCompany();
  const items = activeItems();
  const topic = company.topics?.[0] || "核心主题";
  const docs = items.filter((item) => item.type === "local").length;
  const filings = items.filter((item) => item.type === "filing").length;
  const dynamicStages = workflowStages.map((stage) => ({ ...stage }));
  dynamicStages[0].metric = backendStatus === "local" ? `${items.length}条` : "云端";
  dynamicStages[1].metric = company.ticker || "组合";
  dynamicStages[1].detail = `当前主线：${topic}。把最新事件转成多头证据、空头信号和仓位影响。`;
  dynamicStages[2].metric = `${filings || 7}项`;
  dynamicStages[3].metric = docs ? `${docs}份资料` : "待记录";

  els.workflowGrid.innerHTML = dynamicStages.map((stage) => `
    <article class="workflow-step">
      <div class="workflow-top">
        <span>${escapeHtml(stage.label)}</span>
        <strong>${escapeHtml(stage.metric)}</strong>
      </div>
      <h3>${escapeHtml(stage.title)}</h3>
      <p>${escapeHtml(stage.detail)}</p>
    </article>
  `).join("");
}

function renderPmBoard() {
  const rows = state.companies.map((company) => {
    const rowsForCompany = state.items.filter((item) => item.companyId === company.id);
    const latest = rowsForCompany[0];
    const localDocs = rowsForCompany.filter((item) => item.type === "local").length;
    const filings = rowsForCompany.filter((item) => item.type === "filing").length;
    const status = filings ? "需复核" : localDocs ? "有资料" : latest ? "观察" : "待补全";
    const impact = filings ? "高" : latest ? "中" : "低";
    return `
      <div class="impact-row">
        <strong>${escapeHtml(company.ticker || company.name)}</strong>
        <span>${escapeHtml(impact)}</span>
        <span>${escapeHtml(status)}</span>
        <em>${escapeHtml(company.topics?.[0] || "主题待定")}</em>
      </div>
    `;
  }).join("");

  els.impactMatrix.innerHTML = `
    <div class="impact-head"><span>标的</span><span>影响</span><span>状态</span><span>主线</span></div>
    ${rows}
  `;

  const company = activeCompany();
  els.researchQueue.innerHTML = queueTemplates.map((task, index) => `
    <label class="queue-item">
      <input type="checkbox" ${index === 0 ? "checked" : ""} />
      <span>${escapeHtml(company.ticker || company.name)}：${escapeHtml(task)}</span>
    </label>
  `).join("");
}

function quoteRow([name, value, change]) {
  const cls = change.startsWith("+") ? "up" : "down";
  return `<div class="quote-row"><span>${escapeHtml(name)}</span><strong>${escapeHtml(value)}</strong><span class="${cls}">${escapeHtml(change)}%</span></div>`;
}

function renderCompanies() {
  els.companyList.innerHTML = state.companies.map((company) => `
    <button class="company-pill ${company.id === state.activeCompanyId ? "active" : ""}" data-company="${company.id}">
      ${escapeHtml(company.ticker || company.name)}
    </button>
  `).join("");

  document.querySelectorAll("[data-company]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCompanyId = button.dataset.company;
      saveState();
      render();
    });
  });
}

function renderEditor() {
  const company = activeCompany();
  els.activeTicker.textContent = company.ticker || "公司";
  els.companyNameInput.value = company.name || "";
  els.tickerInput.value = company.ticker || "";
  els.cikInput.value = company.cik || "";
  els.topicsInput.value = (company.topics || []).join(", ");
  els.noteInput.value = company.notes || "";
}

function render() {
  renderNotes();
  renderBrief();
  renderWorkflow();
  renderPmBoard();
  renderMarkets();
  renderCompanies();
  renderEditor();
}

async function refreshOpenInfo() {
  const company = activeCompany();
  els.refreshBtn.disabled = true;
  els.refreshBtn.textContent = "刷新中";

  try {
    const [newsResponse, secResponse] = await Promise.all([
      fetch(`/api/open-web?q=${encodeURIComponent(companyQuery(company))}`).then((res) => res.json()),
      company.cik ? fetch(`/api/sec?cik=${encodeURIComponent(company.cik)}`).then((res) => res.json()) : Promise.resolve({ filings: [] })
    ]);

    const openItems = (newsResponse.articles || []).map((article) => ({
      ...article,
      companyId: company.id,
      type: "open"
    }));

    const filingItems = (secResponse.filings || []).map((filing) => ({
      ...filing,
      companyId: company.id,
      type: "filing",
      publishedAt: filing.filedAt,
      summary: `${filing.form || "SEC"} 更新，报告期 ${filing.reportDate || "N/A"}。`,
      source: "SEC"
    }));

    addItems([...openItems, ...filingItems]);
  } catch (error) {
    const message = sample(company.id, "open", "公开信息刷新失败", error.message || "上游暂时不可用", "SYSTEM", new Date().toISOString());
    addItems([message]);
  } finally {
    els.refreshBtn.disabled = false;
    els.refreshBtn.textContent = "刷新";
  }
}

async function importFiles(files) {
  const company = activeCompany();
  const imported = await Promise.all([...files].map(async (file) => {
    const text = await file.text();
    const summary = text.replace(/\s+/g, " ").trim().slice(0, 280);
    return {
      id: `${company.id}-${file.name}-${file.lastModified}`,
      companyId: company.id,
      type: "local",
      title: file.name,
      source: company.ticker || "LOCAL",
      createdAt: new Date(file.lastModified || Date.now()).toISOString(),
      publishedAt: new Date(file.lastModified || Date.now()).toISOString(),
      summary: summary || "空文件"
    };
  }));
  addItems(imported);
  els.fileInput.value = "";
}

function updateActiveCompanyFromForm() {
  const company = activeCompany();
  company.name = els.companyNameInput.value.trim() || company.name;
  company.ticker = els.tickerInput.value.trim().toUpperCase();
  company.cik = els.cikInput.value.trim();
  company.topics = els.topicsInput.value.split(",").map((topic) => topic.trim()).filter(Boolean);
  saveState();
  render();
  persistCompany(company);
}

function addCompany() {
  const name = els.newCompanyName.value.trim();
  if (!name) return;
  const ticker = els.newTicker.value.trim().toUpperCase();
  const company = {
    id: `${ticker || name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    ticker,
    cik: els.newCik.value.trim(),
    topics: [],
    notes: ""
  };
  state.companies.push(company);
  state.activeCompanyId = company.id;
  els.newCompanyName.value = "";
  els.newTicker.value = "";
  els.newCik.value = "";
  saveState();
  render();
  persistCompany(company);
}

els.refreshBtn.addEventListener("click", refreshOpenInfo);
els.fileInput.addEventListener("change", (event) => importFiles(event.target.files));
els.saveCompanyBtn.addEventListener("click", updateActiveCompanyFromForm);
els.saveNoteBtn.addEventListener("click", () => {
  const company = activeCompany();
  company.notes = els.noteInput.value;
  saveState();
  persistCompany(company);
});
els.addCompanyBtn.addEventListener("click", () => els.companyDialog.showModal());
els.confirmAddCompany.addEventListener("click", addCompany);
els.askForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = els.askInput.value.trim();
  if (!question) return;
  askPmAgent(question);
  els.askInput.value = "";
});

render();
syncFromBackend();

async function askPmAgent(question) {
  const company = activeCompany();
  try {
    const data = await api("ask", {
      method: "POST",
      body: JSON.stringify({
        question,
        company,
        items: activeItems().slice(0, 12)
      })
    });
    addItems([data.item]);
  } catch (error) {
    addItems([sample(company.id, "ai", `Andy PM问答：${question}`, `本地记录：${error.message}。配置 Google AI API 后会生成真正的投研回答。`, "Andy PM", new Date().toISOString())]);
  }
}
