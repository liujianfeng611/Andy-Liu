const storageKey = "investment-intel-workstation-v2";

const defaultState = {
  activeCompanyId: "amzn",
  activeItemId: "amzn-Amazon Launches Supply Chain Service for Sellers",
  searchQuery: "",
  editorTab: "source",
  companyWorkspaceTab: "home",
  noteReaderTab: "analyst",
  readerMode: "company",
  railView: "notes",
  themeMode: "dark",
  dailyNewsTab: "sources",
  dailyNewsSources: [],
  dailyNewsItems: [],
  dailyNewsCategorySummaries: {},
  stockPrices: {},
  stockChartRange: "3y",
  stockChartInterval: "1wk",
  stockChartIndicator: "ma",
  teamFiles: [],
  folderSearchQuery: "",
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

const noteReaderTabs = [
  ["analyst", "小分析师"],
  ["idea", "想法"],
  ["port", "Port"],
  ["coverage", "Coverage"],
  ["note-taker", "Note Taker"],
  ["critic", "批判者"],
  ["numbers", "Numbers"],
  ["debate", "论点"],
  ["research", "研究包"],
  ["notebook", "NotebookLM"],
  ["handler", "处理者"],
  ["transcript", "Transcript"]
];

const noteProcessorModels = [
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite", provider: "google" },
  { id: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview", provider: "google" },
  { id: "gpt-5.5", label: "GPT 5.5", provider: "openai" },
  { id: "gpt-5.4-mini", label: "GPT 5.4 Mini", provider: "openai" },
  { id: "glm-5.1", label: "GLM 5.1", provider: "glm" },
  { id: "MiniMax-M2.7", label: "MiniMax M2.7", provider: "minimax" },
  { id: "mimo-v2.5-pro", label: "Mimo v2.5 Pro", provider: "mimo" }
];

const stockRangeOptions = [
  ["3mo", "3M"],
  ["6mo", "6M"],
  ["1y", "1Y"],
  ["3y", "3Y"],
  ["5y", "5Y"]
];

const stockIntervalOptions = [
  ["1d", "日K"],
  ["1wk", "周K"],
  ["1mo", "月K"],
  ["3mo", "季K"]
];

const stockIndicatorOptions = [
  ["ma", "均线"],
  ["volume", "成交量"],
  ["macd", "MACD"],
  ["rsi", "RSI"]
];

const dailyNewsSourceCatalog = [
  {
    category: "科技资讯",
    icon: "▣",
    rows: [
      ["theverge.com", "latest tech news", 4],
      ["techcrunch.com", "latest startup tech news", 4],
      ["arstechnica.com", "latest tech news", 3],
      ["wired.com", "latest tech news", 3],
      ["platformer.news", "latest tech analysis", 2],
      ["stratechery.com", "latest analysis", 3],
      ["theinformation.com", "latest tech news", 3],
      ["techmeme.com", "latest tech news", 3],
      ["9to5mac.com", "latest Apple news", 2]
    ]
  },
  {
    category: "金融新闻",
    icon: "💰",
    rows: [
      ["cnbc.com", "latest business news", 4],
      ["reuters.com", "latest business markets news", 4],
      ["ft.com", "latest business news", 3],
      ["bloomberg.com", "latest markets business news", 4],
      ["wsj.com", "latest business markets news", 3],
      ["marketwatch.com", "latest stock market news", 3],
      ["seekingalpha.com", "latest stock news", 3],
      ["semafor.com", "latest business news", 2],
      ["广义搜索", "earnings report beat miss guidance revenue quarterly results", 4]
    ]
  },
  {
    category: "AI动态",
    icon: "🤖",
    rows: [
      ["techcrunch.com", "latest AI startup news", 3],
      ["venturebeat.com", "latest AI news", 3],
      ["openrouter.ai", "rankings models", 3],
      ["anthropic.com", "latest news announcements", 2],
      ["openai.com", "latest news announcements", 2],
      ["theinformation.com", "latest AI news", 3],
      ["huggingface.co", "latest model release trending", 2],
      ["artificialanalysis.ai", "latest AI model benchmark", 2],
      ["广义搜索", "OpenAI Anthropic Google DeepMind model release ARR funding partnership", 4],
      ["广义搜索", "LLM benchmark Claude GPT Gemini new release", 3],
      ["广义搜索", "AI agent coding autonomous tool use enterprise", 3]
    ]
  },
  {
    category: "半导体",
    icon: "🔬",
    rows: [
      ["semianalysis.com", "latest semiconductor analysis", 4],
      ["tomshardware.com", "latest hardware news", 3],
      ["digitimes.com", "latest semiconductor news", 3],
      ["semiwiki.com", "latest semiconductor news", 3],
      ["eenewseurope.com", "latest semiconductor news", 2],
      ["广义搜索", "TSMC ASML Nvidia AMD Broadcom Marvell chip semiconductor news", 4],
      ["广义搜索", "Samsung SK Hynix Micron memory HBM chip news", 3],
      ["广义搜索", "GPU AI chip data center power consumption cooling", 2]
    ]
  },
  {
    category: "亚洲",
    icon: "🌏",
    rows: [
      ["36kr.com", "latest Chinese tech news", 4],
      ["nikkeiasia.com", "latest Asia business news", 4],
      ["scmp.com", "latest China business news", 4],
      ["techinasia.com", "latest Asia startup news", 3],
      ["caixinglobal.com", "latest China business news", 3],
      ["pandaily.com", "latest China tech news", 3],
      ["koreajoongangdaily.joins.com", "latest Korea business tech news", 2],
      ["japantimes.co.jp", "latest Japan business tech news", 2],
      ["广义搜索", "China Japan Korea tech company business news", 4],
      ["广义搜索", "Tencent Alibaba ByteDance Meituan PDD SEA Grab latest news", 3],
      ["广义搜索", "China AI DeepSeek MiniMax Kimi Baidu Zhipu model latest", 3]
    ]
  },
  {
    category: "宏观/地缘",
    icon: "🌐",
    rows: [
      ["reuters.com", "latest geopolitics war trade tariff sanctions", 3],
      ["ft.com", "latest central bank interest rate monetary policy", 3],
      ["bloomberg.com", "latest Fed ECB BOJ central bank policy", 3],
      ["foreignpolicy.com", "latest geopolitics conflict Middle East", 2],
      ["广义搜索", "Iran Israel Middle East conflict war latest update", 3],
      ["广义搜索", "US China trade tariff sanctions tech restriction", 3],
      ["广义搜索", "Federal Reserve interest rate cut hike inflation CPI jobs", 3],
      ["广义搜索", "oil price OPEC crude supply demand energy", 2]
    ]
  },
  {
    category: "云/SaaS",
    icon: "☁",
    rows: [
      ["saastr.com", "latest SaaS news trends", 3],
      ["cloudflare.com", "latest blog announcements", 2],
      ["azure.microsoft.com", "latest blog announcements", 2],
      ["广义搜索", "Cloudflare Datadog CrowdStrike ServiceNow Snowflake cloud SaaS earnings news", 4],
      ["广义搜索", "AWS Azure Google Cloud infrastructure pricing data center", 3],
      ["广义搜索", "SaaS AI disruption enterprise software automation agent", 3]
    ]
  },
  {
    category: "广告/媒体",
    icon: "📺",
    rows: [
      ["adweek.com", "latest advertising news", 3],
      ["searchengineland.com", "latest search marketing news", 3],
      ["adexchanger.com", "latest ad tech news", 3],
      ["digiday.com", "latest media advertising news", 3],
      ["广义搜索", "Meta Google Amazon digital advertising revenue market share", 3],
      ["广义搜索", "Trade Desk DSP programmatic advertising CTV streaming", 2]
    ]
  },
  {
    category: "游戏行业",
    icon: "🎮",
    rows: [
      ["gamesindustry.biz", "latest gaming industry news", 4],
      ["ign.com", "latest gaming news", 3],
      ["polygon.com", "latest gaming news", 3],
      ["sensortower.com", "latest mobile game charts", 2],
      ["广义搜索", "Steam top selling games chart this week", 3],
      ["广义搜索", "Nintendo Switch PlayStation Xbox console sales news", 2],
      ["广义搜索", "Roblox Nexon Tencent gaming revenue earnings", 2]
    ]
  },
  {
    category: "加密/支付",
    icon: "🪙",
    rows: [
      ["coindesk.com", "latest crypto news", 3],
      ["theblock.co", "latest crypto blockchain news", 3],
      ["广义搜索", "Circle USDC stablecoin payment crypto regulation IPO", 3],
      ["广义搜索", "Bitcoin Ethereum institutional adoption ETF", 2],
      ["广义搜索", "AI agent crypto payment blockchain web3", 2]
    ]
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
const autoRefreshingCompanies = new Set();
let noteProcessorBusy = false;
let noteProcessorStatus = "";
let ideaSaveTimer = null;
let dailyNewsBusy = false;
let dailyNewsStatus = "";
let stockPriceBusy = false;
let stockPriceStatus = "";

const els = {
  noteStream: document.querySelector("#noteStream"),
  railCompanyJump: document.querySelector("#railCompanyJump"),
  railCompanyJumpInput: document.querySelector("#railCompanyJumpInput"),
  railCompanyJumpHint: document.querySelector("#railCompanyJumpHint"),
  railCompanyJumpList: document.querySelector("#railCompanyJumpList"),
  railCompanyJumpRecents: document.querySelector("#railCompanyJumpRecents"),
  queueTotal: document.querySelector("#queueTotal"),
  intakeQueue: document.querySelector("#intakeQueue"),
  searchInput: document.querySelector("#searchInput"),
  briefList: document.querySelector("#briefList"),
  workflowGrid: document.querySelector("#workflowGrid"),
  impactMatrix: document.querySelector("#impactMatrix"),
  researchQueue: document.querySelector("#researchQueue"),
  agentTabs: document.querySelector("#agentTabs"),
  themeToggleBtn: document.querySelector("#themeToggleBtn"),
  folderBoard: document.querySelector("#folderBoard"),
  dailyNewsBoard: document.querySelector("#dailyNewsBoard"),
  teamBoard: document.querySelector("#teamBoard"),
  companyWorkspace: document.querySelector("#companyWorkspace"),
  companyUploadInput: document.querySelector("#companyUploadInput"),
  folderUploadInput: document.querySelector("#folderUploadInput"),
  transcriptFileInput: document.querySelector("#transcriptFileInput"),
  teamUploadInput: document.querySelector("#teamUploadInput"),
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
  globalUploadBtn: document.querySelector("#globalUploadBtn"),
  globalSaveWebBtn: document.querySelector("#globalSaveWebBtn"),
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
  portfolioUploadInput: document.querySelector("#portfolioUploadInput"),
  coverageUploadInput: document.querySelector("#coverageUploadInput"),
  portfolioCoverageCount: document.querySelector("#portfolioCoverageCount"),
  portfolioCoverageSummary: document.querySelector("#portfolioCoverageSummary"),
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
    if (stored?.companies?.length) return normalizeState({ ...structuredClone(defaultState), ...stored });
  } catch {
    return normalizeState(structuredClone(defaultState));
  }
  return normalizeState(structuredClone(defaultState));
}

function normalizeState(nextState) {
  const known = new Set((nextState.dailyNewsSources || []).map(sourceKey));
  const defaults = dailyNewsSourceCatalog
    .flatMap((group) => group.rows.map((row) => catalogSourcePayload(group.category, row)))
    .filter((source) => !known.has(sourceKey(source)));
  nextState.dailyNewsSources = [...(nextState.dailyNewsSources || []), ...defaults];
  return nextState;
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

function htmlToPlainText(value) {
  const text = String(value || "");
  if (!/<[a-z][\s\S]*>/i.test(text)) return text;
  const doc = new DOMParser().parseFromString(text, "text/html");
  doc.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
  return (doc.body.textContent || text).replaceAll("\u00a0", " ");
}

function looksLikeBinaryText(text) {
  const value = String(text || "");
  if (!value.trim()) return false;
  if (/^%PDF-|^PK\u0003\u0004|^\u0000/.test(value)) return true;
  const sampleText = value.slice(0, 5000);
  const controls = (sampleText.match(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g) || []).length;
  const replacements = (sampleText.match(/\uFFFD/g) || []).length;
  const oddBytes = (sampleText.match(/[�\u0000]/g) || []).length;
  const length = Math.max(sampleText.length, 1);
  return controls / length > 0.01 || replacements / length > 0.01 || oddBytes > 12;
}

function cleanTranscriptText(value) {
  const raw = String(value || "");
  if (!raw.trim()) return "";
  if (looksLikeBinaryText(raw)) return "";
  return htmlToPlainText(raw)
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/\uFFFD/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isTextLikeFile(file) {
  const name = file?.name || "";
  const type = file?.type || "";
  return /^text\//i.test(type)
    || /json|csv|xml|html|markdown|javascript|typescript/i.test(type)
    || /\.(txt|md|markdown|csv|tsv|json|html?|xml|log|srt|vtt)$/i.test(name);
}

function fileKind(file) {
  const name = file?.name || "";
  const type = file?.type || "";
  if (/\.pdf$/i.test(name) || type === "application/pdf") return "pdf";
  if (/\.docx$/i.test(name) || /wordprocessingml/i.test(type)) return "docx";
  if (/\.(xlsx|xls)$/i.test(name) || /spreadsheet|excel/i.test(type)) return "sheet";
  if (isTextLikeFile(file)) return "text";
  return "unknown";
}

const scriptLoaders = new Map();

function loadScriptOnce(url) {
  if (scriptLoaders.has(url)) return scriptLoaders.get(url);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`无法加载文件解析器：${url}`));
    document.head.appendChild(script);
  });
  scriptLoaders.set(url, promise);
  return promise;
}

async function extractPdfText(buffer) {
  const pdfjsLib = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages = [];
  const pageLimit = Math.min(pdf.numPages, 80);
  for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str || "").join(" ");
    if (text.trim()) pages.push(`第 ${pageNumber} 页\n${text}`);
  }
  if (pdf.numPages > pageLimit) pages.push(`已读取前 ${pageLimit} 页，共 ${pdf.numPages} 页。`);
  return cleanTranscriptText(pages.join("\n\n"));
}

async function extractDocxText(buffer) {
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js");
  if (!window.mammoth?.extractRawText) throw new Error("Word 解析器未就绪");
  const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
  return cleanTranscriptText(result.value || "");
}

async function extractSheetText(buffer) {
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js");
  if (!window.XLSX?.read) throw new Error("Excel 解析器未就绪");
  const workbook = window.XLSX.read(buffer, { type: "array" });
  const sections = workbook.SheetNames.slice(0, 20).map((sheetName) => {
    const csv = window.XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], { blankrows: false });
    return cleanTranscriptText(`Sheet: ${sheetName}\n${csv}`);
  }).filter(Boolean);
  if (workbook.SheetNames.length > 20) sections.push(`已读取前 20 个 sheet，共 ${workbook.SheetNames.length} 个。`);
  return cleanTranscriptText(sections.join("\n\n"));
}

async function readTableFile(file) {
  if (!file) return "";
  if (/\.(xlsx|xls)$/i.test(file.name || "")) {
    await loadScriptOnce("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js");
    if (!window.XLSX?.read) throw new Error("Excel 解析器未就绪");
    const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return "";
    return window.XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: "\t", blankrows: false });
  }
  return file.text();
}

async function readUploadText(file) {
  const kind = fileKind(file);
  const buffer = await file.arrayBuffer();

  try {
    if (kind === "pdf") {
      const text = await extractPdfText(buffer);
      if (text) return { text, readable: true, message: "" };
      return { text: "", readable: false, message: `${file.name} 已上传，但 PDF 没有提取到可复制文字，可能是扫描件。` };
    }
    if (kind === "docx") {
      const text = await extractDocxText(buffer);
      if (text) return { text, readable: true, message: "" };
      return { text: "", readable: false, message: `${file.name} 已上传，但 Word 文件没有提取到正文。` };
    }
    if (kind === "sheet") {
      const text = await extractSheetText(buffer);
      if (text) return { text, readable: true, message: "" };
      return { text: "", readable: false, message: `${file.name} 已上传，但表格里没有提取到内容。` };
    }
  } catch (error) {
    return {
      text: "",
      readable: false,
      message: `${file.name} 已上传，但解析文件内容失败：${error.message || "解析器不可用"}。`
    };
  }

  if (kind !== "text") {
    return {
      text: "",
      readable: false,
      message: `${file.name} 已上传。这个文件类型目前还不能直接读取正文。`
    };
  }

  const decoders = ["utf-8", "gb18030", "big5"];
  for (const encoding of decoders) {
    try {
      const decoded = new TextDecoder(encoding, { fatal: encoding === "utf-8" }).decode(buffer);
      const cleaned = cleanTranscriptText(decoded);
      if (cleaned) return { text: cleaned, readable: true, message: "" };
    } catch {
      // Try the next common encoding.
    }
  }

  return {
    text: "",
    readable: false,
    message: `${file.name} 已上传，但正文编码无法可靠识别。`
  };
}

async function api(path, options = {}) {
  const base = window.location.protocol === "file:" ? "https://andy-workstation.pages.dev" : "";
  const response = await fetch(`${base}/api/${path}`, {
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
      notes: company.notes || "",
      industry: company.industry || "",
      universeType: company.universeType || "",
      portfolioStatus: company.portfolioStatus || "",
      coverageStatus: company.coverageStatus || "",
      positionWeight: company.positionWeight || "",
      positionShares: company.positionShares || "",
      costBasis: company.costBasis || "",
      coveragePriority: company.coveragePriority || "",
      universeNote: company.universeNote || ""
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
  return cleanTranscriptText(item?.sourceText || item?.rawText || readableText(item?.summary) || "");
}

function materialView(item) {
  return cleanTranscriptText(item?.viewText || "");
}

function materialPortfolioImpact(item) {
  return cleanTranscriptText(item?.portfolioImpactText || "");
}

function originalNoteText(item) {
  const text = [
    item?.sourceText,
    item?.rawText,
    readableText(item?.summary)
  ].map(cleanTranscriptText).filter(Boolean).join("\n\n").trim();
  return cleanTranscriptText(text);
}

function materialTranslation(item) {
  return cleanTranscriptText(item?.translationText || item?.translatedText || "");
}

function materialIdea(item) {
  return cleanTranscriptText(item?.ideaText || item?.idea || "");
}

function materialTranscript(item) {
  const text = [
    item?.sourceText,
    item?.rawText,
    item?.viewText,
    readableText(item?.summary)
  ].map(cleanTranscriptText).filter(Boolean).join("\n\n").trim();
  return cleanTranscriptText(text);
}

function transcriptNeedsFile(item, transcript) {
  if (!item) return false;
  const text = cleanTranscriptText(transcript || "");
  if (!text) return true;
  return /暂不.*解析正文|不能直接读取正文|编码无法可靠识别|读取正文时失败|解析文件内容失败|没有提取到/.test(text);
}

function rawStoredFileText(item) {
  return String(item?.sourceText || item?.rawText || "");
}

function storedTextLooksLikeFileBytes(item) {
  const text = rawStoredFileText(item);
  return /^%PDF-/.test(text) || /^PK[\u0003\u0005\u0007]/.test(text);
}

function storedTextToBytes(text) {
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) {
    bytes[index] = text.charCodeAt(index) & 0xff;
  }
  return bytes.buffer;
}

async function recoverStoredFileTranscript(item) {
  if (!storedTextLooksLikeFileBytes(item)) return false;
  const raw = rawStoredFileText(item);
  const buffer = storedTextToBytes(raw);
  const title = item.title || "";
  let text = "";
  try {
    if (/^%PDF-/.test(raw) || /\.pdf$/i.test(title)) {
      text = await extractPdfText(buffer);
    } else if (/\.docx$/i.test(title) || /\.doc$/i.test(title) || /^PK/.test(raw)) {
      text = await extractDocxText(buffer);
    }
  } catch {
    text = "";
  }
  if (!text) return false;
  item.sourceText = text;
  item.rawText = "";
  item.summary = text.replace(/\s+/g, " ").trim().slice(0, 280);
  item.tags = [...new Set([...materialTags(item), "自动恢复正文"])].slice(0, 12);
  item.publishedAt = new Date().toISOString();
  saveState();
  render();
  persistItems([item]);
  return true;
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
  if (!item) return false;
  if (!isVisibleMaterial(item)) return false;
  if (/新材料/.test(item.title || "") && /等待录入 Source/.test(item.summary || "")) return false;
  const hasReadableBody = Boolean(item.sourceText || item.rawText || item.viewText);
  const uploadedType = ["local", "ai", "note", "article", "transcript", "podcast"].includes(item.type);
  const uploadedTag = materialTags(item).some((tag) => /上传|笔记|文章|播客|转录|纪要|云端|导入/i.test(tag));
  if (item.type === "open" || item.type === "filing") return hasReadableBody || uploadedTag;
  return Boolean(uploadedType || item.folderId || hasReadableBody || uploadedTag);
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

function selectedNoteItem() {
  const active = state.items.find((item) => item.id === state.activeItemId);
  if (active && isUploadedNote(active)) return active;
  return noteListItems()[0] || null;
}

function noteTypeLabel(item) {
  const tags = materialTags(item).join(" ");
  if (/播客/i.test(tags)) return "播客";
  if (/纪要|会议/i.test(tags)) return "纪要";
  if (/转录/i.test(tags)) return "转录";
  if (item?.type === "ai") return "AI";
  if (item?.type === "local" || item?.type === "article") return "文章";
  return item?.type || "笔记";
}

function noteStatusLabel(item) {
  if (materialPortfolioImpact(item)) return "待归档";
  if (materialView(item)) return "待数字";
  if (materialTranslation(item)) return "待分析";
  if (materialTranscript(item)) return "待处理";
  return "待转录";
}

function notePrimaryTag(item) {
  const company = itemCompany(item);
  return company?.ticker || item?.source || materialTags(item)[0] || "NOTE";
}

function noteArchiveLabel(item) {
  const company = itemCompany(item);
  if (company?.name) return `已归档到 ${company.ticker || company.name}`;
  const folder = item?.folderName || item?.folderId;
  return folder ? `已归档到 ${folder}` : "归档";
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

function dailyNewsSources() {
  return Array.isArray(state.dailyNewsSources) ? state.dailyNewsSources : [];
}

function dailyNewsItems() {
  return Array.isArray(state.dailyNewsItems) ? state.dailyNewsItems : [];
}

function catalogSourceId(category, row) {
  return `${category}-${row[0]}-${row[1]}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function catalogSourceUrl(row) {
  const [domain, query] = row;
  const term = domain === "广义搜索" ? query : `site:${domain} ${query}`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(term)}&hl=en-US&gl=US&ceid=US:en`;
}

function sourceKey(source) {
  return `${source.category || ""}|${source.domain || ""}|${source.query || ""}|${source.url || ""}`;
}

function catalogSourcePayload(category, row) {
  const [domain, query, limit] = row;
  const isBroad = domain === "广义搜索";
  return {
    id: `catalog-${catalogSourceId(category, row)}`,
    name: isBroad ? query : domain,
    category,
    domain,
    query,
    limit,
    url: catalogSourceUrl(row),
    createdAt: new Date().toISOString()
  };
}

function enabledCatalogSourceKeys() {
  return new Set(dailyNewsSources().map(sourceKey));
}

function childCustomFolders(parentId = "") {
  return customFolders()
    .filter((folder) => (folder.parentId || "") === (parentId || ""))
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

function customFolderItems(folderId) {
  return state.items
    .filter(isVisibleMaterial)
    .filter((item) => item.folderId === `custom:${folderId}`)
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
}

function descendantCustomFolderIds(folderId) {
  const ids = new Set([folderId]);
  let changed = true;
  while (changed) {
    changed = false;
    customFolders().forEach((folder) => {
      if (!ids.has(folder.id) && ids.has(folder.parentId)) {
        ids.add(folder.id);
        changed = true;
      }
    });
  }
  return [...ids];
}

function companyOpenNewsCount(companyId) {
  return state.items
    .filter(isVisibleMaterial)
    .filter((item) => item.companyId === companyId && item.type === "open")
    .filter((item) => materialUrl(item))
    .length;
}

function teamFiles() {
  return Array.isArray(state.teamFiles) ? state.teamFiles : [];
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "0 KB";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
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

function companyAliasText(company) {
  const aliases = {
    AMZN: "Amazon 亚马逊",
    MSFT: "Microsoft 微软",
    NVDA: "NVIDIA Nvidia 英伟达",
    PLTR: "Palantir 帕兰蒂尔",
    AMD: "Advanced Micro Devices 超威",
    GOOGL: "Google Alphabet 谷歌",
    GOOG: "Google Alphabet 谷歌",
    META: "Meta Facebook 脸书",
    AAPL: "Apple 苹果",
    TSLA: "Tesla 特斯拉",
    TSM: "TSMC 台积电"
  };
  return aliases[String(company?.ticker || "").toUpperCase()] || "";
}

function companySearchText(company) {
  return [
    company?.name,
    company?.ticker,
    company?.cik,
    companyAliasText(company),
    ...(company?.topics || [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function slugCompanyId(value) {
  const base = String(value || "company")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `company-${Date.now().toString(36)}`;
  let id = base;
  let index = 2;
  while (state.companies.some((company) => company.id === id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function findCompanyByQuery(query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return null;
  const compact = normalized.replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
  return state.companies.find((company) => String(company.ticker || "").toLowerCase() === normalized)
    || state.companies.find((company) => String(company.name || "").toLowerCase() === normalized)
    || state.companies.find((company) => companySearchText(company).replace(/[^a-z0-9\u4e00-\u9fff]/g, "").includes(compact))
    || state.companies.find((company) => companySearchText(company).includes(normalized));
}

function createCompanyFromQuery(query) {
  const raw = String(query || "").trim();
  if (!raw) return null;
  const tickerLike = /^[a-z0-9.\-]{1,8}$/i.test(raw);
  const ticker = tickerLike ? raw.toUpperCase() : "";
  const company = {
    id: slugCompanyId(ticker || raw),
    name: ticker ? ticker : raw,
    ticker,
    cik: "",
    topics: [],
    notes: ""
  };
  state.companies = [...state.companies, company];
  persistCompany(company);
  return company;
}

function goToCompanyQuery(query) {
  const company = findCompanyByQuery(query) || createCompanyFromQuery(query);
  if (!company) return false;
  selectCompany(company.id);
  return true;
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
  if (state.railView === "team") {
    renderTeamRail();
    return;
  }

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
    const tags = [
      notePrimaryTag(item),
      noteTypeLabel(item),
      ...materialTags(item).filter((tag) => tag !== notePrimaryTag(item) && tag !== noteTypeLabel(item))
    ].filter(Boolean).slice(0, 2);
    return `
    <article class="note-item uploaded-note ${item.id === selectedId ? "active" : ""}">
      <button class="note-select" data-item-id="${escapeHtml(item.id)}" type="button">
        <div class="note-title">${escapeHtml(readableText(item.title))}</div>
        <div class="note-meta">
          <span>${escapeHtml(formatTime(item.publishedAt || item.createdAt))}</span>
          ${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </button>
      <button class="note-star" type="button" title="标记">☆</button>
      <button class="note-delete" data-delete-item="${escapeHtml(item.id)}" type="button" title="删除笔记">删除</button>
    </article>
  `;
  }).join("") || `<div class="empty-list">${emptyText}</div>`;
}

function renderTeamRail() {
  const files = teamFiles();
  els.noteStream.innerHTML = `
    <div class="team-rail-empty">${files.length ? `${files.length} 份团队 Port 文件` : "还没有团队 Port 数据"}</div>
    <button class="team-upload-rail" data-upload-team-file type="button">⇧ 上传 xlsx</button>
    ${files.length ? `
      <div class="team-file-list">
        ${files.slice(0, 20).map((file) => `
          <article class="team-file-row">
            <strong>${escapeHtml(file.name)}</strong>
            <span>${escapeHtml(formatTime(file.uploadedAt))} · ${escapeHtml(formatFileSize(file.size))}</span>
          </article>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function renderCloudFolders() {
  const path = Array.isArray(state.folderPath) ? state.folderPath : [];
  const selectedIndustry = path[0] || "";
  const selectedCustomId = selectedIndustry.startsWith("custom:") ? selectedIndustry.slice(7) : "";
  const selectedCustomFolder = customFolders().find((folder) => folder.id === selectedCustomId);
  const query = String(state.folderSearchQuery || "").trim().toLowerCase();
  const recentCompanies = [
    activeCompany(),
    ...state.companies
  ].filter((company, index, rows) => company && rows.findIndex((row) => row.id === company.id) === index).slice(0, 8);
  const railTop = `
    <div class="folder-rail-search">
      <span>⌕</span>
      <input data-folder-search type="search" placeholder="搜索文件夹..." value="${escapeHtml(state.folderSearchQuery || "")}" />
    </div>
    <section class="folder-rail-recents">
      <div><span>最近公司</span><em>当前 ${escapeHtml(activeCompany().name?.split(" ")[0] || activeCompany().ticker || "")}</em></div>
      <div class="folder-rail-recent-grid">
        ${recentCompanies.map((company) => `
          <button class="${company.id === state.activeCompanyId ? "active" : ""}" data-folder-company="${escapeHtml(company.id)}" type="button">
            <strong>${escapeHtml(company.name || company.ticker)}</strong>
            ${company.ticker ? `<em>${escapeHtml(company.ticker)}</em>` : ""}
          </button>
        `).join("")}
      </div>
    </section>
  `;

  if (!selectedIndustry) {
    const industryRows = sortedIndustryEntries().map(([industry, companies]) => {
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
    const customRows = childCustomFolders().map((folder) => {
      const nested = descendantCustomFolderIds(folder.id);
      const items = nested.flatMap((id) => customFolderItems(id));
      const subfolderCount = childCustomFolders(folder.id).length;
      return `
        <button class="cloud-folder directory custom" data-custom-folder="${escapeHtml(folder.id)}" type="button">
          <div class="folder-icon">▰</div>
          <div class="folder-main">
            <strong>${escapeHtml(folder.name)}</strong>
            <span>个人文件夹 · ${subfolderCount} 个子文件夹 · ${items.length} 份资料</span>
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
      ${railTop}
      <div class="folder-breadcrumb"><strong>云端文件夹</strong><span>按行业分类</span></div>
      ${rows.join("") || `<div class="empty-list">还没有分类文件夹。先在右侧投资组合雷达添加或导入公司。</div>`}
    `;
    return;
  }

  if (selectedCustomFolder) {
    const subfolders = childCustomFolders(selectedCustomFolder.id).map((folder) => {
      const items = descendantCustomFolderIds(folder.id).flatMap((id) => customFolderItems(id));
      return `
        <button class="cloud-folder directory custom" data-custom-folder="${escapeHtml(folder.id)}" type="button">
          <div class="folder-icon">▰</div>
          <div class="folder-main">
            <strong>${escapeHtml(folder.name)}</strong>
            <span>${childCustomFolders(folder.id).length} 个子文件夹 · ${items.length} 份资料</span>
          </div>
          <div class="folder-meta"><em>${items.length}</em><span>打开</span></div>
        </button>
      `;
    }).join("");
    const files = customFolderItems(selectedCustomFolder.id).map((item) => `
      <button class="cloud-folder" data-item-id="${escapeHtml(item.id)}" type="button">
        <div class="folder-icon">▱</div>
        <div class="folder-main">
          <strong>${escapeHtml(readableText(item.title))}</strong>
          <span>${escapeHtml(readableText(item.summary || item.url || "已保存资料"))}</span>
        </div>
        <div class="folder-meta"><em>${escapeHtml(item.source || "FILE")}</em><span>${formatTime(item.publishedAt || item.createdAt)}</span></div>
      </button>
    `).join("");
    els.noteStream.innerHTML = `
      ${railTop}
      <button class="folder-breadcrumb clickable" ${selectedCustomFolder.parentId ? `data-custom-folder="${escapeHtml(selectedCustomFolder.parentId)}"` : "data-folder-back"} type="button">
        <strong>云端文件夹 / ${escapeHtml(selectedCustomFolder.name)}</strong>
        <span>← 返回上级</span>
      </button>
      ${subfolders}${files || ""}${!subfolders && !files ? `<div class="empty-list">这个文件夹还没有资料。</div>` : ""}
    `;
    return;
  }

  const companies = state.companies
    .filter((company) => inferIndustry(company) === selectedIndustry)
    .filter((company) => companyMatchesFolderSearch(company, query));
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
    ${railTop}
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

function inferFolderRegion(company) {
  const text = `${company.market || ""} ${company.country || ""} ${company.exchange || ""} ${company.region || ""} ${company.name || ""} ${company.ticker || ""}`.toLowerCase();
  const ticker = String(company.ticker || "").toUpperCase();
  if (/\bjp\b|japan|tokyo|\.t$|jp$|日本/.test(text) || /^\d{4}\s?JP$/.test(ticker)) return "Japan";
  if (/\bkr\b|korea|kospi|韩国|korea/.test(text)) return "Korea";
  if (/\bhk\b|china|shanghai|shenzhen|china|中国|香港|\.hk$/.test(text) || /-W| ORD| ADR/.test(ticker)) return "China";
  if (/\btw\b|taiwan|台湾/.test(text)) return "Taiwan";
  if (/\bindia\b|印度/.test(text)) return "India";
  if (/\beu\b|europe|london|france|germany|欧洲/.test(text)) return "Europe";
  if (/\bglobal\b|全球/.test(text)) return "Global";
  if (/^[A-Z.]{1,6}$/.test(ticker)) return "US";
  return "Unsorted";
}

function folderRegionOrder(region) {
  return ["US", "China", "Global", "Japan", "Korea", "Taiwan", "India", "Europe", "Unsorted"].indexOf(region);
}

function groupCompaniesByRegion(companies) {
  return companies.reduce((acc, company) => {
    const region = inferFolderRegion(company);
    if (!acc.has(region)) acc.set(region, []);
    acc.get(region).push(company);
    return acc;
  }, new Map());
}

function companyMatchesFolderSearch(company, query) {
  if (!query) return true;
  const haystack = companySearchText(company).toLowerCase();
  return haystack.includes(query);
}

function folderMatchesSearch(label, companies, query) {
  if (!query) return true;
  const normalized = String(label || "").toLowerCase();
  return normalized.includes(query) || companies.some((company) => companyMatchesFolderSearch(company, query));
}

function sortedIndustryEntries() {
  const query = String(state.folderSearchQuery || "").trim().toLowerCase();
  return [...groupedCompanies().entries()]
    .filter(([industry, companies]) => folderMatchesSearch(industry, companies, query))
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

function folderRegionChips(companies, openIndustry = "") {
  const groups = [...groupCompaniesByRegion(companies).entries()]
    .sort((a, b) => {
      const ai = folderRegionOrder(a[0]);
      const bi = folderRegionOrder(b[0]);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a[0].localeCompare(b[0]);
    });
  return groups.map(([region, rows]) => `
    <button class="folder-chip ${openIndustry ? "" : "static"}" ${openIndustry ? `data-open-folder="${escapeHtml(openIndustry)}" data-region-jump="${escapeHtml(region)}"` : ""} type="button">
      <span>▱</span>${escapeHtml(region)} <em>${rows.length}</em>
    </button>
  `).join("");
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
    const customCards = childCustomFolders().map((folder) => {
      const nested = descendantCustomFolderIds(folder.id);
      const items = nested.flatMap((id) => customFolderItems(id));
      const subfolderCount = childCustomFolders(folder.id).length;
      return `
        <article class="folder-card-large custom-folder-card">
          <button class="folder-card-head" data-custom-folder="${escapeHtml(folder.id)}" type="button">
            <span class="folder-card-icon">▰</span>
            <strong>${escapeHtml(folder.name)}</strong>
            <em>${items.length}</em>
          </button>
          <p>${subfolderCount} 个子文件夹 · ${items.length} 份资料</p>
          <div class="folder-chip-grid">
            <button class="folder-chip" data-custom-folder="${escapeHtml(folder.id)}" type="button"><span>▱</span>打开</button>
            <button class="folder-chip" data-upload-folder="${escapeHtml(folder.id)}" type="button"><span>＋</span>上传资料</button>
          </div>
        </article>
      `;
    }).join("");
    const cards = sortedIndustryEntries().map(([industry, companies]) => {
      const fileCount = companies.reduce((sum, company) => sum + companyCloudItems(company.id).length, 0);
      const chips = folderRegionChips(companies, industry);
      return `
        <article class="folder-card-large">
          <button class="folder-card-head" data-open-folder="${escapeHtml(industry)}" type="button">
            <span class="folder-card-icon">▰</span>
            <strong>${escapeHtml(industry)}</strong>
            <em>${companies.length}</em>
          </button>
          <p>${companies.length} 家公司 · ${fileCount} 份资料</p>
          <div class="folder-chip-grid">${chips || '<span class="folder-empty">暂无公司</span>'}</div>
        </article>
      `;
    }).join("");

    els.folderBoard.innerHTML = `
      <div class="folder-board-top">
        <div>
          <span>公开</span>
          <h2>云端文件夹</h2>
          <p>按行业和地区管理公司材料，像本地电脑文件夹一样进入、上传、保存网页。</p>
        </div>
        <div class="folder-board-actions">
          <button data-create-folder type="button">新建文件夹</button>
        </div>
      </div>
      <div class="folder-card-grid-main">${customCards}${cards}</div>
    `;
    return;
  }

  if (selectedCustomFolder) {
    const childFolders = childCustomFolders(selectedCustomFolder.id);
    const folderCards = childFolders.map((folder) => {
      const nested = descendantCustomFolderIds(folder.id);
      const items = nested.flatMap((id) => customFolderItems(id));
      return `
        <article class="folder-card-large custom-folder-card">
          <button class="folder-card-head" data-custom-folder="${escapeHtml(folder.id)}" type="button">
          <span class="folder-card-icon">▰</span>
          <strong>${escapeHtml(folder.name)}</strong>
          <em>${items.length}</em>
        </button>
        <p>${childCustomFolders(folder.id).length} 个子文件夹 · ${items.length} 份资料</p>
        <div class="folder-chip-grid">
          <button class="folder-chip" data-upload-folder="${escapeHtml(folder.id)}" type="button"><span>＋</span>上传文件</button>
        </div>
      </article>
    `;
  }).join("");
    const items = customFolderItems(selectedCustomFolder.id);
    const fileCards = items.map((item) => `
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
        <button class="folder-board-back" ${selectedCustomFolder.parentId ? `data-custom-folder="${escapeHtml(selectedCustomFolder.parentId)}"` : "data-folder-back"} type="button">← 云端文件夹 / ${escapeHtml(selectedCustomFolder.name)}</button>
        <div class="folder-board-actions">
          <button data-create-folder="${escapeHtml(selectedCustomFolder.id)}" type="button">新建子文件夹</button>
          <button data-upload-folder="${escapeHtml(selectedCustomFolder.id)}" type="button">上传文件</button>
          <button data-delete-folder="${escapeHtml(selectedCustomFolder.id)}" type="button">删除文件夹</button>
        </div>
      </div>
      <div class="folder-url-save">
        <input data-save-web-url-input="${escapeHtml(selectedCustomFolder.id)}" placeholder="粘贴网页 / PDF / 文件链接，直接保存到这个文件夹" />
        <button data-save-web-url="${escapeHtml(selectedCustomFolder.id)}" type="button">保存网页</button>
      </div>
      <div class="folder-card-grid-main">${folderCards}${fileCards || ""}${!folderCards && !fileCards ? `<div class="empty-list">这个文件夹还没有资料。可以新建子文件夹、上传资料，或直接保存网页链接。</div>` : ""}</div>
    `;
    return;
  }

  const companies = state.companies
    .filter((company) => inferIndustry(company) === selectedIndustry)
    .filter((company) => companyMatchesFolderSearch(company, String(state.folderSearchQuery || "").trim().toLowerCase()));
  const regionCards = [...groupCompaniesByRegion(companies).entries()]
    .sort((a, b) => {
      const ai = folderRegionOrder(a[0]);
      const bi = folderRegionOrder(b[0]);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a[0].localeCompare(b[0]);
    })
    .map(([region, rows]) => {
      const fileCount = rows.reduce((sum, company) => sum + companyCloudItems(company.id).length, 0);
      const companyChips = rows.slice(0, 18).map((company) => `
        <button class="folder-chip" data-folder-company="${escapeHtml(company.id)}" type="button">
          <span>▱</span>${escapeHtml(company.ticker || company.name)}
        </button>
      `).join("");
      return `
        <article class="folder-card-large region-folder">
          <div class="folder-card-head static-head">
            <span class="folder-card-icon">▰</span>
            <strong>${escapeHtml(region)}</strong>
            <em>${rows.length}</em>
          </div>
          <p>${rows.length} 家公司 · ${fileCount} 份资料</p>
          <div class="folder-chip-grid">${companyChips || '<span class="folder-empty">暂无公司</span>'}</div>
        </article>
      `;
    }).join("");
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
    <div class="folder-board-top">
      <button class="folder-board-back" data-folder-back type="button">← 云端文件夹 / ${escapeHtml(selectedIndustry)}</button>
      <div class="folder-board-actions">
        <button data-create-folder type="button">新建文件夹</button>
        <button data-upload-current-company type="button">上传资料</button>
        <button data-save-web-current-company type="button">保存网页</button>
      </div>
    </div>
    <div class="folder-region-grid">${regionCards || `<div class="empty-list">${escapeHtml(selectedIndustry)} 下面还没有公司文件夹。</div>`}</div>
    <div class="folder-board-section-title">公司文件夹</div>
    <div class="folder-card-grid-main">${cards || ""}</div>
  `;
}

function renderDailyNewsBoard() {
  const isDaily = state.railView === "daily";
  els.dailyNewsBoard.hidden = !isDaily;
  document.body.classList.toggle("daily-mode", isDaily);
  if (!isDaily) {
    els.dailyNewsBoard.innerHTML = "";
    return;
  }

  const activeTab = state.dailyNewsTab === "generate" ? "generate" : "sources";
  const sources = dailyNewsSources();
  const rows = (dailyNewsItems().length ? dailyNewsItems() : state.items.filter((item) => item.type === "open")).slice(0, 68);
  const newsDate = new Date(state.lastFetchedAt || Date.now()).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).replaceAll("/", "/");
  const updatedAt = new Date(state.lastFetchedAt || Date.now()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  const hotTags = dailyHotTags(rows);
  const enabledSourceKeys = enabledCatalogSourceKeys();
  const sourceCards = sources.map((source) => `
    <article class="daily-source-card">
      <div>
        <strong>${escapeHtml(source.name || "未命名新闻源")}</strong>
        <span>${escapeHtml([source.category, source.domain, source.query || source.url].filter(Boolean).join(" · "))}</span>
      </div>
      <button data-delete-news-source="${escapeHtml(source.id)}" type="button">删除</button>
    </article>
  `).join("");
  const catalogCards = dailyNewsSourceCatalog.map((group) => {
    const rowsHtml = group.rows.map((row) => {
      const payload = catalogSourcePayload(group.category, row);
      const added = enabledSourceKeys.has(sourceKey(payload));
      return `
        <tr>
          <td><strong>${escapeHtml(row[0])}</strong></td>
          <td>${escapeHtml(row[1])}</td>
          <td>${escapeHtml(row[2])}</td>
          <td>
            <button data-add-catalog-source="${escapeHtml(group.category)}|${escapeHtml(catalogSourceId(group.category, row))}" type="button" ${added ? "disabled" : ""}>
              ${added ? "已启用" : "添加"}
            </button>
          </td>
        </tr>
      `;
    }).join("");
    const activeCount = group.rows.filter((row) => enabledSourceKeys.has(sourceKey(catalogSourcePayload(group.category, row)))).length;
    return `
      <article class="daily-source-category">
        <header>
          <div>
            <span>${escapeHtml(group.icon)}</span>
            <strong>${escapeHtml(group.category)}</strong>
            <em>${group.rows.length} 个源</em>
          </div>
          <button data-add-catalog-category="${escapeHtml(group.category)}" type="button">${activeCount === group.rows.length ? "全部已启用" : `启用本类 ${activeCount}/${group.rows.length}`}</button>
        </header>
        <div class="daily-source-table-wrap">
          <table>
            <thead><tr><th>域名 / 关键词</th><th>查询</th><th>条数</th><th></th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </article>
    `;
  }).join("");
  const topNews = rows.slice(0, 5).map((item, index) => {
    const company = itemCompany(item);
    const ticker = company?.ticker || item.source || (index === 1 ? "-" : "NEWS");
    return `
      <button class="daily-headline-row" data-daily-item-id="${escapeHtml(item.id)}" type="button">
        <span class="daily-ticker">${escapeHtml(ticker)}</span>
        <strong>${escapeHtml(dailyNewsTitle(item))}</strong>
        <em>${escapeHtml(dailyNewsSummary(item))}</em>
        <small>${escapeHtml(item.source || "open web")}</small>
        <time>${escapeHtml(relativeNewsTime(item.publishedAt || item.createdAt))}</time>
      </button>
    `;
  }).join("");
  const categoryCards = dailyCategoryCards(rows);
  const resultCards = rows.slice(0, 20).map((item) => {
    const link = materialUrl(item);
    return `
      <article class="daily-news-card">
        <div class="daily-news-card-head">
          <span>${escapeHtml(item.source || "NEWS")}</span>
          <em>${escapeHtml(formatTime(item.publishedAt || item.createdAt))}</em>
        </div>
        <h3>${escapeHtml(dailyNewsTitle(item))}</h3>
        <p>${escapeHtml(dailyNewsSummary(item))}</p>
        <div class="daily-news-card-actions">
          ${link ? `<button data-open-url="${escapeHtml(link)}" type="button">打开原文</button>` : ""}
          <button data-daily-item-id="${escapeHtml(item.id)}" type="button">作为笔记打开</button>
        </div>
      </article>
    `;
  }).join("");

  els.dailyNewsBoard.innerHTML = `
    <div class="daily-news-top">
      <div>
        <h2><span class="daily-title-icon">▣</span>Daily Brief</h2>
        <div class="daily-news-meta">
          <span>${escapeHtml(newsDate)}</span>
          <strong>${rows.length} 条 · ${escapeHtml(updatedAt)}</strong>
        </div>
      </div>
      <nav class="daily-news-tabs" aria-label="今日新闻">
        <button class="${activeTab === "sources" ? "active" : ""}" data-daily-news-tab="sources" type="button">⚙ 新闻源</button>
        <button class="${activeTab === "generate" ? "active" : ""}" data-daily-news-tab="generate" type="button">生成今日新闻</button>
      </nav>
    </div>

    ${activeTab === "sources" ? `
      <section class="daily-news-panel">
        <div class="daily-source-form">
          <input id="dailyNewsSourceName" placeholder="来源名称，例如 The Verge / Bloomberg AI" />
          <input id="dailyNewsSourceUrl" placeholder="https://example.com/news 或 RSS / 网页链接" />
          <button data-add-news-source type="button">添加新闻源</button>
        </div>
        <div class="daily-source-summary">
          <strong>预设新闻源库</strong>
          <span>按你的投研分类维护。点击“添加”后，会进入下方已启用列表，并参与“生成今日新闻”。</span>
        </div>
        <div class="daily-source-catalog">${catalogCards}</div>
        <div class="daily-source-summary">
          <strong>已启用新闻源</strong>
          <span>${sources.length} 个来源会参与扫描。预设新闻源默认全部启用。</span>
        </div>
        <div class="daily-source-list">
          ${sourceCards || `<div class="empty-list">还没有新闻源。把你每天要看的网页、新闻列表或 RSS 链接加进来。</div>`}
        </div>
      </section>
    ` : `
      <section class="daily-agent-brief">
        <button class="daily-collapse" type="button">›</button>
        <div class="daily-agent-label">
          <span>▣</span>
          <strong>AI Agent 播报</strong>
          <em>Managed Agent</em>
        </div>
        <div class="daily-agent-action">
          <button data-generate-daily-news type="button" ${dailyNewsBusy || !sources.length ? "disabled" : ""}>✧ 生成播报</button>
          <span>约 $0.5-1.5 / 次</span>
        </div>
      </section>

      <section class="daily-hot-tags">
        <strong>7天热度</strong>
        ${hotTags.map(([tag, count]) => `<button type="button">${escapeHtml(tag)} <span>${count}</span></button>`).join("") || `<span class="daily-muted">生成后会出现热词。</span>`}
      </section>

      <section class="daily-headlines-panel">
        <div class="daily-section-title"><span>⌄ ☆</span><strong>今日要闻</strong><em>${Math.min(rows.length, 5)}</em></div>
        <div class="daily-headline-list">
          ${topNews || `<div class="empty-list">点击“生成今日新闻”后，今日要闻会显示在这里。</div>`}
        </div>
      </section>

      <section class="daily-category-grid">
        ${categoryCards}
      </section>

      <section class="daily-news-panel compact">
        <div class="daily-news-generate">
          <div>
            <strong>${sources.length ? `${sources.length} 个新闻源已就绪` : "还没有新闻源"}</strong>
            <span>${escapeHtml(dailyNewsStatus || "点击后会逐个抓取新闻源，并把结果保存到今日新闻。")}</span>
          </div>
          <button data-generate-daily-news type="button" ${dailyNewsBusy || !sources.length ? "disabled" : ""}>
            ${dailyNewsBusy ? "生成中..." : "生成今日新闻"}
          </button>
        </div>
        <div class="daily-news-results">
          ${resultCards || `<div class="empty-list">生成后，抓取到的新闻会显示在这里。</div>`}
        </div>
      </section>
    `}
  `;
}

function renderTeamBoard() {
  const isTeam = state.railView === "team";
  els.teamBoard.hidden = !isTeam;
  document.body.classList.toggle("team-mode", isTeam);
  if (!isTeam) {
    els.teamBoard.innerHTML = "";
    return;
  }

  const files = teamFiles();
  const fileRows = files.map((file) => `
    <article class="team-file-card">
      <div>
        <strong>${escapeHtml(file.name)}</strong>
        <span>${escapeHtml(formatTime(file.uploadedAt))} · ${escapeHtml(formatFileSize(file.size))}</span>
      </div>
      <em>${escapeHtml(file.kind || "FILE")}</em>
    </article>
  `).join("");

  els.teamBoard.innerHTML = `
    <header class="team-board-head">
      <div>
        <span>♙</span>
        <strong>团队 Port</strong>
      </div>
      <button data-upload-team-file type="button">⇧ 上传</button>
    </header>
    <section class="team-empty-stage">
      ${files.length ? `
        <div class="team-file-grid">${fileRows}</div>
      ` : `
        <div class="team-empty-center">
          <div class="team-empty-icon">♙</div>
          <p>还没有团队 Port 数据</p>
          <button data-upload-team-file type="button">⇧ 上传第一份</button>
        </div>
      `}
    </section>
  `;
}

function dailyHotTags(rows) {
  const ignored = new Set(["open", "web", "news", "今日新闻", "新闻源", "抓取失败"]);
  const counts = new Map();
  rows.forEach((item) => {
    const tags = [
      itemCompany(item)?.ticker,
      item.source,
      ...materialTags(item),
      ...(readableText(item.title || "").match(/\b[A-Z][A-Za-z0-9]{1,12}\b/g) || [])
    ].filter(Boolean);
    tags.forEach((tag) => {
      const clean = String(tag).trim();
      if (!clean || ignored.has(clean)) return;
      counts.set(clean, (counts.get(clean) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
}

function relativeNewsTime(value) {
  const time = new Date(value || Date.now()).getTime();
  if (Number.isNaN(time)) return "刚刚";
  const hours = Math.max(0, Math.round((Date.now() - time) / 36e5));
  if (hours < 1) return "刚刚";
  if (hours < 24) return `${hours}小时前`;
  return hours < 48 ? "昨天" : formatTime(value);
}

function dailyCategoryCards(rows) {
  const uncategorized = rows.filter((item) => !dailyNewsSourceCatalog.some((group) => group.category === item.category));
  const groups = dailyNewsSourceCatalog.map((group) => ({
    label: group.category,
    icon: group.icon,
    rows: rows.filter((item) => item.category === group.category).slice(0, 4)
  }));
  if (uncategorized.length) {
    groups.push({ label: "其他", icon: "◇", rows: uncategorized.slice(0, 4) });
  }
  return groups.map((group) => `
    <article class="daily-category-card">
      <div class="daily-section-title"><span>${escapeHtml(group.icon)}</span><strong>${escapeHtml(group.label)}</strong><em>${group.rows.length}</em></div>
      <p>${escapeHtml(dailyCategorySummary(group.label, group.rows))}</p>
      <div class="daily-category-news-list">
        ${group.rows.map((item) => `
          <button data-daily-item-id="${escapeHtml(item.id)}" type="button">
            <strong>${escapeHtml(dailyNewsTitle(item))}</strong>
            <span>${escapeHtml(item.source || "open web")} · ${escapeHtml(relativeNewsTime(item.publishedAt || item.createdAt))}</span>
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function dailyCategorySummary(category, rows) {
  const aiSummary = state.dailyNewsCategorySummaries?.[category];
  if (aiSummary) return aiSummary;
  const titles = rows.map((item) => dailyNewsTitle(item)).filter(Boolean);
  if (!titles.length) return "扫描后会生成这一类新闻的中文摘要。";
  const names = titles.slice(0, 3).join("；");
  return `${category}今日主要关注：${names}。需要继续跟踪这些事件对持仓公司、竞争格局和盈利预期的影响。`;
}

function dailyNewsTitle(item) {
  return readableText(item?.zhTitle || item?.translatedTitle || localizeNewsTitle(item?.title || "未命名新闻"));
}

function dailyNewsSummary(item) {
  return readableText(item?.summary || item?.sourceText || item?.title || "")
    .replace(/[.#]?[a-z0-9:_-][a-z0-9:_.,#>-]{0,60}\s*\{[^}]{0,240}\}/g, " ")
    .replace(/a:link\s*,\s*a:visited\s*\{[^}]{0,240}\}/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
}

function localizeNewsTitle(title) {
  const original = readableText(title || "");
  if (!original || /[\u4e00-\u9fff]/.test(original)) return original;
  const dictionary = [
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
    [/AI/gi, "AI"],
    [/crypto/gi, "加密"],
    [/payment/gi, "支付"],
    [/gaming/gi, "游戏"],
    [/advertising/gi, "广告"],
    [/media/gi, "媒体"]
  ];
  return dictionary.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), original);
}

function pseudoPrice(company) {
  const seed = String(company.ticker || company.name || "PM").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const price = (80 + (seed % 420) + ((seed % 97) / 100)).toFixed(2);
  const change = (((seed % 69) - 30) / 3).toFixed(2);
  const history = Array.from({ length: 72 }, (_, index) => {
    const wave = Math.sin((index + seed) / 5) * 22 + Math.cos((index + seed) / 9) * 12;
    const close = Number(price) * (0.82 + (index / 72) * 0.28 + wave / 700);
    return {
      date: new Date(Date.now() - (72 - index) * 86400000).toISOString(),
      close: Number(close.toFixed(2)),
      volume: Math.round((seed % 90 + 20) * 1000000 * (0.8 + Math.abs(wave) / 60))
    };
  });
  return {
    price,
    change,
    changeAmount: (Number(price) * Number(change) / 100).toFixed(2),
    high: (Number(price) * 1.06).toFixed(2),
    low: (Number(price) * 0.94).toFixed(2),
    open: (Number(price) * 1.01).toFixed(2),
    previousClose: (Number(price) * 1.02).toFixed(2),
    volume: Math.round(Math.abs(Number(price)) * 184000),
    rangeChange: change,
    distanceFromHigh: "-26.1",
    ma50Delta: "+14.4",
    ma200Delta: "-55.6",
    history,
    updatedAt: new Date().toISOString(),
    source: "示意数据"
  };
}

function activeStockRange() {
  return stockRangeOptions.some(([id]) => id === state.stockChartRange) ? state.stockChartRange : "3y";
}

function activeStockInterval() {
  return stockIntervalOptions.some(([id]) => id === state.stockChartInterval) ? state.stockChartInterval : "1wk";
}

function activeStockIndicator() {
  return stockIndicatorOptions.some(([id]) => id === state.stockChartIndicator) ? state.stockChartIndicator : "ma";
}

function stockCacheKey(ticker, range = activeStockRange(), interval = activeStockInterval()) {
  return [String(ticker || "").toUpperCase(), range, interval].join("|");
}

function renderStockToolbar(kind, options, activeValue) {
  return `
    <div>
      ${options.map(([id, label]) => `
        <button class="${id === activeValue ? "active" : ""}" data-stock-${kind}="${escapeHtml(id)}" type="button">${escapeHtml(label)}</button>
      `).join("")}
    </div>
  `;
}

function companyStockPrice(company) {
  const ticker = String(company?.ticker || "").toUpperCase();
  const range = activeStockRange();
  const interval = activeStockInterval();
  const cached = ticker ? (state.stockPrices?.[stockCacheKey(ticker, range, interval)] || state.stockPrices?.[ticker]) : null;
  if (cached?.price) return cached;
  return { ...pseudoPrice(company), range, interval };
}

function formatVolume(value) {
  const volume = Number(value || 0);
  if (!volume) return "—";
  if (volume >= 100000000) return `${(volume / 100000000).toFixed(2)}亿股`;
  if (volume >= 10000) return `${Math.round(volume / 10000)}万股`;
  return `${volume.toLocaleString()}股`;
}

function formatChartDate(value, fallback = "") {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return fallback;
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function movingAverageSeries(values, windowSize) {
  return values.map((value, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const slice = values.slice(start, index + 1).filter(Number.isFinite);
    if (slice.length < Math.min(windowSize, 4)) return null;
    return slice.reduce((sum, row) => sum + row, 0) / slice.length;
  });
}

function emaSeries(values, span) {
  const multiplier = 2 / (span + 1);
  let ema = null;
  return values.map((value) => {
    if (!Number.isFinite(value)) return ema;
    ema = ema === null ? value : (value - ema) * multiplier + ema;
    return ema;
  });
}

function rsiSeries(values, period = 14) {
  return values.map((value, index) => {
    if (index < period) return null;
    let gains = 0;
    let losses = 0;
    for (let offset = index - period + 1; offset <= index; offset += 1) {
      const delta = values[offset] - values[offset - 1];
      if (delta >= 0) gains += delta;
      else losses += Math.abs(delta);
    }
    if (!losses) return 100;
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  });
}

function chartPath(values, xForIndex, yForValue) {
  return values.map((value, index) => {
    if (!Number.isFinite(value)) return "";
    return `${index === 0 || !Number.isFinite(values[index - 1]) ? "M" : "L"}${xForIndex(index).toFixed(1)} ${yForValue(value).toFixed(1)}`;
  }).filter(Boolean).join(" ");
}

function renderStockChart(priceData, indicator = activeStockIndicator()) {
  const history = Array.isArray(priceData?.history) ? priceData.history.filter((row) => Number.isFinite(Number(row.close))) : [];
  const rows = history.length ? history.slice(-72) : pseudoPrice({ ticker: "chart" }).history;
  const closes = rows.map((row) => Number(row.close));
  const volumes = rows.map((row) => Number(row.volume || 0));
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const spread = Math.max(1, max - min);
  const width = 900;
  const height = 330;
  const priceTop = 18;
  const priceHeight = indicator === "rsi" || indicator === "macd" ? 205 : 235;
  const volumeTop = priceTop + priceHeight + 14;
  const volumeHeight = indicator === "rsi" || indicator === "macd" ? 72 : 58;
  const left = 18;
  const right = 18;
  const innerWidth = width - left - right;
  const maxVolume = Math.max(1, ...volumes);
  const xForIndex = (index) => left + (rows.length <= 1 ? 0 : (index / (rows.length - 1)) * innerWidth);
  const yForClose = (value) => priceTop + priceHeight - ((value - min) / spread) * priceHeight;
  const ma50 = movingAverageSeries(closes, 50);
  const ma100 = movingAverageSeries(closes, 100);
  const ma200 = movingAverageSeries(closes, 200);
  const ema12 = emaSeries(closes, 12);
  const ema26 = emaSeries(closes, 26);
  const macd = ema12.map((value, index) => Number.isFinite(value) && Number.isFinite(ema26[index]) ? value - ema26[index] : null);
  const signal = emaSeries(macd.map((value) => Number.isFinite(value) ? value : 0), 9);
  const histogram = macd.map((value, index) => Number.isFinite(value) ? value - signal[index] : null);
  const rsi = rsiSeries(closes);
  const macdMin = Math.min(-1, ...histogram.filter(Number.isFinite), ...macd.filter(Number.isFinite), ...signal.filter(Number.isFinite));
  const macdMax = Math.max(1, ...histogram.filter(Number.isFinite), ...macd.filter(Number.isFinite), ...signal.filter(Number.isFinite));
  const macdSpread = Math.max(1, macdMax - macdMin);
  const yForMacd = (value) => volumeTop + volumeHeight - ((value - macdMin) / macdSpread) * volumeHeight;
  const yForRsi = (value) => volumeTop + volumeHeight - (value / 100) * volumeHeight;
  const barWidth = Math.max(2, Math.min(10, innerWidth / rows.length * 0.58));
  const dateIndexes = [...new Set([0, Math.floor(rows.length * 0.25), Math.floor(rows.length * 0.5), Math.floor(rows.length * 0.75), rows.length - 1])]
    .filter((index) => index >= 0 && rows[index]);
  const priceBars = rows.map((row, index) => {
    const previous = index > 0 ? Number(rows[index - 1].close) : Number(row.open || row.close);
    const close = Number(row.close);
    const up = close >= previous;
    const x = xForIndex(index) - barWidth / 2;
    const y = yForClose(close);
    const barHeight = Math.max(2, priceTop + priceHeight - y);
    return `<rect class="${up ? "upbar" : "downbar"}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}"><title>${escapeHtml(`${formatChartDate(row.date)} ${close.toFixed(2)}`)}</title></rect>`;
  }).join("");
  const volumeBars = rows.map((row, index) => {
    const previous = index > 0 ? Number(rows[index - 1].close) : Number(row.open || row.close);
    const close = Number(row.close);
    const up = close >= previous;
    const value = Number(row.volume || 0);
    const barHeight = Math.max(2, (value / maxVolume) * volumeHeight);
    const x = xForIndex(index) - barWidth / 2;
    const y = volumeTop + volumeHeight - barHeight;
    return `<rect class="${up ? "volume-up" : "volume-down"}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}"><title>${escapeHtml(`${formatChartDate(row.date)} 成交量 ${formatVolume(value)}`)}</title></rect>`;
  }).join("");
  const indicatorLayer = indicator === "macd"
    ? `
      <g class="macd-layer">
        ${histogram.map((value, index) => {
          if (!Number.isFinite(value)) return "";
          const zero = yForMacd(0);
          const y = yForMacd(value);
          return `<rect class="${value >= 0 ? "volume-up" : "volume-down"}" x="${(xForIndex(index) - barWidth / 2).toFixed(1)}" y="${Math.min(y, zero).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${Math.max(1, Math.abs(zero - y)).toFixed(1)}"></rect>`;
        }).join("")}
        <path class="ma50-line" d="${chartPath(macd, xForIndex, yForMacd)}"></path>
        <path class="ma100-line" d="${chartPath(signal, xForIndex, yForMacd)}"></path>
      </g>`
    : indicator === "rsi"
      ? `
        <g class="rsi-layer">
          <line class="chart-guide" x1="${left}" x2="${width - right}" y1="${yForRsi(70).toFixed(1)}" y2="${yForRsi(70).toFixed(1)}"></line>
          <line class="chart-guide" x1="${left}" x2="${width - right}" y1="${yForRsi(30).toFixed(1)}" y2="${yForRsi(30).toFixed(1)}"></line>
          <path class="ma200-line" d="${chartPath(rsi, xForIndex, yForRsi)}"></path>
        </g>`
      : `<g class="volume-layer">${volumeBars}</g>`;
  return `
    <div class="stock-chart">
      <svg class="stock-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="股价图">
        <g class="chart-grid">
          <line x1="${left}" x2="${width - right}" y1="${priceTop}" y2="${priceTop}"></line>
          <line x1="${left}" x2="${width - right}" y1="${priceTop + priceHeight / 2}" y2="${priceTop + priceHeight / 2}"></line>
          <line x1="${left}" x2="${width - right}" y1="${priceTop + priceHeight}" y2="${priceTop + priceHeight}"></line>
        </g>
        <g class="price-bars">${priceBars}</g>
        <path class="price-line-path" d="${chartPath(closes, xForIndex, yForClose)}"></path>
        <path class="ma50-line" d="${chartPath(ma50, xForIndex, yForClose)}"></path>
        <path class="ma100-line" d="${chartPath(ma100, xForIndex, yForClose)}"></path>
        <path class="ma200-line" d="${chartPath(ma200, xForIndex, yForClose)}"></path>
        ${indicatorLayer}
        <g class="chart-dates">
          ${dateIndexes.map((index) => `<text x="${xForIndex(index).toFixed(1)}" y="${height - 8}" text-anchor="${index === 0 ? "start" : index === rows.length - 1 ? "end" : "middle"}">${escapeHtml(formatChartDate(rows[index].date))}</text>`).join("")}
        </g>
      </svg>
      <div class="stock-legend">
        <span><i class="price-dot"></i>收盘价</span>
        <span><i class="ma50-dot"></i>MA50</span>
        <span><i class="ma100-dot"></i>MA100</span>
        <span><i class="ma200-dot"></i>MA200</span>
        <span><i class="volume-dot"></i>${indicator === "macd" ? "MACD" : indicator === "rsi" ? "RSI" : "成交量"}</span>
      </div>
    </div>
  `;
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

function renderNoteReaderTabs(activeTab) {
  return noteReaderTabs.map(([id, label]) => `
    <button class="${activeTab === id ? "active" : ""}" data-note-reader-tab="${id}" type="button">${label}</button>
  `).join("");
}

function renderNoteQaPanel(item) {
  const title = readableText(item?.title || "当前笔记");
  const prompts = [
    "总结一下笔记",
    "提到了哪些关于 AI 的内容",
    "有哪些重要数字",
    "做多/做空哪个股票"
  ];
  return `
    <aside class="note-qa-panel">
      <div class="note-qa-head">
        <strong>当前笔记问答</strong>
        <button type="button" title="关闭">×</button>
      </div>
      <div class="note-qa-mode">单篇笔记模式</div>
      <div class="note-qa-current">${escapeHtml(title)}</div>
      <div class="note-qa-prompts">
        ${prompts.map((prompt) => `<button type="button">${escapeHtml(prompt)}</button>`).join("")}
      </div>
      <textarea placeholder="关于「${escapeHtml(title)}」的问题..."></textarea>
      <div class="note-qa-foot">
        <select>
          ${noteProcessorModels.map((model, index) => `<option ${index === 0 ? "selected" : ""}>${escapeHtml(model.label)}</option>`).join("")}
        </select>
        <label><input type="checkbox" /> 联网</label>
        <button type="button" disabled>发送</button>
      </div>
    </aside>
  `;
}

function renderNoteWorkbench(item, mainHtml, options = {}) {
  const tools = options.tools === false ? "" : `
    <div class="note-read-toolbar">
      <button type="button">复制</button>
      <button type="button">PDF</button>
      <button type="button">对比</button>
      <button data-analyze-note type="button">重新分析</button>
    </div>
  `;
  return `
    <section class="note-workbench">
      <div class="note-workbench-main">
        ${tools}
        ${mainHtml}
      </div>
      ${renderNoteQaPanel(item)}
    </section>
  `;
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

function timelineDateRange(items) {
  const dates = items
    .map((item) => new Date(item.publishedAt || item.createdAt || Date.now()))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);
  if (!dates.length) return "待定";
  const fmt = (date) => date.toLocaleDateString("zh-CN", { year: "2-digit", month: "2-digit", day: "2-digit" });
  return dates.length === 1 ? fmt(dates[0]) : `${fmt(dates[0])} - ${fmt(dates.at(-1))}`;
}

function dominantTone(items) {
  const counts = {};
  items.forEach((item, index) => {
    const tone = materialTone(item, index);
    counts[tone] = (counts[tone] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "需求 / 增长";
}

function companyModelName(company, industry) {
  if (/半导体|芯片|semiconductor/i.test(industry)) return "Global Semiconductor Model";
  if (/消费|互联网/i.test(industry)) return "Global Internet / Consumer Model";
  if (/金融|bank|fin/i.test(industry)) return "Global Financial Model";
  return "Global Software Model";
}

function renderCompanyHome(ctx) {
  const { company, rows, price, viewItems, selected, selectedSummary, peerCompanies, recentNotes, industry } = ctx;
  const priceNumber = Number(price.price) || 0;
  const changeNumber = Number(price.change) || 0;
  const updatedAt = price.updatedAt ? formatTime(price.updatedAt) : "未更新";
  const sourceLabel = price.source && price.source !== "示意数据" ? price.source : "点击更新获取行情";
  const activeRange = activeStockRange();
  const activeInterval = activeStockInterval();
  const activeIndicator = activeStockIndicator();
  return `
    <section class="company-grid">
      <article class="stock-panel">
        <div class="panel-head stock-panel-head">
          <div><strong>股价图</strong><span>${escapeHtml(company.ticker || "")}</span></div>
          <button data-refresh-stock="${escapeHtml(company.id)}" type="button" ${stockPriceBusy ? "disabled" : ""}>${stockPriceBusy ? "更新中..." : "更新股价"}</button>
        </div>
        <div class="stock-source-line">${escapeHtml(sourceLabel)} · ${escapeHtml(updatedAt)}${stockPriceStatus ? ` · ${escapeHtml(stockPriceStatus)}` : ""}</div>
        <div class="stock-toolbar">
          ${renderStockToolbar("range", stockRangeOptions, activeRange)}
          ${renderStockToolbar("interval", stockIntervalOptions, activeInterval)}
        </div>
        <div class="price-line">
          <strong>${price.price}</strong>
          <span class="${changeNumber >= 0 ? "up" : "down"}">${changeNumber >= 0 ? "+" : ""}${price.change}%</span>
          <em>${price.marketTime ? escapeHtml(price.marketTime) : new Date().toLocaleDateString("zh-CN")}</em>
        </div>
        <div class="stock-stat-row">
          <span>最高 <strong class="down">${escapeHtml(price.high || (priceNumber * 1.06).toFixed(2))}</strong></span>
          <span>最低 <strong class="up">${escapeHtml(price.low || (priceNumber * 0.94).toFixed(2))}</strong></span>
          <span>今开 <strong>${escapeHtml(price.open || (priceNumber * 1.01).toFixed(2))}</strong></span>
          <span>昨收 <strong>${escapeHtml(price.previousClose || (priceNumber * 1.02).toFixed(2))}</strong></span>
          <span>成交量 <strong>${escapeHtml(formatVolume(price.volume))}</strong></span>
        </div>
        <div class="stock-kpis">
          <span>区间涨跌 <strong class="${Number(price.rangeChange ?? price.change) >= 0 ? "up" : "down"}">${Number(price.rangeChange ?? price.change) >= 0 ? "+" : ""}${escapeHtml(price.rangeChange ?? price.change)}%</strong></span>
          <span>距高点 <strong class="${Number(price.distanceFromHigh) >= 0 ? "up" : "down"}">${escapeHtml(price.distanceFromHigh || "-26.1")}%</strong></span>
          <span>50日均线 <strong class="${Number(price.ma50Delta) >= 0 ? "up" : "down"}">${escapeHtml(price.ma50Delta || "+14.4")}</strong></span>
          <span>100日均线 <strong class="${Number(price.ma100Delta) >= 0 ? "up" : "down"}">${escapeHtml(price.ma100Delta || "—")}</strong></span>
          <span>200日均线 <strong class="${Number(price.ma200Delta) >= 0 ? "up" : "down"}">${escapeHtml(price.ma200Delta || "-55.6")}</strong></span>
        </div>
        <div class="indicator-row">
          <span>指标</span>
          ${stockIndicatorOptions.map(([id, label]) => `<button class="${id === activeIndicator ? "active" : ""}" data-stock-indicator="${escapeHtml(id)}" type="button">${escapeHtml(label)}</button>`).join("")}
        </div>
        ${renderStockChart(price, activeIndicator)}
        <div class="range-line"><span>Low ${escapeHtml(price.rangeLow || (priceNumber * 0.75).toFixed(2))}</span><strong><i style="width:${Math.max(4, Math.min(96, Number(price.rangePosition || 42)))}%"></i></strong><span>High ${escapeHtml(price.rangeHigh || (priceNumber * 1.35).toFixed(2))}</span></div>
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

    <section class="home-lower-grid">
      <article class="company-source-card">
        <div class="panel-head"><strong>最近笔记</strong><span>${recentNotes.length}</span></div>
        <div class="recent-note-list">
          ${recentNotes.map((item) => `
            <button data-item-id="${escapeHtml(item.id)}" type="button">
              <span>${escapeHtml(readableText(item.title))}</span>
              <em>${formatTime(item.publishedAt || item.createdAt)}</em>
            </button>
          `).join("") || '<div class="empty-list">暂无最近笔记</div>'}
        </div>
      </article>
      <article class="company-source-card">
        <div class="panel-head"><strong>当前材料</strong><span>${selected ? escapeHtml(selected.source || selected.type) : "无"}</span></div>
        <p>${escapeHtml(selectedSummary)}</p>
        <div class="workspace-mini-metrics">
          <span>行业 <strong>${escapeHtml(industry)}</strong></span>
          <span>模型 <strong>${escapeHtml(companyModelName(company, industry))}</strong></span>
          <span>材料 <strong>${rows.length}</strong></span>
        </div>
      </article>
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
      <div class="timeline-summary-grid">
        <span>材料 <strong>${ctx.rows.length}</strong></span>
        <span>想法 <strong>${ctx.viewItems.length}</strong></span>
        <span>转折 <strong>${Math.min(2, groups.length)}</strong></span>
        <span>主线 <strong>${escapeHtml(groups[0] ? dominantTone(groups[0][1]) : "待建立")}</strong></span>
      </div>
      <div class="timeline-list">
        ${groups.map(([month, items], index) => `
          <article class="timeline-month ${index === 0 ? "active" : ""}">
            <div>
              <strong>${escapeHtml(month)}</strong>
              <span>${escapeHtml(timelineDateRange(items))}</span>
              <span>${escapeHtml(dominantTone(items))}：${escapeHtml(readableText(items[0]?.title || "新增材料"))}</span>
              <p>这段主要围绕 ${escapeHtml(dominantTone(items))}，共 ${items.length} 条材料；需要判断是否改变核心变量、估值区间或下一步动作。</p>
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
  const modelName = companyModelName(ctx.company, ctx.industry);
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
        <div><strong>${escapeHtml(modelName)}</strong><span>Sheet: ${escapeHtml(ctx.company.ticker || "Ticker")} · 文件: 上传你的 Excel 后替换</span></div>
        <button type="button">上传新版本</button>
        <button type="button">换模型</button>
      </div>
      <div class="model-layout">
        <div class="model-match">
          <strong>模型匹配</strong>
          ${[
            [ctx.company.name, ctx.company.ticker || "Ticker", 100],
            [modelName, ctx.industry, 88],
            ["Peer Coverage Model", "同组公司", 72],
            ["Cloud Computing Platforms Comparison", "AWS / MSFT / GOOGL", 60]
          ].map(([name, meta, score]) => `<span><b>${escapeHtml(name)}</b><small>${escapeHtml(meta)}</small><em>${score}</em></span>`).join("")}
        </div>
        <div>
          <div class="panel-head compact-head"><strong>核心数字</strong><span>${metrics.length}</span></div>
          <div class="core-metrics">${metrics.map(([label, value, year]) => `<article><span>${label}</span><strong>${value}</strong><em>${year}</em></article>`).join("")}</div>
        </div>
      </div>
      <div class="model-table-wrap">
        <div class="panel-head"><strong>模型预览</strong><span>${escapeHtml(ctx.company.ticker || "")}</span></div>
        <div class="model-preview-toolbar">
          <button type="button">年度 22</button><button type="button">半年度 24</button><button class="active" type="button">季度 48</button>
          <button type="button">近4年+预测</button><button type="button">复制表格</button>
        </div>
        <div class="model-signal-row">
          <span>最新列 <strong>2028</strong></span><span>收入趋势 <strong>+21.3%</strong></span><span>利润率 <strong>+1.1ppt</strong></span><span>显示 <strong>480 行</strong></span>
        </div>
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
      <p class="workspace-intro">Long / Short 在这里代表立场和市场拥挤方向，不要求已经有仓位。AI 会先遵守你的操作纪律，再读公司材料、想法、股价和模型。</p>
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
        <div class="panel-head"><strong>投委会材料包</strong><span>待生成</span></div>
        <div class="committee-ready-grid">
          <span>Pre-read <strong>${ctx.recentNotes.length} 条</strong></span>
          <span>关键分歧 <strong>${evidenceBuckets(ctx.rows).filter((bucket) => bucket.rows.length).length}</strong></span>
          <span>模型状态 <strong>已接</strong></span>
          <span>结论 <strong>待投票</strong></span>
        </div>
        <p>写下你的当前判断，然后生成一版红队质询、投票摘要和会后行动清单。</p>
      </article>
    </section>
  `;
}

function renderCompanyQuestions(ctx) {
  const groups = [
    ["核心变量", ["未来 6-12 个月最关键的验证变量是什么？", "哪些公开信息会证明核心假设错了？"]],
    ["模型/数字", ["收入、利润率、现金流里哪一个最能推动估值重估？", "下一次财报前必须补哪三份材料？"]],
    ["竞争/替代", ["竞争对手正在抢走哪一块预算或客户？", "是否出现替代品让 TAM 被重新定义？"]],
    ["动作", ["如果股价先涨 20%，追还是等？", "如果财报后跌 15%，是机会还是 thesis 破坏？"]]
  ];
  return `
    <section class="workspace-panel">
      <div class="panel-head"><strong>问题清单</strong><span>${groups.reduce((sum, row) => sum + row[1].length, 0)} 个</span></div>
      <div class="question-board">
        ${groups.map(([label, questions], groupIndex) => `
          <article class="question-group">
            <strong>${escapeHtml(label)}</strong>
            ${questions.map((question, index) => `
              <label><input type="checkbox" ${groupIndex === 0 && index === 0 ? "checked" : ""} /><span>${escapeHtml(question)}</span><em>${groupIndex === 0 && index === 0 ? "正在验证" : "待验证"}</em></label>
            `).join("")}
          </article>
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

function renderNoteReaderBody(item, activeTab) {
  const transcript = materialTranscript(item);
  const needsFile = transcriptNeedsFile(item, transcript);
  const fallback = "还没有 Transcript 内容。请选择这条笔记对应的原文件，系统会读取 PDF / Word / 文本内容并保存到这里。";
  if (activeTab === "transcript") {
    if (needsFile) {
      return renderNoteWorkbench(item, `
        <section class="note-reader-placeholder transcript-import-box">
          <strong>读取文件内容</strong>
          <p>${escapeHtml(storedTextLooksLikeFileBytes(item) ? "正在尝试从已保存文件数据中恢复正文；恢复成功后会自动显示在这里。" : transcript || fallback)}</p>
          <small>新上传的 PDF / Word 会自动读取正文。旧笔记如果当时没有保存原文件内容，浏览器无法仅凭标题重新读取电脑里的文件。</small>
        </section>
      `, { tools: false });
    }
    return renderNoteWorkbench(item, `
      <article class="note-reader-transcript">
        ${escapeHtml(transcript).split("\n").map((line) => `<p>${line || "&nbsp;"}</p>`).join("")}
      </article>
    `);
  }

  if (activeTab === "analyst") {
    return renderNoteAnalyst(item);
  }

  if (activeTab === "idea") {
    return renderNoteIdea(item);
  }

  if (activeTab === "port") {
    return renderNotePort(item);
  }

  if (activeTab === "handler") {
    return renderNoteProcessor(item);
  }

  const tabLabel = noteReaderTabs.find(([id]) => id === activeTab)?.[1] || "分析";
  return renderNoteWorkbench(item, `
    <section class="note-reader-placeholder">
      <strong>${escapeHtml(tabLabel)}</strong>
      <p>这个视图会基于当前笔记生成结构化分析。现在先把原文放在 Transcript，便于你先阅读和归档。</p>
      <button data-note-reader-tab="transcript" type="button">查看 Transcript</button>
    </section>
  `, { tools: false });
}

function renderNoteIdea(item) {
  const idea = materialIdea(item);
  const updated = item?.ideaUpdatedAt ? `已保存 ${formatTime(item.ideaUpdatedAt)}` : "未保存";
  const placeholder = [
    "在这里写下你对这个笔记 / 这家公司 / 这个事件的真实想法。",
    "",
    "比如：",
    "- 读完之后对公司的判断",
    "- 对增速 / 利润率 / 估值的调整",
    "- 对管理层的评价",
    "- 风险点",
    "- 短 / 中 / 长期观点",
    "- 仓位上要不要动",
    "",
    "你的想法会被 workstation 的 AI agents 读取，在回答相关问题时会参考你的观点。"
  ].join("\n");

  return `
    <section class="idea-editor-shell">
      <header class="idea-editor-head">
        <div class="idea-title-pill">我的想法</div>
        <p>AI agents 可读取，用于回答相关问题时参考你的观点</p>
        <div class="idea-actions">
          <span data-idea-save-state>${escapeHtml(updated)}</span>
          <button data-save-note-idea type="button">保存</button>
        </div>
      </header>
      <textarea data-note-idea-input spellcheck="false" placeholder="${escapeHtml(placeholder)}">${escapeHtml(idea)}</textarea>
      <small class="idea-editor-hint">提示：输入 1.2 秒后自动保存；也可以按“保存”手动保存。</small>
    </section>
  `;
}

function processorKeyStorageId(provider) {
  return `andy-workstation-${provider}-api-key`;
}

function processorStoredKey(provider) {
  try {
    return localStorage.getItem(processorKeyStorageId(provider)) || "";
  } catch {
    return "";
  }
}

function renderProcessorControls({ buttonText, busyText, dataAttr, source }) {
  const currentModel = localStorage.getItem("andy-workstation-note-processor-model") || noteProcessorModels[0].id;
  const selected = noteProcessorModels.find((model) => model.id === currentModel) || noteProcessorModels[0];
  const savedKey = processorStoredKey(selected.provider);
  return `
    <div class="processor-controls">
      <label>模型
        <select id="processorModelSelect">
          ${noteProcessorModels.map((model) => `
            <option value="${escapeHtml(model.id)}" ${model.id === selected.id ? "selected" : ""}>${escapeHtml(model.label)}</option>
          `).join("")}
        </select>
      </label>
      <label>API Key（可留空使用云端环境变量）
        <input id="processorApiKeyInput" type="password" placeholder="${savedKey ? "已保存到本机浏览器" : "粘贴当前模型供应商的 key"}" value="" />
      </label>
      <label class="processor-checkbox">
        <input id="processorRememberKey" type="checkbox" ${savedKey ? "checked" : ""} />
        <span>仅保存在本机浏览器</span>
      </label>
      <button ${dataAttr} type="button" ${noteProcessorBusy || !source ? "disabled" : ""}>${noteProcessorBusy ? busyText : buttonText}</button>
    </div>
  `;
}

function renderNoteProcessor(item) {
  const currentModel = localStorage.getItem("andy-workstation-note-processor-model") || noteProcessorModels[0].id;
  const selected = noteProcessorModels.find((model) => model.id === currentModel) || noteProcessorModels[0];
  const translated = materialTranslation(item);
  const source = originalNoteText(item);
  return `
    <section class="processor-panel">
      <div class="processor-head">
        <div>
          <strong>处理者</strong>
          <p>选择模型，把当前原始笔记整理成完整、易读、易分析的中文材料。</p>
        </div>
        <span>${escapeHtml(selected.label)}</span>
      </div>

      ${renderProcessorControls({ buttonText: "整理当前笔记", busyText: "整理中...", dataAttr: "data-translate-note", source })}
      ${noteProcessorStatus ? `<div class="processor-status">${escapeHtml(noteProcessorStatus)}</div>` : ""}

      <div class="processor-layout">
        <article>
          <div class="processor-section-title">
            <strong>整理稿</strong>
            <span>${translated ? "已生成" : source ? `${source.length.toLocaleString()} 字符待整理` : "没有原文"}</span>
          </div>
          ${translated ? renderTranslationText(translated) : `<div class="processed-placeholder">点击“整理当前笔记”后，这里会显示完整、易读、按投研逻辑整理后的中文材料。</div>`}
        </article>
      </div>
    </section>
  `;
}

function renderNoteAnalyst(item) {
  const currentModel = localStorage.getItem("andy-workstation-note-processor-model") || noteProcessorModels[0].id;
  const selected = noteProcessorModels.find((model) => model.id === currentModel) || noteProcessorModels[0];
  const processed = materialView(item);
  const source = originalNoteText(item);
  return renderNoteWorkbench(item, `
    <section class="processor-panel">
      <div class="processor-head">
        <div>
          <strong>小分析师</strong>
          <p>把当前笔记整理成核心结论、Facts 和 Opinion，便于投研分析。</p>
        </div>
        <span>${escapeHtml(selected.label)}</span>
      </div>

      ${renderProcessorControls({ buttonText: "分析当前笔记", busyText: "分析中...", dataAttr: "data-analyze-note", source })}
      ${noteProcessorStatus ? `<div class="processor-status">${escapeHtml(noteProcessorStatus)}</div>` : ""}

      <div class="processor-layout">
        <article>
          <div class="processor-section-title">
            <strong>分析结果</strong>
            <span>${processed ? "已生成" : source ? `${source.length.toLocaleString()} 字符待分析` : "没有原文"}</span>
          </div>
          ${processed ? renderProcessedNote(processed) : `<div class="processed-placeholder">点击“分析当前笔记”后，会按 bullet point 生成：核心结论、Facts（原文事实）、Opinion / 判断、重要数字与实体、待验证问题和可归档摘要。</div>`}
        </article>
      </div>
    </section>
  `, { tools: false });
}

function portfolioUniverse() {
  const rows = state.companies.filter((company) => (
    company.portfolioStatus
    || company.coverageStatus
    || company.universeType === "portfolio"
    || company.universeType === "coverage"
  ));
  return rows.length ? rows : state.companies;
}

function renderNotePort(item) {
  const currentModel = localStorage.getItem("andy-workstation-note-processor-model") || noteProcessorModels[0].id;
  const selected = noteProcessorModels.find((model) => model.id === currentModel) || noteProcessorModels[0];
  const source = materialTranslation(item) || originalNoteText(item);
  const impact = materialPortfolioImpact(item);
  const universe = portfolioUniverse();
  return `
    <section class="processor-panel port-impact-panel">
      <div class="processor-head">
        <div>
          <strong>Port</strong>
          <p>用“处理者”的整理稿，分析这篇笔记对 Portfolio / Coverage 公司的正负影响。</p>
        </div>
        <span>${escapeHtml(selected.label)}</span>
      </div>

      ${renderProcessorControls({ buttonText: "分析组合影响", busyText: "分析中...", dataAttr: "data-portfolio-impact-note", source })}
      ${noteProcessorStatus ? `<div class="processor-status">${escapeHtml(noteProcessorStatus)}</div>` : ""}

      <div class="processor-layout">
        <article>
          <div class="processor-section-title">
            <strong>组合影响</strong>
            <span>${impact ? "已生成" : `${universe.length} 家公司待分析`}</span>
          </div>
          ${impact ? renderProcessedNote(impact) : `<div class="processed-placeholder">点击“分析组合影响”后，会按公司逐个判断上下游、替代、竞争和 TAM 影响，并标出正面/负面/中性/待验证。</div>`}
        </article>
      </div>
    </section>
  `;
}

function renderTranslationText(text) {
  return `
    <article class="translation-note">
      ${escapeHtml(text).split(/\n{2,}|\n/).filter(Boolean).map((line) => `<p>${line}</p>`).join("")}
    </article>
  `;
}

function renderProcessedNote(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const sections = [];
  let current = { title: "清洗结果", bullets: [], loose: [] };
  const pushCurrent = () => {
    if (current.bullets.length || current.loose.length) sections.push(current);
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      pushCurrent();
      current = { title: heading[1].trim(), bullets: [], loose: [] };
      return;
    }
    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      current.bullets.push(bullet[1].trim());
    } else {
      current.loose.push(line.replace(/^\d+[.)]\s+/, ""));
    }
  });
  pushCurrent();

  return `
    <div class="processed-note">
      ${sections.map((section) => `
        <section class="${processedSectionClass(section.title)}">
          <h3>${escapeHtml(section.title)}</h3>
          ${section.bullets.length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
          ${section.loose.length ? `<ul>${section.loose.map((row) => `<li>${escapeHtml(row)}</li>`).join("")}</ul>` : ""}
        </section>
      `).join("")}
    </div>
  `;
}

function processedSectionClass(title) {
  const text = String(title || "").toLowerCase();
  if (/fact|事实/.test(text)) return "facts-section";
  if (/opinion|判断|观点|推论/.test(text)) return "opinion-section";
  if (/结论/.test(text)) return "conclusion-section";
  return "";
}

function renderNoteReader() {
  const item = selectedNoteItem();
  document.body.classList.add("company-mode");
  document.body.classList.add("note-reader-mode");
  if (!item) {
    els.companyWorkspace.innerHTML = `
      <section class="note-reader-empty">
        <h1>还没有上传笔记</h1>
        <p>上传或保存一条研究笔记后，左栏会按时间显示标题，点击后在这里进入完整笔记工作区。</p>
      </section>
    `;
    return true;
  }

  const company = itemCompany(item);
  const activeTab = noteReaderTabs.some(([id]) => id === state.noteReaderTab) ? state.noteReaderTab : "analyst";
  const tag = notePrimaryTag(item);
  const extraTags = materialTags(item);
  const visibleTags = [...new Set([tag, ...extraTags.slice(0, 2), noteTypeLabel(item)].filter(Boolean))].slice(0, 4);
  const extraCount = Math.max(0, extraTags.length - 2);
  const title = readableText(item.title || "未命名笔记");
  const statusLabel = noteStatusLabel(item);
  const nextAction = statusLabel === "待数字" ? "Numbers" : statusLabel === "待分析" ? "分析" : statusLabel === "待处理" ? "处理" : "归档";

  els.companyWorkspace.hidden = false;
  els.companyWorkspace.innerHTML = `
    <article class="note-reader">
      <header class="note-reader-head">
        <div class="note-reader-title">
          <h1>${escapeHtml(title)}</h1>
        </div>
        <div class="note-reader-status">
          <span>● ${escapeHtml(statusLabel)}</span>
          ${visibleTags.map((row) => `<span>${escapeHtml(row)}</span>`).join("")}
          ${extraCount ? `<span>+${extraCount}</span>` : ""}
          <span>${escapeHtml(formatTime(item.publishedAt || item.createdAt))}</span>
          <span>▱ ${escapeHtml(noteArchiveLabel(item))}</span>
          <button data-note-reader-tab="${statusLabel === "待数字" ? "numbers" : statusLabel === "待处理" ? "handler" : "analyst"}" type="button">${escapeHtml(nextAction)}</button>
          <button data-delete-item="${escapeHtml(item.id)}" type="button">删除</button>
        </div>
      </header>

      <nav class="note-reader-tabs">
        ${renderNoteReaderTabs(activeTab)}
      </nav>

      <section class="note-reader-progress">
        <div>
          <strong>● ${escapeHtml(statusLabel)}&nbsp;&nbsp; ${escapeHtml(statusLabel === "待归档" ? "分析和 Numbers 已完成" : "这条笔记正在投研处理流中")}</strong>
          <p>${escapeHtml(statusLabel === "待数字" ? "下一步提取关键数字，后面复盘时不用回原文里捞数字。" : "可以按转录、处理、分析、数字、批判的顺序把笔记变成可复盘材料。")}</p>
        </div>
        <div class="note-reader-steps">
          <span>● 转录</span>
          <span>● 处理</span>
          <span>● 分析</span>
          <span>● 数字</span>
          <span class="warn">● 批判</span>
          <span class="muted">● 归档</span>
        </div>
        <button data-note-reader-tab="${statusLabel === "待数字" ? "numbers" : statusLabel === "待处理" ? "handler" : "analyst"}" type="button">${escapeHtml(nextAction)}</button>
      </section>

      ${renderNoteReaderBody(item, activeTab)}
    </article>
  `;
  return true;
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
  const active = state.items.find((item) => item.id === state.activeItemId);
  const isNoteReader = state.railView === "notes" && (state.readerMode === "note" || isUploadedNote(active));
  document.body.classList.toggle("note-reader-mode", isNoteReader);
  if (isNoteReader && renderNoteReader()) return;

  const company = activeCompany();
  const rows = activeItems();
  const localDocs = companyCloudItems(company.id);
  const evidence = rows.filter((item) => isVisibleMaterial(item)).length;
  const price = companyStockPrice(company);
  const industry = inferIndustry(company);
  const modelName = companyModelName(company, industry);
  const viewItems = rows.slice(0, 4);
  const selected = selectedItem();
  const selectedSummary = selected ? readableText(selected.summary || selected.sourceText || selected.title) : "暂无材料";
  const activeTab = companyWorkspaceTabs.some(([id]) => id === state.companyWorkspaceTab) ? state.companyWorkspaceTab : "home";
  const peerCompanies = state.companies
    .filter((row) => row.id !== company.id && inferIndustry(row) === industry)
    .slice(0, 18);
  const recentNotes = rows.slice(0, 12);
  const ctx = { company, rows, localDocs, evidence, price, industry, viewItems, selected, selectedSummary, peerCompanies, recentNotes };

  const isStandaloneBoard = state.railView === "folders" || state.railView === "daily" || state.railView === "team";
  els.companyWorkspace.hidden = isStandaloneBoard;
  document.body.classList.toggle("company-mode", !isStandaloneBoard);
  document.body.classList.remove("note-reader-mode");
  if (isStandaloneBoard) {
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
        <button data-upload-current-company type="button">上传文件</button>
        <button data-save-web-current-company type="button">保存网页</button>
        <button data-open-folder-for-company="${escapeHtml(company.id)}" type="button">普通文件夹</button>
      </div>
    </header>

    <label class="company-jump">
      <span>跳转公司 / ticker</span>
      <input id="companyJumpInput" placeholder="输入 ticker 或公司名" />
    </label>

    <section class="company-metrics">
      <article><span>股价</span><strong>${price.price}</strong><em class="${Number(price.change) >= 0 ? "up" : "down"}">${price.change}%</em></article>
      <article><span>模型</span><strong>${escapeHtml(company.name?.split(" ")[0] || company.ticker || "Company")}</strong><em>${escapeHtml(modelName)}</em></article>
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

function renderPortfolioCoverage() {
  if (!els.portfolioCoverageSummary || !els.portfolioCoverageCount) return;
  const portfolio = state.companies.filter((company) => company.portfolioStatus || company.universeType === "portfolio");
  const coverage = state.companies.filter((company) => company.coverageStatus || company.universeType === "coverage");
  els.portfolioCoverageCount.textContent = `${portfolio.length} / ${coverage.length}`;
  const holdings = portfolio.slice(0, 5).map((company) => `
    <button class="universe-row" data-company="${escapeHtml(company.id)}" type="button">
      <strong>${escapeHtml(company.ticker || company.name)}</strong>
      <span>${escapeHtml(company.positionWeight || company.positionShares || "持仓")}</span>
    </button>
  `).join("");
  const covered = coverage
    .filter((company) => !portfolio.some((row) => row.id === company.id))
    .slice(0, 5)
    .map((company) => `
      <button class="universe-row" data-company="${escapeHtml(company.id)}" type="button">
        <strong>${escapeHtml(company.ticker || company.name)}</strong>
        <span>${escapeHtml(company.coveragePriority || inferIndustry(company))}</span>
      </button>
    `).join("");

  els.portfolioCoverageSummary.innerHTML = `
    <div class="universe-kpis">
      <span><strong>${portfolio.length}</strong>Portfolio</span>
      <span><strong>${coverage.length}</strong>Coverage</span>
    </div>
    ${portfolio.length ? `<p>当前持仓</p>${holdings}` : `<p>还没有 Portfolio。上传 Excel/CSV 后会显示在这里。</p>`}
    ${covered.length ? `<p>覆盖公司</p>${covered}` : ""}
  `;
}

function renderRailTabs() {
  document.querySelectorAll("[data-rail-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.railView === state.railView);
  });
}

function renderRailCompanyJump() {
  const visible = state.railView === "notes" || state.railView === "folders";
  if (!els.railCompanyJump) return;
  els.railCompanyJump.hidden = !visible;
  if (!visible) return;

  const active = activeCompany();
  const recentIds = new Set();
  const recentCompanies = [
    active,
    ...activeItems()
      .map((item) => state.companies.find((company) => company.id === item.companyId))
      .filter(Boolean),
    ...state.companies
  ].filter((company) => {
    if (!company || recentIds.has(company.id)) return false;
    recentIds.add(company.id);
    return true;
  }).slice(0, 5);

  els.railCompanyJumpList.innerHTML = state.companies
    .slice()
    .sort((a, b) => String(a.ticker || a.name).localeCompare(String(b.ticker || b.name)))
    .map((company) => {
      const label = [company.ticker, company.name].filter(Boolean).join(" · ");
      return `<option value="${escapeHtml(company.ticker || company.name)}">${escapeHtml(label)}</option>`;
    })
    .join("");
  els.railCompanyJumpRecents.innerHTML = recentCompanies.map((company) => `
    <button class="${company.id === state.activeCompanyId ? "active" : ""}" data-company="${escapeHtml(company.id)}" type="button">
      <strong>${escapeHtml(company.name || company.ticker)}</strong>
      ${company.ticker ? `<em>${escapeHtml(company.ticker)}</em>` : ""}
      <span>→</span>
    </button>
  `).join("");
}

function renderTheme() {
  const mode = state.themeMode === "light" ? "light" : "dark";
  document.body.classList.toggle("light-theme", mode === "light");
  document.body.classList.toggle("dark-theme", mode !== "light");
  if (els.themeToggleBtn) {
    els.themeToggleBtn.textContent = mode === "light" ? "☾" : "☼";
    els.themeToggleBtn.title = mode === "light" ? "切换到夜晚主题" : "切换到白天主题";
  }
}

function renderAgentTabs() {
  const tabs = [
    "首页",
    ...(state.railView === "daily" ? ["新闻速递"] : []),
    "Andy PM Agent",
    "日度Agent",
    "周报Agent",
    "半导体Agent",
    "消费Agent",
    "工业商品Agent",
    "日本Agent",
    "军工金融Agent"
  ];
  els.agentTabs.innerHTML = tabs.map((tab, index) => `
    <button class="${(state.railView === "daily" ? tab === "新闻速递" : index === 0) ? "active" : ""}" type="button">${escapeHtml(tab)}</button>
  `).join("");
}

function selectCompany(companyId) {
  state.activeCompanyId = companyId;
  state.activeItemId = "";
  state.searchQuery = "";
  state.companyWorkspaceTab = "home";
  state.readerMode = "company";
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
  renderTheme();
  renderRailTabs();
  renderRailCompanyJump();
  renderAgentTabs();
  renderIntakeQueue();
  renderNotes();
  renderFolderBoard();
  renderDailyNewsBoard();
  renderTeamBoard();
  renderCompanyWorkspace();
  renderBrief();
  renderWorkflow();
  renderPmBoard();
  renderMarkets();
  renderCompanies();
  renderPortfolioCoverage();
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
    let upload = { text: "", readable: false, message: "" };
    try {
      upload = await readUploadText(file);
    } catch {
      upload = { text: "", readable: false, message: `${file.name} 已上传，但读取正文时失败。` };
    }
    const summary = upload.text.replace(/\s+/g, " ").trim().slice(0, 280);
    return {
      id: `${company.id}-${file.name}-${file.lastModified}`,
      companyId: company.id,
      type: "local",
      folderId: "cloud",
      tags: ["云端文件", "导入", upload.readable ? "可读正文" : "待解析"],
      title: file.name,
      source: company.ticker || "LOCAL",
      sourceText: upload.text || upload.message || `文件已上传到 ${company.ticker || company.name} 云端文件夹。暂不支持直接解析此文件类型。`,
      viewText: "",
      createdAt: new Date(file.lastModified || Date.now()).toISOString(),
      publishedAt: new Date(file.lastModified || Date.now()).toISOString(),
      summary: summary || upload.message || `${file.name} 已上传到云端文件夹`
    };
  }));
  addItems(imported);
  state.railView = "folders";
  els.fileInput.value = "";
  els.companyUploadInput.value = "";
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

function parseCompanyRows(text, universeType = "") {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const delimiter = lines.some((line) => line.includes("\t")) ? "\t" : ",";
  const rows = lines.map((line) => splitDelimitedLine(line, delimiter));
  const header = rows[0].map((cell) => cell.toLowerCase().replace(/\s+/g, ""));
  const hasHeader = header.some((cell) => ["公司", "公司名称", "name", "company", "ticker", "代码", "股票代码", "cik", "主题", "topics", "行业", "industry", "sector", "分类", "仓位", "weight", "持仓", "portfolio", "coverage", "覆盖", "优先级", "priority"].includes(cell));
  const body = hasHeader ? rows.slice(1) : rows;

  const findIndex = (names, fallback) => {
    const index = header.findIndex((cell) => names.includes(cell));
    return index >= 0 ? index : fallback;
  };
  const nameIndex = hasHeader ? findIndex(["公司", "公司名称", "name", "company", "companyname"], 0) : 0;
  const tickerIndex = hasHeader ? findIndex(["代码", "股票代码", "ticker", "symbol"], 1) : 1;
  const cikIndex = hasHeader ? findIndex(["cik", "sec", "seccik"], -1) : 2;
  const topicsIndex = hasHeader ? findIndex(["主题", "topics", "tags", "关注点"], -1) : 3;
  const industryIndex = hasHeader ? findIndex(["行业", "industry", "sector", "分类"], -1) : -1;
  const universeIndex = hasHeader ? findIndex(["类型", "type", "list", "名单", "组合", "universe"], -1) : -1;
  const weightIndex = hasHeader ? findIndex(["仓位", "权重", "weight", "position", "positionsize", "持仓比例"], -1) : -1;
  const sharesIndex = hasHeader ? findIndex(["股数", "shares", "quantity", "qty"], -1) : -1;
  const costIndex = hasHeader ? findIndex(["成本", "cost", "costbasis", "avgcost", "均价"], -1) : -1;
  const priorityIndex = hasHeader ? findIndex(["优先级", "priority", "rank", "重要性"], -1) : -1;
  const noteIndex = hasHeader ? findIndex(["备注", "notes", "note", "comment", "commentary"], -1) : -1;

  return body.map((row) => {
    const name = (row[nameIndex] || "").trim();
    const ticker = (row[tickerIndex] || "").trim().toUpperCase();
    const cik = (cikIndex >= 0 ? row[cikIndex] || "" : "").replace(/\D/g, "");
    const topics = (topicsIndex >= 0 ? row[topicsIndex] || "" : "")
      .split(/[;,，、]/)
      .map((topic) => topic.trim())
      .filter(Boolean);
    const industry = industryIndex >= 0 ? (row[industryIndex] || "").trim() : "";
    const importedType = (row[universeIndex] || universeType || "").toLowerCase();
    const isPortfolio = /portfolio|持仓|组合|holding|position/.test(importedType);
    const isCoverage = /coverage|覆盖|研究|watch|watchlist/.test(importedType) || universeType === "coverage";
    if (!name && !ticker) return null;
    const id = (ticker || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return {
      id,
      name: name || ticker,
      ticker,
      cik,
      industry,
      topics,
      universeType: isPortfolio ? "portfolio" : isCoverage ? "coverage" : universeType || "coverage",
      portfolioStatus: isPortfolio ? "holding" : "",
      coverageStatus: isCoverage || isPortfolio ? "covered" : "",
      positionWeight: weightIndex >= 0 ? (row[weightIndex] || "").trim() : "",
      positionShares: sharesIndex >= 0 ? (row[sharesIndex] || "").trim() : "",
      costBasis: costIndex >= 0 ? (row[costIndex] || "").trim() : "",
      coveragePriority: priorityIndex >= 0 ? (row[priorityIndex] || "").trim() : "",
      universeNote: noteIndex >= 0 ? (row[noteIndex] || "").trim() : "",
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

function upsertCompanyRows(rows, { activateFirst = true } = {}) {
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
        topics: row.topics.length ? row.topics : previous.topics,
        universeType: row.universeType || previous.universeType,
        portfolioStatus: row.portfolioStatus || previous.portfolioStatus,
        coverageStatus: row.coverageStatus || previous.coverageStatus,
        positionWeight: row.positionWeight || previous.positionWeight,
        positionShares: row.positionShares || previous.positionShares,
        costBasis: row.costBasis || previous.costBasis,
        coveragePriority: row.coveragePriority || previous.coveragePriority,
        universeNote: row.universeNote || previous.universeNote
      });
    } else {
      state.companies.push(row);
      existing.set(row.id, row);
    }
  });

  if (activateFirst) state.activeCompanyId = rows[0].id;
  state.activeItemId = "";
  state.searchQuery = "";
  saveState();
  render();
  rows.forEach((company) => persistCompany(existing.get(company.id) || company));
  maybeAutoRefreshCompany(state.activeCompanyId);
}

function importCompanies() {
  const rows = parseCompanyRows(els.companyImportText.value);
  upsertCompanyRows(rows);
  els.companyImportText.value = "";
  els.companyImportFile.value = "";
  updateCompanyImportPreview();
}

async function importUniverseFile(file, universeType) {
  if (!file) return;
  try {
    const text = await readTableFile(file);
    const rows = parseCompanyRows(text, universeType);
    if (!rows.length) {
      alert("没有识别到公司。请确认文件里至少有公司名或 ticker 列。");
      return;
    }
    upsertCompanyRows(rows);
  } catch (error) {
    alert(`导入失败：${error.message || "文件无法读取"}`);
  } finally {
    if (universeType === "portfolio") els.portfolioUploadInput.value = "";
    if (universeType === "coverage") els.coverageUploadInput.value = "";
  }
}

async function uploadTeamFiles(files) {
  const rows = [];
  for (const file of [...(files || [])]) {
    let upload = { text: "", readable: false, message: "" };
    try {
      upload = await readUploadText(file);
    } catch (error) {
      upload = { text: "", readable: false, message: `${file.name} 读取失败：${error.message || "无法解析文件"}` };
    }
    rows.push({
      id: `team-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size || 0,
      kind: fileKind(file).toUpperCase(),
      uploadedAt: new Date().toISOString(),
      readable: upload.readable,
      preview: (upload.text || upload.message || "").slice(0, 8000)
    });
  }
  if (!rows.length) return;
  state.teamFiles = [...rows, ...teamFiles()].slice(0, 80);
  state.railView = "team";
  els.teamUploadInput.value = "";
  saveState();
  render();
}

function createCustomFolder(parentId = "") {
  const name = prompt(parentId ? "新建子文件夹名称" : "新建文件夹名称");
  if (!name?.trim()) return;
  const folder = {
    id: `folder-${Date.now().toString(36)}`,
    name: name.trim(),
    parentId: parentId || "",
    createdAt: new Date().toISOString()
  };
  state.customFolders = [...customFolders(), folder];
  state.railView = "folders";
  state.folderPath = [`custom:${folder.id}`];
  saveState();
  render();
}

function deleteCustomFolder(folderId) {
  const folder = customFolders().find((row) => row.id === folderId);
  if (!folder) return;
  const ids = descendantCustomFolderIds(folderId);
  const itemIds = state.items
    .filter((item) => ids.includes(String(item.folderId || "").replace(/^custom:/, "")))
    .map((item) => item.id);
  const confirmed = confirm(`删除「${folder.name}」及其 ${ids.length - 1} 个子文件夹、${itemIds.length} 份资料？`);
  if (!confirmed) return;
  state.customFolders = customFolders().filter((row) => !ids.includes(row.id));
  state.items = state.items.filter((item) => !itemIds.includes(item.id));
  state.folderPath = folder.parentId ? [`custom:${folder.parentId}`] : [];
  saveState();
  render();
  if (itemIds.length) {
    api("items", { method: "DELETE", body: JSON.stringify({ ids: itemIds }) }).catch((error) => {
      console.warn("Deleted locally only:", error.message);
    });
  }
}

async function saveWebUrlToCustomFolder(folderId) {
  const folder = customFolders().find((row) => row.id === folderId);
  const input = document.querySelector(`[data-save-web-url-input="${folderId}"]`);
  const url = input?.value.trim();
  if (!folder || !url) return;
  const now = new Date().toISOString();
  try {
    const data = await api("fetch-url", {
      method: "POST",
      body: JSON.stringify({ url })
    });
    const title = data.title || url;
    const text = cleanTranscriptText(data.text || "");
    const item = {
      id: `${folder.id}-web-${Date.now().toString(36)}`,
      companyId: null,
      type: "local",
      folderId: `custom:${folder.id}`,
      tags: ["网页保存", folder.name, text ? "可读正文" : "链接"],
      title,
      source: data.source || "WEB",
      url,
      sourceText: text || `已保存网页链接：${url}`,
      viewText: "",
      createdAt: now,
      publishedAt: now,
      summary: (text || data.description || url).replace(/\s+/g, " ").trim().slice(0, 280)
    };
    addItems([item]);
    state.railView = "folders";
    state.folderPath = [`custom:${folder.id}`];
    if (input) input.value = "";
    saveState();
    render();
  } catch (error) {
    alert(`保存网页失败：${error.message || "链接无法读取"}`);
  }
}

async function saveWebUrlToCompany(companyId = activeCompany().id) {
  const company = state.companies.find((row) => row.id === companyId) || activeCompany();
  const url = prompt(`保存网页 / PDF / 文件链接到 ${company.ticker || company.name} 云端文件夹`);
  if (!url?.trim()) return;
  const now = new Date().toISOString();
  try {
    const data = await api("fetch-url", {
      method: "POST",
      body: JSON.stringify({ url: url.trim() })
    });
    const title = data.title || url.trim();
    const text = cleanTranscriptText(data.text || "");
    const item = {
      id: `${company.id}-web-${Date.now().toString(36)}`,
      companyId: company.id,
      type: "local",
      folderId: "cloud",
      tags: ["网页保存", company.ticker || company.name, text ? "可读正文" : "链接"],
      title,
      source: data.source || company.ticker || "WEB",
      url: url.trim(),
      sourceText: text || `已保存网页链接：${url.trim()}`,
      viewText: "",
      createdAt: now,
      publishedAt: now,
      summary: (text || data.description || url.trim()).replace(/\s+/g, " ").trim().slice(0, 280)
    };
    addItems([item]);
    state.activeCompanyId = company.id;
    state.railView = "folders";
    state.folderPath = [inferIndustry(company)];
    saveState();
    render();
  } catch (error) {
    alert(`保存网页失败：${error.message || "链接无法读取"}`);
  }
}

function addDailyNewsSource() {
  const nameInput = document.querySelector("#dailyNewsSourceName");
  const urlInput = document.querySelector("#dailyNewsSourceUrl");
  const rawUrl = urlInput?.value.trim() || "";
  if (!rawUrl) return;
  let url = rawUrl;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    alert("这个新闻源链接看起来不完整，请输入 https:// 开头的网址。");
    return;
  }
  const source = {
    id: `news-source-${Date.now().toString(36)}`,
    name: nameInput?.value.trim() || host,
    category: "自定义",
    domain: host,
    query: rawUrl,
    limit: 1,
    url,
    createdAt: new Date().toISOString()
  };
  const exists = dailyNewsSources().some((row) => sourceKey(row) === sourceKey(source));
  if (exists) {
    alert("这个新闻源已经添加过了。");
    return;
  }
  state.dailyNewsSources = [...dailyNewsSources(), source];
  state.dailyNewsTab = "sources";
  saveState();
  render();
}

function addCatalogSource(category, catalogId) {
  const group = dailyNewsSourceCatalog.find((row) => row.category === category);
  const row = group?.rows.find((entry) => catalogSourceId(category, entry) === catalogId);
  if (!row) return;
  const source = catalogSourcePayload(category, row);
  const exists = dailyNewsSources().some((entry) => sourceKey(entry) === sourceKey(source));
  if (exists) return;
  state.dailyNewsSources = [...dailyNewsSources(), source];
  state.dailyNewsTab = "sources";
  saveState();
  render();
}

function addCatalogCategory(category) {
  const group = dailyNewsSourceCatalog.find((row) => row.category === category);
  if (!group) return;
  const known = enabledCatalogSourceKeys();
  const fresh = group.rows
    .map((row) => catalogSourcePayload(category, row))
    .filter((source) => !known.has(sourceKey(source)));
  if (!fresh.length) return;
  state.dailyNewsSources = [...dailyNewsSources(), ...fresh];
  state.dailyNewsTab = "sources";
  saveState();
  render();
}

function deleteDailyNewsSource(sourceId) {
  const source = dailyNewsSources().find((row) => row.id === sourceId);
  if (!source) return;
  const confirmed = confirm(`删除新闻源「${source.name || source.url}」？`);
  if (!confirmed) return;
  state.dailyNewsSources = dailyNewsSources().filter((row) => row.id !== sourceId);
  saveState();
  render();
}

function newsItemFromFetch(source, data, now) {
  const text = cleanTranscriptText(data.text || "");
  const summary = (data.description || data.title || text || source.url).replace(/\s+/g, " ").trim().slice(0, 360);
  return {
    id: `daily-news-${source.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    companyId: null,
    type: "open",
    folderId: "daily-news",
    tags: ["今日新闻", "新闻源", source.name || "NEWS"],
    title: readableText(data.title || source.name || source.url),
    source: source.name || data.source || "NEWS",
    url: data.url || source.url,
    sourceText: text || summary,
    viewText: "",
    createdAt: now,
    publishedAt: now,
    summary
  };
}

function newsItemFromArticle(source, article, now, index = 0) {
  const title = readableText(article.title || source.name || source.query || source.url);
  const summary = readableText(article.summary || article.snippet || article.title || "").slice(0, 360);
  return {
    id: `daily-news-${source.id}-${index}-${String(article.id || article.url || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 90)}`,
    companyId: null,
    type: "open",
    folderId: "daily-news",
    category: source.category || "未分类",
    domain: source.domain || "",
    query: source.query || "",
    tags: ["今日新闻", "新闻源", source.category || "", source.domain || source.name || "NEWS"].filter(Boolean),
    title,
    zhTitle: localizeNewsTitle(title),
    source: article.source || source.domain || source.name || "NEWS",
    url: article.url || source.url,
    sourceText: summary,
    viewText: "",
    createdAt: now,
    publishedAt: article.publishedAt || now,
    summary
  };
}

async function fetchDailySource(source, now) {
  if (source.query) {
    const query = source.domain && source.domain !== "广义搜索"
      ? `site:${source.domain} ${source.query}`
      : source.query;
    const data = await api(`open-web?q=${encodeURIComponent(query)}`);
    return (data.articles || [])
      .slice(0, Number(source.limit || 3))
      .map((article, index) => newsItemFromArticle(source, article, now, index));
  }
  const data = await api("fetch-url", {
    method: "POST",
    body: JSON.stringify({ url: source.url })
  });
  return [newsItemFromFetch(source, data, now)];
}

async function localizeDailyNews(items) {
  if (!items.length) return { items, summaries: {} };
  const fallback = buildDailyCategorySummaries(items);
  try {
    const data = await api("daily-news-localize", {
      method: "POST",
      body: JSON.stringify({
        items: items.slice(0, 80).map((item) => ({
          id: item.id,
          category: item.category || "未分类",
          title: item.title,
          summary: item.summary,
          source: item.source
        }))
      })
    });
    const titleMap = new Map((data.items || []).map((row) => [row.id, row.zhTitle]));
    return {
      items: items.map((item) => ({
        ...item,
        zhTitle: titleMap.get(item.id) || item.zhTitle || localizeNewsTitle(item.title)
      })),
      summaries: { ...fallback, ...(data.categorySummaries || {}) }
    };
  } catch (error) {
    console.warn("Daily news localization failed:", error.message);
    return {
      items: items.map((item) => ({ ...item, zhTitle: item.zhTitle || localizeNewsTitle(item.title) })),
      summaries: fallback
    };
  }
}

function buildDailyCategorySummaries(items) {
  const grouped = items.reduce((acc, item) => {
    const category = item.category || "未分类";
    if (!acc[category]) acc[category] = [];
    if (acc[category].length < 3) acc[category].push(localizeNewsTitle(item.title));
    return acc;
  }, {});
  return Object.fromEntries(Object.entries(grouped).map(([category, titles]) => [
    category,
    `${category}今日主要关注：${titles.join("；")}。需要继续跟踪对相关公司、行业供需和估值预期的影响。`
  ]));
}

async function generateDailyNews() {
  const sources = dailyNewsSources();
  if (!sources.length || dailyNewsBusy) return;
  dailyNewsBusy = true;
  dailyNewsStatus = `正在抓取 ${sources.length} 个新闻源...`;
  render();

  const now = new Date().toISOString();
  const results = [];
  for (const source of sources) {
    dailyNewsStatus = `正在抓取：${source.name || source.url}`;
    render();
    try {
      results.push(...await fetchDailySource(source, now));
    } catch (error) {
      results.push({
        id: `daily-news-error-${source.id}-${Date.now().toString(36)}`,
        companyId: null,
        type: "open",
        folderId: "daily-news",
        category: source.category || "未分类",
        tags: ["今日新闻", "抓取失败", source.name || "NEWS"],
        title: `${source.name || source.url} 抓取失败`,
        zhTitle: `${source.name || source.url} 抓取失败`,
        source: source.name || "NEWS",
        url: source.url,
        sourceText: `抓取失败：${error.message || "网站暂时无法读取"}`,
        viewText: "",
        createdAt: now,
        publishedAt: now,
        summary: error.message || "网站暂时无法读取"
      });
    }
  }

  dailyNewsStatus = "正在生成中文标题和分类摘要...";
  render();
  const localized = await localizeDailyNews(results);
  const localizedResults = localized.items;
  const known = new Set(state.items.map((item) => item.id));
  const fresh = localizedResults.filter((item) => item.id && !known.has(item.id));
  state.items = [...fresh, ...state.items].slice(0, 600);
  state.dailyNewsItems = fresh;
  state.dailyNewsCategorySummaries = localized.summaries;
  state.lastFetchedAt = new Date().toISOString();
  state.dailyNewsTab = "generate";
  dailyNewsStatus = `已生成 ${fresh.length} 条今日新闻。`;
  dailyNewsBusy = false;
  saveState();
  render();
  persistItems(fresh);
}

async function uploadFilesToCustomFolder(files, folderId) {
  const folder = customFolders().find((row) => row.id === folderId);
  if (!folder) return;
  const imported = await Promise.all([...files].map(async (file) => {
    let upload = { text: "", readable: false, message: "" };
    try {
      upload = await readUploadText(file);
    } catch {
      upload = { text: "", readable: false, message: `${file.name} 已上传，但读取正文时失败。` };
    }
    const now = new Date().toISOString();
    const summary = upload.text.replace(/\s+/g, " ").trim().slice(0, 280);
    return {
      id: `${folder.id}-${file.name}-${file.lastModified || Date.now()}`,
      companyId: null,
      type: "local",
      folderId: `custom:${folder.id}`,
      tags: ["自定义分类", folder.name, upload.readable ? "可读正文" : "待解析"],
      title: file.name,
      source: folder.name,
      sourceText: upload.text || upload.message || `文件已上传到「${folder.name}」。暂不支持直接解析此文件类型。`,
      viewText: "",
      createdAt: now,
      publishedAt: now,
      summary: summary || upload.message || `${file.name} 已上传到「${folder.name}」`
    };
  }));
  addItems(imported);
  state.railView = "folders";
  state.folderPath = [`custom:${folder.id}`];
  els.folderUploadInput.value = "";
  saveState();
  render();
}

async function attachTranscriptFile(files) {
  const file = [...(files || [])][0];
  const item = selectedNoteItem();
  if (!file || !item) return;

  const buttonText = "正在读取文件内容...";
  const previousSummary = item.summary || "";
  item.summary = buttonText;
  state.readerMode = "note";
  state.noteReaderTab = "transcript";
  saveState();
  render();

  let upload = { text: "", readable: false, message: "" };
  try {
    upload = await readUploadText(file);
  } catch (error) {
    upload = { text: "", readable: false, message: `${file.name} 读取失败：${error.message || "无法解析文件"}` };
  }

  const text = upload.text || upload.message || `${file.name} 已选择，但没有读取到正文。`;
  item.sourceText = text;
  item.rawText = "";
  item.viewText = item.viewText || "";
  item.summary = upload.readable ? text.replace(/\s+/g, " ").trim().slice(0, 280) : text;
  item.type = item.type || "local";
  item.folderId = item.folderId || "cloud";
  item.source = item.source || itemCompany(item)?.ticker || "LOCAL";
  item.tags = [...new Set([...materialTags(item), upload.readable ? "可读正文" : "待解析", fileKind(file).toUpperCase()])].slice(0, 12);
  item.publishedAt = new Date().toISOString();
  item.createdAt = item.createdAt || item.publishedAt;
  if (!upload.readable && previousSummary && previousSummary !== buttonText) item.viewText = item.viewText || previousSummary;

  els.transcriptFileInput.value = "";
  saveState();
  render();
  persistItems([item]);
}

async function processCurrentNote(task = "analyze") {
  const item = selectedNoteItem();
  if (!item || noteProcessorBusy) return;
  const modelId = document.querySelector("#processorModelSelect")?.value || noteProcessorModels[0].id;
  const model = noteProcessorModels.find((row) => row.id === modelId) || noteProcessorModels[0];
  const apiKeyInput = document.querySelector("#processorApiKeyInput")?.value.trim() || "";
  const remember = document.querySelector("#processorRememberKey")?.checked;
  const source = (task === "analyze" || task === "portfolio")
    ? (materialTranslation(item) || originalNoteText(item))
    : originalNoteText(item);
  if (!source) {
    noteProcessorStatus = task === "translate"
      ? "当前笔记没有可处理的原文。请先上传/读取文件内容，或切到 Transcript 检查是否有正文。"
      : "当前笔记没有可分析的整理稿或原文。请先用处理者整理，或切到 Transcript 检查是否有正文。";
    render();
    return;
  }

  try {
    if (apiKeyInput && remember) {
      localStorage.setItem(processorKeyStorageId(model.provider), apiKeyInput);
    }
    localStorage.setItem("andy-workstation-note-processor-model", model.id);
  } catch {
    // Local key storage is optional.
  }

  noteProcessorBusy = true;
  const actionLabel = task === "translate" ? "整理" : task === "portfolio" ? "分析组合影响" : "分析";
  noteProcessorStatus = `正在使用 ${model.label} ${actionLabel}当前笔记...`;
  render();

  try {
    const data = await api("process-note", {
      method: "POST",
      body: JSON.stringify({
        model: model.id,
        provider: model.provider,
        task,
        apiKey: apiKeyInput || processorStoredKey(model.provider),
        title: item.title,
        source,
        sourceKind: (task === "analyze" || task === "portfolio") && materialTranslation(item) ? "organized-note" : "original-note",
        companies: task === "portfolio" ? portfolioUniverse() : undefined
      })
    });
    const result = data.result || "";
    if (task === "translate") {
      item.translationText = result;
      item.tags = [...new Set([...materialTags(item), "已整理", model.label])].slice(0, 12);
    } else if (task === "portfolio") {
      item.portfolioImpactText = result;
      item.tags = [...new Set([...materialTags(item), "组合影响", model.label])].slice(0, 12);
    } else {
      item.viewText = result;
      item.summary = result.replace(/\s+/g, " ").trim().slice(0, 280);
      item.tags = [...new Set([...materialTags(item), "已分析", model.label])].slice(0, 12);
    }
    item.processor = { model: model.id, provider: model.provider, task, processedAt: new Date().toISOString() };
    item.publishedAt = new Date().toISOString();
    noteProcessorStatus = `已完成：${model.label} 已生成${task === "translate" ? "整理稿" : task === "portfolio" ? "组合影响分析" : "分析结果"}。`;
    saveState();
    persistItems([item]);
  } catch (error) {
    noteProcessorStatus = `处理失败：${error.message || "模型接口暂时不可用"}`;
    if (task === "translate") {
      item.translationText = `处理失败：${error.message || "模型接口暂时不可用"}\n请检查 API key、模型名或 Cloudflare 环境变量。`;
    } else if (task === "portfolio") {
      item.portfolioImpactText = `## 处理失败\n- ${error.message || "模型接口暂时不可用"}\n- 请检查 API key、模型名或 Cloudflare 环境变量。`;
    } else {
      item.viewText = `## 处理失败\n- ${error.message || "模型接口暂时不可用"}\n- 请检查 API key、模型名或 Cloudflare 环境变量。`;
    }
    saveState();
  } finally {
    noteProcessorBusy = false;
    render();
  }
}

async function refreshStockPrice(companyId = state.activeCompanyId) {
  const company = state.companies.find((row) => row.id === companyId) || activeCompany();
  const ticker = String(company?.ticker || "").trim().toUpperCase();
  if (!ticker || stockPriceBusy) return;
  const range = activeStockRange();
  const interval = activeStockInterval();
  stockPriceBusy = true;
  stockPriceStatus = `正在更新 ${ticker} ${stockRangeOptions.find(([id]) => id === range)?.[1] || range} ${stockIntervalOptions.find(([id]) => id === interval)?.[1] || interval}`;
  render();
  try {
    const data = await api(`stock-price?ticker=${encodeURIComponent(ticker)}&range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`);
    state.stockPrices = {
      ...(state.stockPrices || {}),
      [stockCacheKey(ticker, range, interval)]: data
    };
    stockPriceStatus = `已更新 ${ticker}`;
    saveState();
  } catch (error) {
    stockPriceStatus = `更新失败：${error.message || "行情接口不可用"}`;
  } finally {
    stockPriceBusy = false;
    render();
  }
}

function changeStockChartSetting(kind, value) {
  if (kind === "range" && stockRangeOptions.some(([id]) => id === value)) {
    state.stockChartRange = value;
  }
  if (kind === "interval" && stockIntervalOptions.some(([id]) => id === value)) {
    state.stockChartInterval = value;
  }
  if (kind === "indicator" && stockIndicatorOptions.some(([id]) => id === value)) {
    state.stockChartIndicator = value;
  }
  saveState();
  render();
  if (kind === "range" || kind === "interval") refreshStockPrice(state.activeCompanyId);
}

function saveCurrentNoteIdea({ renderAfter = false } = {}) {
  const item = selectedNoteItem();
  const input = document.querySelector("[data-note-idea-input]");
  if (!item || !input) return;
  item.ideaText = input.value;
  item.ideaUpdatedAt = new Date().toISOString();
  item.tags = [...new Set([...materialTags(item), "有想法"])].slice(0, 12);
  saveState();
  persistItems([item]);
  const stateLabel = document.querySelector("[data-idea-save-state]");
  if (stateLabel) stateLabel.textContent = "已保存";
  if (renderAfter) render();
}

function deleteItem(itemId) {
  const item = state.items.find((row) => row.id === itemId);
  if (!item) return;
  const confirmed = confirm(`删除这条笔记？\n\n${readableText(item.title || "未命名笔记")}`);
  if (!confirmed) return;
  state.items = state.items.filter((row) => row.id !== itemId);
  if (state.activeItemId === itemId) {
    const next = noteListItems()[0] || state.items.find(isVisibleMaterial) || null;
    state.activeItemId = next?.id || "";
    state.readerMode = next ? "note" : "company";
    state.noteReaderTab = "analyst";
  }
  saveState();
  render();
  api("items", { method: "DELETE", body: JSON.stringify({ ids: [itemId] }) }).catch((error) => {
    console.warn("Deleted locally only:", error.message);
  });
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
  const deleteButton = event.target.closest("[data-delete-item]");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    deleteItem(deleteButton.dataset.deleteItem);
    return;
  }
  const dailyItem = event.target.closest("[data-daily-item-id]");
  if (dailyItem) {
    const item = state.items.find((row) => row.id === dailyItem.dataset.dailyItemId);
    if (item?.companyId) state.activeCompanyId = item.companyId;
    state.activeItemId = dailyItem.dataset.dailyItemId;
    state.readerMode = "note";
    state.noteReaderTab = "analyst";
    state.railView = "notes";
    saveState();
    render();
    return;
  }
  const noteReaderTab = event.target.closest("[data-note-reader-tab]");
  if (noteReaderTab) {
    if (document.querySelector("[data-note-idea-input]")) saveCurrentNoteIdea();
    state.noteReaderTab = noteReaderTab.dataset.noteReaderTab;
    state.readerMode = "note";
    saveState();
    render();
    return;
  }
  const companyTab = event.target.closest("[data-company-tab]");
  if (companyTab) {
    state.companyWorkspaceTab = companyTab.dataset.companyTab;
    state.readerMode = "company";
    saveState();
    render();
    return;
  }
  const companyButton = event.target.closest("[data-company]");
  if (companyButton) {
    selectCompany(companyButton.dataset.company);
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
    state.readerMode = "company";
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
    createCustomFolder(createFolder.dataset.createFolder || "");
    return;
  }
  const deleteFolder = event.target.closest("[data-delete-folder]");
  if (deleteFolder) {
    deleteCustomFolder(deleteFolder.dataset.deleteFolder);
    return;
  }
  const uploadFolder = event.target.closest("[data-upload-folder]");
  if (uploadFolder) {
    els.folderUploadInput.dataset.folderId = uploadFolder.dataset.uploadFolder;
    els.folderUploadInput.click();
    return;
  }
  const saveWebUrl = event.target.closest("[data-save-web-url]");
  if (saveWebUrl) {
    saveWebUrlToCustomFolder(saveWebUrl.dataset.saveWebUrl);
    return;
  }
  const dailyNewsTab = event.target.closest("[data-daily-news-tab]");
  if (dailyNewsTab) {
    state.dailyNewsTab = dailyNewsTab.dataset.dailyNewsTab;
    state.railView = "daily";
    saveState();
    render();
    return;
  }
  const addNewsSource = event.target.closest("[data-add-news-source]");
  if (addNewsSource) {
    addDailyNewsSource();
    return;
  }
  const addCatalog = event.target.closest("[data-add-catalog-source]");
  if (addCatalog) {
    const [category, catalogId] = String(addCatalog.dataset.addCatalogSource || "").split("|");
    addCatalogSource(category, catalogId);
    return;
  }
  const addCatalogGroup = event.target.closest("[data-add-catalog-category]");
  if (addCatalogGroup) {
    addCatalogCategory(addCatalogGroup.dataset.addCatalogCategory);
    return;
  }
  const deleteNewsSource = event.target.closest("[data-delete-news-source]");
  if (deleteNewsSource) {
    deleteDailyNewsSource(deleteNewsSource.dataset.deleteNewsSource);
    return;
  }
  const generateNews = event.target.closest("[data-generate-daily-news]");
  if (generateNews) {
    generateDailyNews();
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
    els.companyUploadInput.click();
    return;
  }
  const saveWebCurrentCompany = event.target.closest("[data-save-web-current-company]");
  if (saveWebCurrentCompany) {
    saveWebUrlToCompany(activeCompany().id);
    return;
  }
  const attachTranscript = event.target.closest("[data-attach-transcript-file]");
  if (attachTranscript) {
    els.transcriptFileInput.click();
    return;
  }
  const translateNote = event.target.closest("[data-translate-note]");
  if (translateNote) {
    processCurrentNote("translate");
    return;
  }
  const analyzeNote = event.target.closest("[data-analyze-note]");
  if (analyzeNote) {
    processCurrentNote("analyze");
    return;
  }
  const portfolioImpactNote = event.target.closest("[data-portfolio-impact-note]");
  if (portfolioImpactNote) {
    processCurrentNote("portfolio");
    return;
  }
  const refreshStock = event.target.closest("[data-refresh-stock]");
  if (refreshStock) {
    refreshStockPrice(refreshStock.dataset.refreshStock);
    return;
  }
  const stockRange = event.target.closest("[data-stock-range]");
  if (stockRange) {
    changeStockChartSetting("range", stockRange.dataset.stockRange);
    return;
  }
  const stockInterval = event.target.closest("[data-stock-interval]");
  if (stockInterval) {
    changeStockChartSetting("interval", stockInterval.dataset.stockInterval);
    return;
  }
  const stockIndicator = event.target.closest("[data-stock-indicator]");
  if (stockIndicator) {
    changeStockChartSetting("indicator", stockIndicator.dataset.stockIndicator);
    return;
  }
  const uploadTeamFile = event.target.closest("[data-upload-team-file]");
  if (uploadTeamFile) {
    els.teamUploadInput.click();
    return;
  }
  const saveIdea = event.target.closest("[data-save-note-idea]");
  if (saveIdea) {
    saveCurrentNoteIdea({ renderAfter: true });
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
document.addEventListener("input", (event) => {
  const folderSearch = event.target.closest("[data-folder-search]");
  if (folderSearch) {
    state.folderSearchQuery = folderSearch.value;
    saveState();
    renderCloudFolders();
    renderFolderBoard();
    return;
  }

  const ideaInput = event.target.closest("[data-note-idea-input]");
  if (!ideaInput) return;
  const stateLabel = document.querySelector("[data-idea-save-state]");
  if (stateLabel) stateLabel.textContent = "正在输入...";
  window.clearTimeout(ideaSaveTimer);
  ideaSaveTimer = window.setTimeout(() => saveCurrentNoteIdea(), 1200);
});
document.addEventListener("keydown", (event) => {
  const companyJump = event.target.closest("#companyJumpInput");
  if (companyJump && event.key === "Enter") {
    event.preventDefault();
    const success = goToCompanyQuery(companyJump.value);
    if (!success) companyJump.setCustomValidity("没有找到公司，也无法新建公司页。");
    return;
  }

  const sourceInput = event.target.closest("#dailyNewsSourceName, #dailyNewsSourceUrl");
  if (!sourceInput || event.key !== "Enter") return;
  event.preventDefault();
  addDailyNewsSource();
});
els.themeToggleBtn?.addEventListener("click", () => {
  state.themeMode = state.themeMode === "light" ? "dark" : "light";
  saveState();
  render();
});
els.globalUploadBtn.addEventListener("click", () => {
  const selected = Array.isArray(state.folderPath) ? state.folderPath[0] || "" : "";
  const customId = selected.startsWith("custom:") ? selected.slice(7) : "";
  if (state.railView === "folders" && customId) {
    els.folderUploadInput.dataset.folderId = customId;
    els.folderUploadInput.click();
    return;
  }
  els.companyUploadInput.click();
});
els.globalSaveWebBtn.addEventListener("click", () => {
  const selected = Array.isArray(state.folderPath) ? state.folderPath[0] || "" : "";
  const customId = selected.startsWith("custom:") ? selected.slice(7) : "";
  if (state.railView === "folders" && customId) {
    const input = document.querySelector(`[data-save-web-url-input="${customId}"]`);
    if (input) {
      input.focus();
      return;
    }
  }
  saveWebUrlToCompany(activeCompany().id);
});
document.querySelectorAll("[data-rail-view]").forEach((button) => {
  button.addEventListener("click", () => {
    state.railView = button.dataset.railView;
    state.searchQuery = "";
    if (state.railView === "folders") state.folderPath = [];
    if (state.railView === "daily") state.dailyNewsTab = state.dailyNewsTab || "sources";
    if (state.railView === "team") state.readerMode = "team";
    saveState();
    render();
  });
});
els.railCompanyJump?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = els.railCompanyJumpInput.value.trim();
  if (!query) {
    els.railCompanyJumpHint.textContent = "输入公司名或 ticker 后按回车。";
    return;
  }
  const matched = findCompanyByQuery(query);
  const success = goToCompanyQuery(query);
  if (success) {
    els.railCompanyJumpInput.value = "";
    els.railCompanyJumpHint.textContent = matched ? `已打开 ${matched.ticker || matched.name}` : "已新建公司页";
  } else {
    els.railCompanyJumpHint.textContent = "没有找到，也无法新建公司页。";
  }
});
els.railCompanyJumpInput?.addEventListener("input", (event) => {
  const query = event.target.value.trim();
  const matched = findCompanyByQuery(query);
  els.railCompanyJumpHint.textContent = query && matched
    ? `将打开 ${matched.ticker || matched.name} · ${matched.name || matched.ticker}`
    : "";
});
els.noteStream.addEventListener("click", (event) => {
  const button = event.target.closest("[data-item-id]");
  if (!button) return;
  if (document.querySelector("[data-note-idea-input]")) saveCurrentNoteIdea();
  const item = state.items.find((row) => row.id === button.dataset.itemId);
  if (item?.companyId) {
    state.activeCompanyId = item.companyId;
  }
  state.readerMode = "note";
  state.noteReaderTab = "analyst";
  state.activeItemId = button.dataset.itemId;
  saveState();
  render();
  if (storedTextLooksLikeFileBytes(item)) recoverStoredFileTranscript(item);
});
els.searchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value;
  saveState();
  render();
});
els.companyUploadInput.addEventListener("change", (event) => importFiles(event.target.files));
els.fileInput.addEventListener("change", (event) => importFiles(event.target.files));
els.folderUploadInput.addEventListener("change", (event) => uploadFilesToCustomFolder(event.target.files, event.target.dataset.folderId));
els.transcriptFileInput.addEventListener("change", (event) => attachTranscriptFile(event.target.files));
els.teamUploadInput.addEventListener("change", (event) => uploadTeamFiles(event.target.files));
document.addEventListener("change", (event) => {
  const modelSelect = event.target.closest("#processorModelSelect");
  if (!modelSelect) return;
  try {
    localStorage.setItem("andy-workstation-note-processor-model", modelSelect.value);
  } catch {
    // Ignore private browsing storage failures.
  }
  render();
});
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
  els.companyImportText.value = await readTableFile(file);
  updateCompanyImportPreview();
});
els.portfolioUploadInput.addEventListener("change", (event) => importUniverseFile(event.target.files?.[0], "portfolio"));
els.coverageUploadInput.addEventListener("change", (event) => importUniverseFile(event.target.files?.[0], "coverage"));
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
