const storageKey = "investment-intel-workstation-v2";

const defaultState = {
  activeCompanyId: "amzn",
  activeItemId: "amzn-Amazon Launches Supply Chain Service for Sellers",
  searchQuery: "",
  editorTab: "source",
  companyWorkspaceTab: "home",
  railView: "notes",
  folderPath: [],
  customFolders: [],
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

const companyWorkspaceTabs = [
  ["home", "主页"],
  ["timeline", "时间线"],
  ["notes", "笔记"],
  ["model", "模型"],
  ["thesis", "Thesis"],
  ["actions", "操作"],
  ["committee", "投委会"],
  ["questions", "问题清单"],
  ["deep", "深研"],
  ["continuous", "连续研究"],
  ["transcript", "Transcript"]
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
const autoRefreshingCompanies = new Set();

const els = {
  noteStream: document.querySelector("#noteStream"),
  queueTotal: document.querySelector("#queueTotal"),
  intakeQueue: document.querySelector("#intakeQueue"),
  searchInput: document.querySelector("#searchInput"),
  briefList: document.querySelector("#briefList"),
  workflowGrid: document.querySelector("#workflowGrid"),
  impactMatrix: document.querySelector("#impactMatrix"),
  researchQueue: document.querySelector("#researchQueue"),
  folderBoard: document.querySelector("#folderBoard"),
  companyWorkspace: document.querySelector("#companyWorkspace"),
  folderUploadInput: document.querySelector("#folderUploadInput"),
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
  newMaterialBtn: document.querySelector("#newMaterialBtn"),
  selectedMaterialMeta: document.querySelector("#selectedMaterialMeta"),
  openMaterialUrlBtn: document.querySelector("#openMaterialUrlBtn"),
  materialTitleInput: document.querySelector("#materialTitleInput"),
  materialFolderSelect: document.querySelector("#materialFolderSelect"),
  materialTypeSelect: document.querySelector("#materialTypeSelect"),
  materialTagsInput: document.querySelector("#materialTagsInput"),
  sourceTabBtn: document.querySelector("#sourceTabBtn"),
  viewTabBtn: document.querySelector("#viewTabBtn"),
  sourceEditor: document.querySelector("#sourceEditor"),
  viewEditor: document.querySelector("#viewEditor"),
  saveMaterialBtn: document.querySelector("#saveMaterialBtn"),
  addCompanyBtn: document.querySelector("#addCompanyBtn"),
  importCompaniesBtn: document.querySelector("#importCompaniesBtn"),
  companyDialog: document.querySelector("#companyDialog"),
  companyImportDialog: document.querySelector("#companyImportDialog"),
  companyImportFile: document.querySelector("#companyImportFile"),
  companyImportText: document.querySelector("#companyImportText"),
  companyImportPreview: document.querySelector("#companyImportPreview"),
  confirmCompanyImport: document.querySelector("#confirmCompanyImport"),
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
    if (stored?.companies?.length) return { ...structuredClone(defaultState), ...stored };
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

function readableText(value) {
  const text = String(value || "");
  const doc = new DOMParser().parseFromString(text, "text/html");
  return (doc.body.textContent || text)
    .replaceAll("\u00a0", " ")
    .replace(/\s+/g, " ")
    .trim();
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
    const payload = {
      id: company.id,
      name: company.name,
      ticker: company.ticker,
      cik: company.cik,
      topics: company.topics || [],
      notes: company.notes || ""
    };
    await api("companies", { method: "POST", body: JSON.stringify(payload) });
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
    .filter((item) => item.companyId === activeId || !item.companyId)
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
}

function materialSource(item) {
  return item?.sourceText || item?.rawText || readableText(item?.summary) || "";
}

function materialView(item) {
  return item?.viewText || "";
}

function materialTranscript(item) {
  return [
    item?.sourceText,
    item?.rawText,
    item?.viewText,
    readableText(item?.summary)
  ].filter(Boolean).join("\n\n").trim();
}

function materialTags(item) {
  return Array.isArray(item?.tags) ? item.tags : [];
}

function materialUrl(item) {
  const url = item?.url || item?.raw?.url || "";
  return /^https?:\/\//i.test(url) ? url : "";
}

function isVisibleMaterial(item) {
  return item?.title !== "公开信息刷新失败";
}

function selectedItem() {
  const visible = filteredItems();
  return visible.find((item) => item.id === state.activeItemId) || visible[0] || null;
}

function filteredItems() {
  const query = String(state.searchQuery || "").trim().toLowerCase();
  const activeId = activeCompany().id;
  return state.items
    .filter(isVisibleMaterial)
    .filter((item) => item.companyId === activeId || !item.companyId)
    .filter((item) => {
      if (!query) return true;
      const haystack = [
        item.title,
        readableText(item.summary),
        materialSource(item),
        materialView(item),
        item.source,
        item.form,
        item.folderId,
        item.entity,
        ...materialTags(item)
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
}

function itemCompany(item) {
  return state.companies.find((company) => company.id === item.companyId) || null;
}

function isUploadedNote(item) {
  if (!isVisibleMaterial(item)) return false;
  if (item.type !== "local" && item.type !== "ai") return false;
  if (/新材料/.test(item.title || "") && /等待录入 Source/.test(item.summary || "")) return false;
  return Boolean(item.folderId || item.sourceText || item.viewText || item.summary || item.title);
}

function noteListItems() {
  const query = String(state.searchQuery || "").trim().toLowerCase();
  return state.items
    .filter(isUploadedNote)
    .filter((item) => {
      if (!query) return true;
      const company = itemCompany(item);
      const haystack = [
        item.title,
        readableText(item.summary),
        materialSource(item),
        materialView(item),
        item.source,
        item.form,
        item.folderId,
        company?.ticker,
        company?.name,
        company ? inferIndustry(company) : "",
        ...materialTags(item)
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
}

function companyCloudItems(companyId) {
  return state.items
    .filter(isVisibleMaterial)
    .filter((item) => item.companyId === companyId)
    .filter((item) => item.type === "local" || item.folderId || item.sourceText || item.viewText)
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
}

function customFolders() {
  return Array.isArray(state.customFolders) ? state.customFolders : [];
}

function customFolderItems(folderId) {
  return state.items
    .filter(isVisibleMaterial)
    .filter((item) => item.folderId === `custom:${folderId}`)
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
}

function companyOpenNewsCount(companyId) {
  return state.items
    .filter(isVisibleMaterial)
    .filter((item) => item.companyId === companyId && item.type === "open")
    .filter((item) => materialUrl(item))
    .length;
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
  if (state.railView === "folders") {
    renderCloudFolders();
    return;
  }

  const rows = noteListItems().slice(0, 40);
  const selectedId = state.activeItemId || selectedItem()?.id;
  const emptyText = state.searchQuery
    ? `没有找到匹配“${escapeHtml(state.searchQuery)}”的上传笔记。`
    : `还没有上传笔记。可以在公司页点击“添加材料”上传文件，或在右侧资料入口新增材料。`;

  els.noteStream.innerHTML = rows.map((item) => {
    const company = itemCompany(item);
    const companyTag = company?.ticker || item.source || "NOTE";
    const secondaryTag = company ? inferIndustry(company) : materialTags(item)[0] || item.folderId || "";
    const ideaCount = item.viewText || item.summary ? 1 : 0;
    return `
    <article class="note-item uploaded-note ${item.id === selectedId ? "active" : ""}">
      <button class="note-select" data-item-id="${escapeHtml(item.id)}" type="button">
      <div class="note-title">${escapeHtml(readableText(item.title))}</div>
      <div class="note-meta">
        <span>${escapeHtml(formatTime(item.publishedAt || item.createdAt))}</span>
        ${ideaCount ? `<span class="note-badge">▱ ${ideaCount}</span>` : ""}
        <span class="tag">${escapeHtml(companyTag)}</span>
        ${secondaryTag ? `<span class="tag wide">${escapeHtml(secondaryTag)}</span>` : ""}
      </div>
      </button>
    </article>
  `;
  }).join("") || `<div class="empty-list">${emptyText}</div>`;
}

function renderCloudFolders() {
  const path = Array.isArray(state.folderPath) ? state.folderPath : [];
  const selectedIndustry = path[0] || "";

  if (!selectedIndustry) {
    const groups = state.companies.reduce((acc, company) => {
      const industry = inferIndustry(company);
      if (!acc.has(industry)) acc.set(industry, []);
      acc.get(industry).push(company);
      return acc;
    }, new Map());
    const industryRows = [...groups.entries()].map(([industry, companies]) => {
      const fileCount = companies.reduce((sum, company) => sum + companyCloudItems(company.id).length, 0);
      return `
        <button class="cloud-folder directory" data-open-folder="${escapeHtml(industry)}" type="button">
          <div class="folder-icon">▰</div>
          <div class="folder-main">
            <strong>${escapeHtml(industry)}</strong>
            <span>${companies.length} 家公司 · ${fileCount} 份资料</span>
          </div>
          <div class="folder-meta">
            <em>${fileCount}</em>
            <span>打开</span>
          </div>
        </button>
      `;
    });
    const customRows = customFolders().map((folder) => {
      const items = customFolderItems(folder.id);
      return `
        <button class="cloud-folder directory custom" data-custom-folder="${escapeHtml(folder.id)}" type="button">
          <div class="folder-icon">▰</div>
          <div class="folder-main">
            <strong>${escapeHtml(folder.name)}</strong>
            <span>自定义分类 · ${items.length} 份资料</span>
          </div>
          <div class="folder-meta">
            <em>${items.length}</em>
            <span>打开</span>
          </div>
        </button>
      `;
    });
    const rows = [...customRows, ...industryRows];
    els.noteStream.innerHTML = `
      <div class="folder-breadcrumb"><strong>云端文件夹</strong><span>按行业分类</span></div>
      ${rows.join("") || `<div class="empty-list">还没有分类文件夹。先在右侧投资组合雷达添加或导入公司。</div>`}
    `;
    return;
  }

  const companies = state.companies.filter((company) => inferIndustry(company) === selectedIndustry);
  const rows = companies.map((company) => {
    const cloudItems = companyCloudItems(company.id);
    const latest = cloudItems[0];
    return `
      <button class="cloud-folder ${company.id === state.activeCompanyId ? "active" : ""}" data-folder-company="${escapeHtml(company.id)}" type="button">
        <div class="folder-icon">▱</div>
        <div class="folder-main">
          <strong>${escapeHtml(company.ticker || company.name)}</strong>
          <span>${escapeHtml(company.name || company.ticker)}</span>
        </div>
        <div class="folder-meta">
          <em>${cloudItems.length}</em>
          <span>${latest ? formatTime(latest.publishedAt || latest.createdAt) : "空"}</span>
        </div>
      </button>
    `;
  });

  els.noteStream.innerHTML = `
    <button class="folder-breadcrumb clickable" data-folder-back type="button">
      <strong>云端文件夹 / ${escapeHtml(selectedIndustry)}</strong>
      <span>← 返回分类</span>
    </button>
    ${rows.join("") || `<div class="empty-list">${escapeHtml(selectedIndustry)} 下面还没有公司文件夹。</div>`}
  `;
}

function groupedCompanies() {
  return state.companies.reduce((acc, company) => {
    const industry = inferIndustry(company);
    if (!acc.has(industry)) acc.set(industry, []);
    acc.get(industry).push(company);
    return acc;
  }, new Map());
}

function renderFolderBoard() {
  const path = Array.isArray(state.folderPath) ? state.folderPath : [];
  const selectedIndustry = path[0] || "";
  const selectedCustomId = selectedIndustry.startsWith("custom:") ? selectedIndustry.slice(7) : "";
  const selectedCustomFolder = customFolders().find((folder) => folder.id === selectedCustomId);
  els.folderBoard.hidden = state.railView !== "folders";
  document.body.classList.toggle("folders-mode", state.railView === "folders");
  if (state.railView !== "folders") {
    els.folderBoard.innerHTML = "";
    return;
  }

  if (!selectedIndustry) {
    const customCards = customFolders().map((folder) => {
      const items = customFolderItems(folder.id);
      return `
        <article class="folder-card-large custom-folder-card">
          <button class="folder-card-head" data-custom-folder="${escapeHtml(folder.id)}" type="button">
            <span class="folder-card-icon">▰</span>
            <strong>${escapeHtml(folder.name)}</strong>
            <em>${items.length}</em>
          </button>
          <div class="folder-chip-grid">
            <button class="folder-chip" data-custom-folder="${escapeHtml(folder.id)}" type="button"><span>▱</span>打开</button>
            <button class="folder-chip" data-upload-folder="${escapeHtml(folder.id)}" type="button"><span>＋</span>上传资料</button>
          </div>
        </article>
      `;
    }).join("");
    const cards = [...groupedCompanies().entries()].map(([industry, companies]) => {
      const fileCount = companies.reduce((sum, company) => sum + companyCloudItems(company.id).length, 0);
      const chips = companies.slice(0, 8).map((company) => `
        <button class="folder-chip" data-folder-company="${escapeHtml(company.id)}" type="button">
          <span>▱</span>${escapeHtml(company.ticker || company.name)}
        </button>
      `).join("");
      return `
        <article class="folder-card-large">
          <button class="folder-card-head" data-open-folder="${escapeHtml(industry)}" type="button">
            <span class="folder-card-icon">▰</span>
            <strong>${escapeHtml(industry)}</strong>
            <em>${fileCount}</em>
          </button>
          <div class="folder-chip-grid">${chips || '<span class="folder-empty">暂无公司</span>'}</div>
        </article>
      `;
    }).join("");

    els.folderBoard.innerHTML = `
      <div class="folder-board-top">
        <div>
          <span>公开</span>
          <h2>云端文件夹</h2>
        </div>
        <div class="folder-board-actions">
          <button data-create-folder type="button">新建分类</button>
        </div>
      </div>
      <div class="folder-card-grid-main">${customCards}${cards}</div>
    `;
    return;
  }

  if (selectedCustomFolder) {
    const items = customFolderItems(selectedCustomFolder.id);
    const cards = items.map((item) => `
      <article class="folder-card-large file-card">
        <button class="folder-card-head" data-item-id="${escapeHtml(item.id)}" type="button">
          <span class="folder-card-icon">▱</span>
          <strong>${escapeHtml(readableText(item.title))}</strong>
          <em>${escapeHtml(item.source || "FILE")}</em>
        </button>
        <p>${escapeHtml(readableText(item.summary || item.sourceText || "已上传资料"))}</p>
        <small>${formatTime(item.publishedAt || item.createdAt)}</small>
      </article>
    `).join("");

    els.folderBoard.innerHTML = `
      <div class="folder-board-top">
        <button class="folder-board-back" data-folder-back type="button">← 云端文件夹 / ${escapeHtml(selectedCustomFolder.name)}</button>
        <div class="folder-board-actions">
          <button data-upload-folder="${escapeHtml(selectedCustomFolder.id)}" type="button">上传资料</button>
        </div>
      </div>
      <div class="folder-card-grid-main">${cards || `<div class="empty-list">这个分类还没有资料。点击右上角上传。</div>`}</div>
    `;
    return;
  }

  const companies = state.companies.filter((company) => inferIndustry(company) === selectedIndustry);
  const cards = companies.map((company) => {
    const cloudItems = companyCloudItems(company.id);
    const latest = cloudItems[0];
    const subfolders = ["公开互联网", "订阅资料", "本地上传"].map((label) => `
      <span class="folder-chip static"><span>▱</span>${label}</span>
    `).join("");
    return `
      <article class="folder-card-large company-folder">
        <button class="folder-card-head" data-folder-company="${escapeHtml(company.id)}" type="button">
          <span class="folder-card-icon">▱</span>
          <strong>${escapeHtml(company.ticker || company.name)}</strong>
          <em>${cloudItems.length}</em>
        </button>
        <p>${escapeHtml(company.name || company.ticker)}</p>
        <div class="folder-chip-grid">${subfolders}</div>
        <small>${latest ? `最近 ${formatTime(latest.publishedAt || latest.createdAt)}` : "空文件夹"}</small>
      </article>
    `;
  }).join("");

  els.folderBoard.innerHTML = `
    <button class="folder-board-back" data-folder-back type="button">← 云端文件夹 / ${escapeHtml(selectedIndustry)}</button>
    <div class="folder-card-grid-main">${cards || `<div class="empty-list">${escapeHtml(selectedIndustry)} 下面还没有公司文件夹。</div>`}</div>
  `;
}

function pseudoPrice(company) {
  const seed = String(company.ticker || company.name || "PM").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const price = (80 + (seed % 420) + ((seed % 97) / 100)).toFixed(2);
  const change = (((seed % 69) - 30) / 3).toFixed(2);
  return { price, change };
}

function renderMiniChart(company) {
  const seed = String(company.ticker || company.name || "chart").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: 52 }, (_, index) => {
    const wave = Math.sin((index + seed) / 5) * 22 + Math.cos((index + seed) / 9) * 12;
    const height = Math.max(18, Math.min(92, 48 + wave + ((index * seed) % 13)));
    const up = (index + seed) % 3 !== 0;
    return `<span class="${up ? "upbar" : "downbar"}" style="height:${height}%"></span>`;
  }).join("");
}

function monthKey(item) {
  const date = new Date(item.publishedAt || item.createdAt || Date.now());
  if (Number.isNaN(date.getTime())) return "待定";
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function compactDate(item) {
  const date = new Date(item.publishedAt || item.createdAt || Date.now());
  if (Number.isNaN(date.getTime())) return "待定";
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

function materialTone(item, index = 0) {
  const text = `${item.title || ""} ${item.summary || ""}`.toLowerCase();
  if (/risk|miss|down|lawsuit|regulat|反证|风险|下调|竞争|放缓/.test(text)) return "反证 / 风险";
  if (/margin|profit|cash|gross|利润|毛利|现金流/.test(text)) return "利润率 / 经营杠杆";
  if (/price|arpu|monet|take rate|广告|变现|涨价/.test(text)) return "涨价 / 变现";
  if (/launch|earnings|guidance|财报|发布|合同|指引/.test(text)) return "催化剂";
  return index % 4 === 0 ? "需求 / 增长" : index % 4 === 1 ? "竞争 / 份额" : "需求 / 增长";
}

function groupByMonth(rows) {
  return rows.reduce((groups, item) => {
    const key = monthKey(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

function renderWorkspaceTabs(activeTab) {
  return companyWorkspaceTabs.map(([id, label]) => `
    <button class="${activeTab === id ? "active" : ""}" data-company-tab="${id}" type="button">${label}</button>
  `).join("");
}

function evidenceBuckets(rows) {
  const labels = ["需求 / 增长", "涨价 / 变现", "利润率 / 经营杠杆", "竞争 / 份额", "反证 / 风险", "催化剂"];
  return labels.map((label) => ({
    label,
    detail: {
      "需求 / 增长": "需求拐点、用户增长、订单、预算、渗透率",
      "涨价 / 变现": "价格、ARPU、take rate、广告加载率、商业化",
      "利润率 / 经营杠杆": "毛利率、费用率、成本、效率、现金流",
      "竞争 / 份额": "竞争格局、份额、护城河、替代风险",
      "反证 / 风险": "下调、放缓、miss、监管、价格松动",
      "催化剂": "财报、发布、合同、回购、指引、事件窗口"
    }[label],
    rows: rows.filter((item, index) => materialTone(item, index) === label).slice(0, 3)
  }));
}

function renderCompanyHome(ctx) {
  const { company, rows, price, viewItems, selected, selectedSummary, peerCompanies, recentNotes } = ctx;
  return `
    <section class="company-grid">
      <article class="stock-panel">
        <div class="panel-head"><strong>股价图</strong><span>${escapeHtml(company.ticker || "")}</span></div>
        <div class="price-line">
          <strong>${price.price}</strong>
          <span class="${Number(price.change) >= 0 ? "up" : "down"}">${price.change}%</span>
          <em>${new Date().toLocaleDateString("zh-CN")}</em>
        </div>
        <div class="stock-kpis">
          <span>区间涨跌 <strong class="${Number(price.change) >= 0 ? "up" : "down"}">${price.change}%</strong></span>
          <span>50日均线 <strong class="up">+14.4</strong></span>
          <span>200日均线 <strong class="down">-55.6</strong></span>
        </div>
        <div class="chart-bars">${renderMiniChart(company)}</div>
      </article>

      <aside class="viewpoint-panel">
        <div class="panel-head"><strong>我的观点</strong><span>${viewItems.length} 条</span></div>
        <div class="view-actions">
          <button data-company-tab="thesis" type="button">投研框架</button>
          <button data-company-tab="notes" type="button">今日记录</button>
          <button type="button">记入观点流</button>
        </div>
        <textarea placeholder="我的判断、核心变量、下注条件、反证...">${escapeHtml(company.notes || "")}</textarea>
        <div class="view-stream">
          ${viewItems.map((item) => `
            <button data-item-id="${escapeHtml(item.id)}" type="button">
              <strong>${escapeHtml(readableText(item.title))}</strong>
              <span>${escapeHtml(item.source || item.type)} · ${formatTime(item.publishedAt || item.createdAt)}</span>
            </button>
          `).join("") || '<div class="empty-list">暂无观点流</div>'}
        </div>
        <section class="peer-section">
          <div class="panel-head"><strong>同组公司</strong><span>${peerCompanies.length}</span></div>
          <div class="peer-grid">
            ${peerCompanies.map((row) => `
              <button data-folder-company="${escapeHtml(row.id)}" type="button">
                <strong>${escapeHtml(row.name || row.ticker)}</strong>
                <span>${escapeHtml(row.ticker || "")}</span>
              </button>
            `).join("") || '<span class="folder-empty">暂无同组公司</span>'}
          </div>
        </section>
      </aside>
    </section>

    <section class="company-source-card">
      <div class="panel-head"><strong>当前材料</strong><span>${selected ? escapeHtml(selected.source || selected.type) : "无"}</span></div>
      <p>${escapeHtml(selectedSummary)}</p>
      <div class="panel-head compact-head"><strong>最近笔记</strong><span>${recentNotes.length}</span></div>
      <div class="recent-note-list">
        ${recentNotes.map((item) => `
          <button data-item-id="${escapeHtml(item.id)}" type="button">
            <span>${escapeHtml(readableText(item.title))}</span>
            <em>${formatTime(item.publishedAt || item.createdAt)}</em>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCompanyTimeline(ctx) {
  const groups = Object.entries(groupByMonth(ctx.rows));
  return `
    <section class="workspace-panel narrative-panel">
      <div class="panel-head"><strong>公司叙事时间线</strong><span>NARRATIVE ARC</span></div>
      <div class="narrative-head">
        <h2>${groups.at(-1)?.[0] || "近期"} → ${groups[0]?.[0] || "现在"}</h2>
        <button type="button">AI 串公司故事</button>
      </div>
      <div class="narrative-filters">
        <span>全部 ${ctx.rows.length}</span><span>有想法 ${ctx.viewItems.length}</span><span>转折 ${Math.min(2, groups.length)}</span><span>展开当前</span>
      </div>
      <div class="turning-strip">POTENTIAL TURNING POINTS · ${groups.slice(0, 2).map(([month]) => `${month} 叙事出现变化`).join(" · ") || "等待更多材料"}</div>
      <div class="timeline-list">
        ${groups.map(([month, items], index) => `
          <article class="timeline-month ${index === 0 ? "active" : ""}">
            <div>
              <strong>${escapeHtml(month)}</strong>
              <span>${escapeHtml(materialTone(items[0], index))}：${escapeHtml(readableText(items[0]?.title || "新增材料"))}</span>
              <p>这段主要围绕 ${escapeHtml(materialTone(items[0], index))}，共 ${items.length} 条材料；需要判断是否改变核心变量。</p>
            </div>
            <em>${items.length}</em>
          </article>
          ${items.slice(0, 4).map((item) => `
            <button class="timeline-item" data-item-id="${escapeHtml(item.id)}" type="button">
              <span>${compactDate(item)}</span>
              <strong>${escapeHtml(readableText(item.title))}</strong>
              <em>${escapeHtml(item.type === "open" ? "公开" : item.type)}</em>
            </button>
          `).join("")}
        `).join("") || '<div class="empty-list">还没有可以串联的材料。</div>'}
      </div>
    </section>
  `;
}

function renderCompanyNotes(ctx) {
  return `
    <section class="workspace-two">
      <article class="workspace-panel">
        <div class="panel-head"><strong>观点流</strong><span>${ctx.viewItems.length} 条</span></div>
        <div class="note-accordion">
          ${ctx.viewItems.map((item) => `
            <button data-item-id="${escapeHtml(item.id)}" type="button">
              <strong>${escapeHtml(readableText(item.title))}</strong>
              <span>${formatTime(item.publishedAt || item.createdAt)} · ${escapeHtml(item.type)}</span>
            </button>
          `).join("") || '<div class="empty-list">暂无观点流。</div>'}
        </div>
      </article>
      <article class="workspace-panel">
        <div class="panel-head"><strong>公司材料流</strong><span>${ctx.rows.length}</span></div>
        <div class="material-flow">
          ${ctx.rows.slice(0, 18).map((item) => `
            <button data-item-id="${escapeHtml(item.id)}" type="button">
              <strong>${escapeHtml(readableText(item.title))}</strong>
              <span>${escapeHtml(item.type)} · ${compactDate(item)}</span>
              <p>${escapeHtml(readableText(item.summary || item.sourceText || "").slice(0, 180))}</p>
            </button>
          `).join("") || '<div class="empty-list">暂无公司材料。</div>'}
        </div>
      </article>
    </section>
  `;
}

function renderCompanyModel(ctx) {
  const metrics = [
    ["REVENUE", "676,855", "2031"],
    ["REV YOY", "16.6%", "2031"],
    ["GROSS MARGIN", "—", "latest"],
    ["OP MARGIN", "—", "latest"],
    ["NET INCOME", "—", "latest"]
  ];
  const rows = ["Revenue", "YoY", "Gross Profit", "GPM", "Operating Expense", "EBIT Margin", "Capex", "FCF"].map((label, index) => `
    <tr><td>${label}</td><td>${(210 + index * 18).toLocaleString()}</td><td>${(245 + index * 21).toLocaleString()}</td><td>${(280 + index * 24).toLocaleString()}</td><td>${(322 + index * 26).toLocaleString()}</td><td>${index % 2 ? "15.6%" : "428,866"}</td></tr>
  `).join("");
  return `
    <section class="workspace-panel">
      <div class="panel-head"><strong>模型版本</strong><span>当前模型</span></div>
      <div class="model-version-card">
        <div><strong>${escapeHtml(ctx.company.name || ctx.company.ticker)} Model</strong><span>Sheet: ${escapeHtml(ctx.company.ticker || "Ticker")} · 文件: 上传你的 Excel 后替换</span></div>
        <button type="button">上传新版本</button>
        <button type="button">换模型</button>
      </div>
      <div class="model-layout">
        <div class="model-match">
          <strong>模型匹配</strong>
          ${[100, 88, 72, 60].map((score, index) => `<span>${escapeHtml(ctx.company.name)} <em>${score}</em></span>`).join("")}
        </div>
        <div>
          <div class="panel-head compact-head"><strong>核心数字</strong><span>${metrics.length}</span></div>
          <div class="core-metrics">${metrics.map(([label, value, year]) => `<article><span>${label}</span><strong>${value}</strong><em>${year}</em></article>`).join("")}</div>
        </div>
      </div>
      <div class="model-table-wrap">
        <div class="panel-head"><strong>模型预览</strong><span>${escapeHtml(ctx.company.ticker || "")}</span></div>
        <table class="model-table"><thead><tr><th>指标</th><th>2023</th><th>2024</th><th>2025</th><th>2026</th><th>2027E</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
    </section>
  `;
}

function renderCompanyThesis(ctx) {
  const buckets = evidenceBuckets(ctx.rows);
  return `
    <section class="workspace-panel thesis-panel">
      <div class="thesis-hero">
        <span>DECISION MEMO</span>
        <h2>进入深研</h2>
        <p>证据、模型和股价位置开始形成组合，可以写成正式 thesis。</p>
      </div>
      <div class="thesis-grid">
        <article><strong>Bull case 要成立</strong><p>增长继续兑现，利润率不被投入吞噬，核心业务的竞争优势没有被新技术削弱。</p></article>
        <article><strong>Bear case / 反证</strong><p>材料中已有风险线索，需要逐条确认是否影响核心 thesis。</p></article>
        <article><strong>必须跟踪的变量</strong><p>需求、价格、利润率、竞争、监管和下一次财报窗口。</p></article>
      </div>
      <div class="panel-head compact-head"><strong>证据地图</strong><span>按标题/摘要粗分</span></div>
      <div class="evidence-map">
        ${buckets.map((bucket) => `
          <article>
            <strong>${escapeHtml(bucket.label)}</strong>
            <span>${escapeHtml(bucket.detail)}</span>
            <em>${bucket.rows.length}</em>
            ${bucket.rows.slice(0, 2).map((item) => `<button data-item-id="${escapeHtml(item.id)}" type="button">${escapeHtml(readableText(item.title))}</button>`).join("")}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCompanyActions(ctx) {
  const actions = [
    ["前", "业绩前", "拿不拿过业绩 / position / risk reward"],
    ["中", "业绩发生", "数字是否改变逻辑 / read-through / 新逻辑"],
    ["后", "业绩后", "涨跌后追不追 / 加不加 / cover不cover"],
    ["涨", "股价涨多了", "FOMO 管理 / 新 thesis / 追不追"],
    ["跌", "股价跌多了", "恐慌管理 / 机会还是换逻辑 / cover"]
  ];
  return `
    <section class="workspace-panel">
      <div class="panel-head"><strong>操作纪律</strong><span>把交易经验变成当下动作</span></div>
      <div class="discipline-strip"><span>材料 ${ctx.evidence}</span><span>想法 ${ctx.viewItems.length}</span><span>股价位置 42%</span><span>模型 自动判断</span></div>
      <div class="action-list">
        ${actions.map(([mark, title, detail]) => `
          <button type="button"><strong>${mark}</strong><span>${title}</span><em>${detail}</em><small>未生成</small></button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCompanyCommittee(ctx) {
  return `
    <section class="workspace-two">
      <article class="workspace-panel committee-panel">
        <div class="panel-head"><strong>投委会审问 ${escapeHtml(ctx.company.ticker || ctx.company.name)}</strong><span>GPT 5.5</span></div>
        <p>先写你的当前判断。AI 会像投委会一样找漏洞：核心变量、市场分歧、反证条件、禁止动作和下一步验证。</p>
        <strong class="field-title">我的当前判断</strong>
        <textarea placeholder="例：我现在倾向继续跟踪/准备买/准备放弃。核心变量是... 市场可能低估... 最大反证是..."></textarea>
        <button type="button">生成并写入观点</button>
      </article>
      <article class="workspace-panel">
        <div class="panel-head"><strong>还没有投委会质询</strong><span>待生成</span></div>
        <p>写下你的当前判断，然后生成一版红队质询和可执行结论。</p>
      </article>
    </section>
  `;
}

function renderCompanyQuestions(ctx) {
  const questions = [
    "这个公司未来 6-12 个月最关键的验证变量是什么？",
    "哪些公开信息会证明我的核心假设错了？",
    "市场现在最可能误判的是需求、利润率还是估值？",
    "下一次财报前必须补哪三份材料？"
  ];
  return `
    <section class="workspace-panel">
      <div class="panel-head"><strong>问题清单</strong><span>${questions.length} 个</span></div>
      <div class="question-list">
        ${questions.map((question, index) => `
          <label><input type="checkbox" ${index === 0 ? "checked" : ""} /><span>${question}</span><em>${index === 0 ? "正在验证" : "待验证"}</em></label>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCompanyDeep(ctx) {
  return `
    <section class="workspace-panel deep-panel">
      <div class="panel-head"><strong>深研任务台</strong><span>把材料转成决策</span></div>
      <div class="deep-grid">
        <article><strong>1. 核心变量</strong><p>把 ${ctx.company.ticker || ctx.company.name} 的主线拆成 3 个可验证变量。</p></article>
        <article><strong>2. 多空证据</strong><p>从 ${ctx.evidence} 条材料里提取支持、反证、待确认。</p></article>
        <article><strong>3. 模型敏感性</strong><p>把收入、利润率、估值倍数做成 bull/base/bear。</p></article>
        <article><strong>4. 行动建议</strong><p>输出加仓、减仓、对冲、观察的触发条件。</p></article>
      </div>
    </section>
  `;
}

function renderCompanyContinuous(ctx) {
  return `
    <section class="workspace-panel">
      <div class="panel-head"><strong>连续研究</strong><span>每日自动复盘</span></div>
      <div class="continuous-grid">
        <article><span>公开互联网</span><strong>${ctx.rows.filter((item) => item.type === "open").length}</strong><p>每天抓取公司新闻、公告和网页更新。</p></article>
        <article><span>订阅/付费资料</span><strong>${ctx.rows.filter((item) => item.type === "filing").length}</strong><p>研报、纪要、数据库导出进入统一材料流。</p></article>
        <article><span>本地/云端文件</span><strong>${ctx.localDocs.length}</strong><p>你上传的文件会和公开信息一起进入上下文。</p></article>
      </div>
    </section>
  `;
}

function renderCompanyTranscript(ctx) {
  const item = selectedItem();
  const company = item ? itemCompany(item) || ctx.company : ctx.company;
  const transcript = materialTranscript(item);
  const fallback = "还没有 transcript 内容。上传 txt/md/html/csv 文件可以直接读取；PDF/Excel/Word 目前先保存为文件记录，后续会接解析。";
  return `
    <section class="transcript-shell">
      <header class="transcript-head">
        <div>
          <h2>${escapeHtml(readableText(item?.title || "Transcript"))}</h2>
          <div class="transcript-meta">
            <span>${escapeHtml(formatTime(item?.publishedAt || item?.createdAt))}</span>
            <span>${escapeHtml(company?.ticker || item?.source || "NOTE")}</span>
            <span>${escapeHtml(item?.type || "local")}</span>
          </div>
        </div>
      </header>
      <article class="transcript-body">
        ${escapeHtml(transcript || fallback).split("\n").map((line) => `<p>${line || "&nbsp;"}</p>`).join("")}
      </article>
    </section>
  `;
}

function renderCompanyWorkspaceBody(tab, ctx) {
  const map = {
    home: renderCompanyHome,
    timeline: renderCompanyTimeline,
    notes: renderCompanyNotes,
    model: renderCompanyModel,
    thesis: renderCompanyThesis,
    actions: renderCompanyActions,
    committee: renderCompanyCommittee,
    questions: renderCompanyQuestions,
    deep: renderCompanyDeep,
    continuous: renderCompanyContinuous,
    transcript: renderCompanyTranscript
  };
  return (map[tab] || renderCompanyHome)(ctx);
}

function renderCompanyWorkspace() {
  const company = activeCompany();
  const rows = activeItems();
  const localDocs = companyCloudItems(company.id);
  const evidence = rows.filter((item) => isVisibleMaterial(item)).length;
  const price = pseudoPrice(company);
  const industry = inferIndustry(company);
  const viewItems = rows.slice(0, 4);
  const selected = selectedItem();
  const selectedSummary = selected ? readableText(selected.summary || selected.sourceText || selected.title) : "暂无材料";
  const activeTab = companyWorkspaceTabs.some(([id]) => id === state.companyWorkspaceTab) ? state.companyWorkspaceTab : "home";
  const peerCompanies = state.companies
    .filter((row) => row.id !== company.id && inferIndustry(row) === industry)
    .slice(0, 18);
  const recentNotes = rows.slice(0, 12);
  const ctx = { company, rows, localDocs, evidence, price, industry, viewItems, selected, selectedSummary, peerCompanies, recentNotes };

  els.companyWorkspace.hidden = state.railView === "folders";
  document.body.classList.toggle("company-mode", state.railView !== "folders");
  if (state.railView === "folders") {
    els.companyWorkspace.innerHTML = "";
    return;
  }

  els.companyWorkspace.innerHTML = `
    <header class="company-hero">
      <div>
        <div class="company-path">Home › ${escapeHtml(industry)} › ${escapeHtml(company.ticker || company.name)}</div>
        <h1>${escapeHtml(company.name || company.ticker)}</h1>
        <div class="company-tags">
          <span>${escapeHtml(company.ticker || "Ticker")} · 标签</span>
          <strong>${evidence} 条材料</strong>
        </div>
      </div>
      <div class="company-actions">
        <button data-company-tab="model" type="button">Ticker/模型</button>
        <button data-company-tab="model" type="button">批量识别Ticker</button>
        <button data-company-tab="deep" type="button">AI伙伴</button>
        <button data-company-tab="model" type="button">上传模型</button>
        <button data-upload-current-company type="button">添加材料</button>
        <button data-open-folder-for-company="${escapeHtml(company.id)}" type="button">普通文件夹</button>
      </div>
    </header>

    <label class="company-jump">
      <span>跳转公司 / ticker</span>
      <input id="companyJumpInput" placeholder="输入 ticker 或公司名" />
    </label>

    <section class="company-metrics">
      <article><span>股价</span><strong>${price.price}</strong><em class="${Number(price.change) >= 0 ? "up" : "down"}">${price.change}%</em></article>
      <article><span>模型</span><strong>${escapeHtml(company.name?.split(" ")[0] || company.ticker || "Company")}</strong><em>${escapeHtml(industry)}</em></article>
      <article><span>证据</span><strong>${evidence} 条</strong><em>${localDocs.length} 份云端资料</em></article>
      <article><span>研究状态</span><strong>100/100</strong><em>可以进入深研</em></article>
    </section>

    <nav class="workspace-tabs">
      ${renderWorkspaceTabs(activeTab)}
      <button data-workspace-refresh type="button">换公司/对比</button>
    </nav>

    ${renderCompanyWorkspaceBody(activeTab, ctx)}
  `;
}

function renderIntakeQueue() {
  const counts = {
    open: state.items.filter((item) => item.type === "open").length,
    filing: state.items.filter((item) => item.type === "filing").length,
    local: state.items.filter((item) => item.type === "local").length
  };
  const queue = [
    ["公开互联网", counts.open, "新闻、公告、网页更新"],
    ["订阅/付费资料", counts.filing, "研报、纪要、数据库导出"],
    ["本地文件", counts.local, "PDF、表格、会议记录"]
  ];

  els.queueTotal.textContent = String(state.items.length);
  els.intakeQueue.innerHTML = queue.map(([label, count, detail]) => `
    <div class="intake-item">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(detail)}</span>
      <em>${count}</em>
    </div>
  `).join("");
}

function briefLine(item, index) {
  const side = index === 0 ? "多头证据" : index === 1 ? "空头信号" : index === 2 ? "基本面" : "待验证";
  const source = item.type === "filing" ? "sec agent" : item.type === "local" ? "local analyst" : "daily analyst";
  const link = materialUrl(item);
  return `
    <li>
      <span class="brief-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="source-chip">${source}</span>
      <div class="brief-copy">
        <strong>${escapeHtml(source)}</strong>
        <p>${escapeHtml(side)}：${escapeHtml(readableText(item.summary || item.title))}</p>
        ${link ? `<button class="inline-source-link" data-open-url="${escapeHtml(link)}" type="button">打开原文</button>` : ""}
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

function inferIndustry(company) {
  if (company.industry) return company.industry;
  const ticker = String(company.ticker || "").toUpperCase();
  const text = `${company.name || ""} ${(company.topics || []).join(" ")}`.toLowerCase();
  const tickerMap = {
    AMZN: "互联网/消费",
    BABA: "互联网/消费",
    JD: "互联网/消费",
    PDD: "互联网/消费",
    MELI: "互联网/消费",
    NFLX: "互联网/消费",
    META: "互联网/消费",
    GOOGL: "互联网/消费",
    GOOG: "互联网/消费",
    MSFT: "软件/AI",
    PLTR: "软件/AI",
    CRM: "软件/AI",
    NOW: "软件/AI",
    ADBE: "软件/AI",
    NET: "数据/安全",
    DDOG: "数据/安全",
    CRWD: "数据/安全",
    SNOW: "数据/安全",
    NVDA: "半导体",
    AMD: "半导体",
    AVGO: "半导体",
    TSM: "半导体",
    ASML: "半导体",
    INTC: "半导体",
    MU: "半导体",
    TSLA: "汽车/新能源",
    BYD: "汽车/新能源",
    NIO: "汽车/新能源",
    XPEV: "汽车/新能源",
    JPM: "金融",
    BAC: "金融",
    GS: "金融",
    MS: "金融"
  };
  if (tickerMap[ticker]) return tickerMap[ticker];
  if (/semiconductor|chip|gpu|半导体|晶圆|存储|ai capex/.test(text)) return "半导体";
  if (/security|cyber|data|database|cloudflare|observability|数据|安全/.test(text)) return "数据/安全";
  if (/software|saas|cloud|ai|agent|copilot|aip|azure|软件/.test(text)) return "软件/AI";
  if (/retail|commerce|streaming|ads|consumer|消费|电商|广告/.test(text)) return "互联网/消费";
  if (/bank|fintech|payment|金融|银行|支付/.test(text)) return "金融";
  return "其他";
}

function renderCompanies() {
  const groups = state.companies.reduce((acc, company) => {
    const industry = inferIndustry(company);
    if (!acc.has(industry)) acc.set(industry, []);
    acc.get(industry).push(company);
    return acc;
  }, new Map());

  els.companyList.innerHTML = [...groups.entries()].map(([industry, companies]) => `
    <section class="company-group">
      <div class="company-group-title">
        <span>${escapeHtml(industry)}</span>
        <em>${companies.length}</em>
      </div>
      <div class="company-group-pills">
        ${companies.map((company) => `
          <button class="company-pill ${company.id === state.activeCompanyId ? "active" : ""}" data-company="${company.id}">
            ${escapeHtml(company.ticker || company.name)}
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");

  document.querySelectorAll("[data-company]").forEach((button) => {
    button.addEventListener("click", () => {
      selectCompany(button.dataset.company);
    });
  });
}

function renderRailTabs() {
  document.querySelectorAll("[data-rail-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.railView === state.railView);
  });
}

function selectCompany(companyId) {
  state.activeCompanyId = companyId;
  state.activeItemId = "";
  state.searchQuery = "";
  state.companyWorkspaceTab = "home";
  state.railView = "notes";
  saveState();
  render();
  maybeAutoRefreshCompany(companyId);
}

function renderEditor() {
  const company = activeCompany();
  const item = selectedItem();
  els.activeTicker.textContent = company.ticker || "公司";
  els.companyNameInput.value = company.name || "";
  els.tickerInput.value = company.ticker || "";
  els.cikInput.value = company.cik || "";
  els.topicsInput.value = (company.topics || []).join(", ");
  els.noteInput.value = company.notes || "";
  els.searchInput.value = state.searchQuery || "";

  if (!item) {
    els.selectedMaterialMeta.textContent = "未选择";
    els.openMaterialUrlBtn.hidden = true;
    els.openMaterialUrlBtn.dataset.openUrl = "";
    els.materialTitleInput.value = "";
    els.materialFolderSelect.value = "inbox";
    els.materialTypeSelect.value = "local";
    els.materialTagsInput.value = "";
    els.sourceEditor.value = "";
    els.viewEditor.value = "";
    return;
  }

  const link = materialUrl(item);
  els.selectedMaterialMeta.textContent = `${item.source || item.form || item.type} · ${formatTime(item.publishedAt || item.createdAt)} · ${activeCompany().ticker || activeCompany().name}`;
  els.openMaterialUrlBtn.hidden = !link;
  els.openMaterialUrlBtn.dataset.openUrl = link;
  els.materialTitleInput.value = readableText(item.title) || "";
  els.materialFolderSelect.value = item.folderId || (item.companyId ? "company" : "inbox");
  els.materialTypeSelect.value = item.type || "local";
  els.materialTagsInput.value = materialTags(item).join(", ");
  els.sourceEditor.value = materialSource(item);
  els.viewEditor.value = materialView(item);
  els.sourceEditor.hidden = state.editorTab === "view";
  els.viewEditor.hidden = state.editorTab !== "view";
  els.sourceTabBtn.classList.toggle("active", state.editorTab !== "view");
  els.viewTabBtn.classList.toggle("active", state.editorTab === "view");
}

function render() {
  renderRailTabs();
  renderIntakeQueue();
  renderNotes();
  renderFolderBoard();
  renderCompanyWorkspace();
  renderBrief();
  renderWorkflow();
  renderPmBoard();
  renderMarkets();
  renderCompanies();
  renderEditor();
}

async function maybeAutoRefreshCompany(companyId) {
  if (autoRefreshingCompanies.has(companyId)) return;
  if (companyOpenNewsCount(companyId) >= 8) return;
  autoRefreshingCompanies.add(companyId);
  renderNotes();
  try {
    const company = state.companies.find((row) => row.id === companyId) || activeCompany();
    await refreshOpenInfo({ auto: true, company });
  } finally {
    autoRefreshingCompanies.delete(companyId);
    render();
  }
}

async function refreshOpenInfo(options = {}) {
  const company = options.company || activeCompany();
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
    if (!options.auto) {
      const message = sample(company.id, "open", "公开信息刷新失败", error.message || "上游暂时不可用", "SYSTEM", new Date().toISOString());
      addItems([message]);
    }
  } finally {
    els.refreshBtn.disabled = false;
    els.refreshBtn.textContent = "刷新";
  }
}

async function importFiles(files) {
  const company = activeCompany();
  const imported = await Promise.all([...files].map(async (file) => {
    let text = "";
    try {
      text = await file.text();
    } catch {
      text = "";
    }
    const summary = text.replace(/\s+/g, " ").trim().slice(0, 280);
    return {
      id: `${company.id}-${file.name}-${file.lastModified}`,
      companyId: company.id,
      type: "local",
      folderId: "cloud",
      tags: ["云端文件", "导入"],
      title: file.name,
      source: company.ticker || "LOCAL",
      sourceText: text || `文件已上传到 ${company.ticker || company.name} 云端文件夹。暂不支持直接解析此文件类型。`,
      viewText: "",
      createdAt: new Date(file.lastModified || Date.now()).toISOString(),
      publishedAt: new Date(file.lastModified || Date.now()).toISOString(),
      summary: summary || `${file.name} 已上传到云端文件夹`
    };
  }));
  addItems(imported);
  state.railView = "folders";
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

function saveResearchNote() {
  const company = activeCompany();
  const note = els.noteInput.value.trim();
  company.notes = note;

  let noteItem = null;
  if (note) {
    const now = new Date().toISOString();
    const id = `${company.id}-pm-research-note`;
    const existing = state.items.find((item) => item.id === id);
    noteItem = {
      id,
      companyId: company.id,
      type: "local",
      folderId: "research",
      tags: ["PM Note"],
      title: `${company.ticker || company.name} 研究笔记`,
      source: "PM NOTE",
      sourceText: note,
      viewText: existing?.viewText || "",
      createdAt: existing?.createdAt || now,
      publishedAt: now,
      summary: note.replace(/\s+/g, " ").slice(0, 280)
    };
    if (existing) {
      Object.assign(existing, noteItem);
    } else {
      state.items.unshift(noteItem);
    }
  }

  saveState();
  render();
  persistCompany(company);
  if (noteItem) persistItems([noteItem]);
}

function normalizeTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function saveSelectedMaterial() {
  const item = selectedItem();
  if (!item) return;
  item.title = els.materialTitleInput.value.trim() || item.title || "未命名材料";
  item.folderId = els.materialFolderSelect.value;
  item.type = els.materialTypeSelect.value;
  item.tags = normalizeTags(els.materialTagsInput.value);
  item.sourceText = els.sourceEditor.value;
  item.viewText = els.viewEditor.value;
  item.summary = (item.viewText || item.sourceText || item.summary || "").replace(/\s+/g, " ").trim().slice(0, 280);
  item.publishedAt = new Date().toISOString();
  item.createdAt = item.createdAt || item.publishedAt;
  item.companyId = item.companyId || activeCompany().id;
  saveState();
  render();
  persistItems([item]);
}

function createMaterial() {
  const company = activeCompany();
  const now = new Date().toISOString();
  const item = {
    id: `${company.id}-material-${Date.now()}`,
    companyId: company.id,
    type: "local",
    folderId: "inbox",
    tags: ["待处理"],
    title: `${company.ticker || company.name} 新材料`,
    source: company.ticker || "LOCAL",
    sourceText: "",
    viewText: "",
    summary: "等待录入 Source。",
    createdAt: now,
    publishedAt: now
  };
  state.items.unshift(item);
  state.activeItemId = item.id;
  state.editorTab = "source";
  saveState();
  render();
  persistItems([item]);
  els.sourceEditor.focus();
}

function appendMockAiOutput(action) {
  const item = selectedItem();
  if (!item) return;
  saveSelectedMaterial();
  const current = selectedItem();
  const title = current.title || "当前材料";
  const source = materialSource(current);
  const stamp = new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const outputs = {
    summary: `## ${stamp} 摘要\n\n- 核心信息：${source.slice(0, 120) || title}\n- 投资含义：需要判断这条信息是否改变收入、利润率、估值或仓位假设。\n- 下一步：补充来源、日期和待验证问题。`,
    questions: `## ${stamp} 问题清单\n\n1. 这条材料支持哪一个投资判断？\n2. 对 ${activeCompany().ticker || activeCompany().name} 的收入、利润或估值影响是什么？\n3. 还缺哪一个反证或验证数据？`,
    company: `## ${stamp} 公司视图\n\n公司：${activeCompany().name}\n主题：${(activeCompany().topics || []).join(" / ") || "未设置"}\n\n把这条材料归入：业务变化、竞争格局、管理层表述、财务影响或催化剂。`,
    weekly: `## ${stamp} 周报素材\n\n一句话结论：${title}\n\n可复用证据：${(source || current.summary || "").slice(0, 160)}\n\n待跟进：下次更新 Daily Brief 前确认影响级别。`
  };
  current.viewText = [materialView(current), outputs[action]].filter(Boolean).join("\n\n");
  current.summary = current.viewText.replace(/\s+/g, " ").slice(0, 280);
  current.publishedAt = new Date().toISOString();
  state.editorTab = "view";
  saveState();
  render();
  persistItems([current]);
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

function splitDelimitedLine(line, delimiter) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseCompanyRows(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const delimiter = lines.some((line) => line.includes("\t")) ? "\t" : ",";
  const rows = lines.map((line) => splitDelimitedLine(line, delimiter));
  const header = rows[0].map((cell) => cell.toLowerCase().replace(/\s+/g, ""));
  const hasHeader = header.some((cell) => ["公司", "公司名称", "name", "company", "ticker", "代码", "股票代码", "cik", "主题", "topics", "行业", "industry", "sector", "分类"].includes(cell));
  const body = hasHeader ? rows.slice(1) : rows;

  const findIndex = (names, fallback) => {
    const index = header.findIndex((cell) => names.includes(cell));
    return index >= 0 ? index : fallback;
  };
  const nameIndex = hasHeader ? findIndex(["公司", "公司名称", "name", "company", "companyname"], 0) : 0;
  const tickerIndex = hasHeader ? findIndex(["代码", "股票代码", "ticker", "symbol"], 1) : 1;
  const cikIndex = hasHeader ? findIndex(["cik", "sec", "seccik"], 2) : 2;
  const topicsIndex = hasHeader ? findIndex(["主题", "topics", "tags", "关注点"], 3) : 3;
  const industryIndex = hasHeader ? findIndex(["行业", "industry", "sector", "分类"], -1) : -1;

  return body.map((row) => {
    const name = (row[nameIndex] || "").trim();
    const ticker = (row[tickerIndex] || "").trim().toUpperCase();
    const cik = (row[cikIndex] || "").replace(/\D/g, "");
    const topics = (row[topicsIndex] || "")
      .split(/[;,，、]/)
      .map((topic) => topic.trim())
      .filter(Boolean);
    const industry = industryIndex >= 0 ? (row[industryIndex] || "").trim() : "";
    if (!name && !ticker) return null;
    const id = (ticker || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return {
      id,
      name: name || ticker,
      ticker,
      cik,
      industry,
      topics,
      notes: ""
    };
  }).filter(Boolean);
}

function updateCompanyImportPreview() {
  const rows = parseCompanyRows(els.companyImportText.value);
  els.companyImportPreview.textContent = rows.length
    ? `将导入 ${rows.length} 家公司：${rows.slice(0, 4).map((row) => row.ticker || row.name).join("、")}${rows.length > 4 ? "..." : ""}`
    : "等待导入";
}

function importCompanies() {
  const rows = parseCompanyRows(els.companyImportText.value);
  if (!rows.length) return;

  const existing = new Map(state.companies.map((company) => [company.id, company]));
  rows.forEach((row) => {
    const previous = existing.get(row.id);
    if (previous) {
      Object.assign(previous, {
        name: row.name || previous.name,
        ticker: row.ticker || previous.ticker,
        cik: row.cik || previous.cik,
        industry: row.industry || previous.industry,
        topics: row.topics.length ? row.topics : previous.topics
      });
    } else {
      state.companies.push(row);
      existing.set(row.id, row);
    }
  });

  state.activeCompanyId = rows[0].id;
  state.activeItemId = "";
  state.searchQuery = "";
  els.companyImportText.value = "";
  els.companyImportFile.value = "";
  updateCompanyImportPreview();
  saveState();
  render();
  rows.forEach((company) => persistCompany(existing.get(company.id) || company));
  maybeAutoRefreshCompany(state.activeCompanyId);
}

function createCustomFolder() {
  const name = prompt("新建分类文件夹名称");
  if (!name?.trim()) return;
  const folder = {
    id: `folder-${Date.now().toString(36)}`,
    name: name.trim(),
    createdAt: new Date().toISOString()
  };
  state.customFolders = [...customFolders(), folder];
  state.railView = "folders";
  state.folderPath = [`custom:${folder.id}`];
  saveState();
  render();
}

async function uploadFilesToCustomFolder(files, folderId) {
  const folder = customFolders().find((row) => row.id === folderId);
  if (!folder) return;
  const imported = await Promise.all([...files].map(async (file) => {
    let text = "";
    try {
      text = await file.text();
    } catch {
      text = "";
    }
    const now = new Date().toISOString();
    const summary = text.replace(/\s+/g, " ").trim().slice(0, 280);
    return {
      id: `${folder.id}-${file.name}-${file.lastModified || Date.now()}`,
      companyId: null,
      type: "local",
      folderId: `custom:${folder.id}`,
      tags: ["自定义分类", folder.name],
      title: file.name,
      source: folder.name,
      sourceText: text || `文件已上传到「${folder.name}」。暂不支持直接解析此文件类型。`,
      viewText: "",
      createdAt: now,
      publishedAt: now,
      summary: summary || `${file.name} 已上传到「${folder.name}」`
    };
  }));
  addItems(imported);
  state.railView = "folders";
  state.folderPath = [`custom:${folder.id}`];
  els.folderUploadInput.value = "";
  saveState();
  render();
}

els.refreshBtn.addEventListener("click", refreshOpenInfo);
document.addEventListener("click", (event) => {
  const opener = event.target.closest("[data-open-url]");
  if (!opener) return;
  const url = opener.dataset.openUrl;
  if (!url) return;
  event.preventDefault();
  event.stopPropagation();
  openExternalUrl(url);
});
document.addEventListener("click", (event) => {
  const companyTab = event.target.closest("[data-company-tab]");
  if (companyTab) {
    state.companyWorkspaceTab = companyTab.dataset.companyTab;
    saveState();
    render();
    return;
  }
  const back = event.target.closest("[data-folder-back]");
  if (back) {
    state.folderPath = [];
    saveState();
    render();
    return;
  }
  const openFolder = event.target.closest("[data-open-folder]");
  if (openFolder) {
    state.railView = "folders";
    state.folderPath = [openFolder.dataset.openFolder];
    saveState();
    render();
    return;
  }
  const folder = event.target.closest("[data-folder-company]");
  if (folder) {
    selectCompany(folder.dataset.folderCompany);
    return;
  }
  const customFolder = event.target.closest("[data-custom-folder]");
  if (customFolder) {
    state.railView = "folders";
    state.folderPath = [`custom:${customFolder.dataset.customFolder}`];
    saveState();
    render();
    return;
  }
  const createFolder = event.target.closest("[data-create-folder]");
  if (createFolder) {
    createCustomFolder();
    return;
  }
  const uploadFolder = event.target.closest("[data-upload-folder]");
  if (uploadFolder) {
    els.folderUploadInput.dataset.folderId = uploadFolder.dataset.uploadFolder;
    els.folderUploadInput.click();
    return;
  }
  const refresh = event.target.closest("[data-workspace-refresh]");
  if (refresh) {
    refreshOpenInfo();
    return;
  }
  const openMaterial = event.target.closest("[data-open-material]");
  if (openMaterial) {
    createMaterial();
    return;
  }
  const uploadCurrentCompany = event.target.closest("[data-upload-current-company]");
  if (uploadCurrentCompany) {
    els.fileInput.click();
    return;
  }
  const openCompanyFolder = event.target.closest("[data-open-folder-for-company]");
  if (openCompanyFolder) {
    state.railView = "folders";
    state.folderPath = [inferIndustry(activeCompany())];
    saveState();
    render();
  }
});
document.querySelectorAll("[data-rail-view]").forEach((button) => {
  button.addEventListener("click", () => {
    state.railView = button.dataset.railView;
    state.searchQuery = "";
    if (state.railView === "folders") state.folderPath = [];
    saveState();
    render();
  });
});
els.noteStream.addEventListener("click", (event) => {
  const button = event.target.closest("[data-item-id]");
  if (!button) return;
  const item = state.items.find((row) => row.id === button.dataset.itemId);
  if (item?.companyId) {
    state.activeCompanyId = item.companyId;
  }
  state.companyWorkspaceTab = "transcript";
  state.activeItemId = button.dataset.itemId;
  saveState();
  render();
});
els.searchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value;
  saveState();
  render();
});
els.fileInput.addEventListener("change", (event) => importFiles(event.target.files));
els.folderUploadInput.addEventListener("change", (event) => uploadFilesToCustomFolder(event.target.files, event.target.dataset.folderId));
els.saveCompanyBtn.addEventListener("click", updateActiveCompanyFromForm);
els.saveNoteBtn.addEventListener("click", saveResearchNote);
els.newMaterialBtn.addEventListener("click", createMaterial);
els.saveMaterialBtn.addEventListener("click", saveSelectedMaterial);
els.sourceTabBtn.addEventListener("click", () => {
  state.editorTab = "source";
  saveState();
  renderEditor();
});
els.viewTabBtn.addEventListener("click", () => {
  state.editorTab = "view";
  saveState();
  renderEditor();
});
document.querySelectorAll("[data-ai-action]").forEach((button) => {
  button.addEventListener("click", () => appendMockAiOutput(button.dataset.aiAction));
});
els.addCompanyBtn.addEventListener("click", () => els.companyDialog.showModal());
els.importCompaniesBtn.addEventListener("click", () => {
  updateCompanyImportPreview();
  els.companyImportDialog.showModal();
});
els.companyImportText.addEventListener("input", updateCompanyImportPreview);
els.companyImportFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  els.companyImportText.value = await file.text();
  updateCompanyImportPreview();
});
els.confirmCompanyImport.addEventListener("click", importCompanies);
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

function openExternalUrl(url) {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) window.location.href = url;
}

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
