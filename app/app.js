const STORAGE_KEY = "prisma-estudos-state-v1";
const LOCAL_SESSION_KEY = "prisma-estudos-local-session";
const PAGE_MODE = document.body.dataset.page || (
  window.location.pathname.startsWith("/login") ? "login" :
  window.location.pathname.startsWith("/app") ? "app" :
  "combined"
);
const APP_PATH = "/app/";
const LOGIN_PATH = "/login/";
const API_BASE = window.PRISMA_API_BASE || (
  window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:3001/api"
    : "https://backend-prisma-estudos-production.up.railway.app/api"
);

const today = new Date();
const isoToday = toISODate(today);
const editalCatalog = window.prismaEstudosCatalog || { contests: [], subjects: [], topics: [] };
const defaultContestIds = editalCatalog.contests.map((contest) => contest.id);
const defaultActiveContestId = defaultContestIds[1] || defaultContestIds[0] || "tecnico-judiciario-area-administrativa";
const analystContest = editalCatalog.contests.find((contest) => contest.id === "analista-judiciario-area-administrativa");
const technicianContest = editalCatalog.contests.find((contest) => contest.id === "tecnico-judiciario-area-administrativa");
const legacyContestIds = new Set(["trt-sp-tecnico", "trt-sp-analista"]);

const seedState = {
  currentUserId: null,
  users: [
    { id: "u-admin", name: "Marina Admin", email: "admin@prismaestudos.local", role: "admin", status: "active", accessExpiresAt: null },
    { id: "u-ana", name: "Ana Ribeiro", email: "ana@prismaestudos.local", role: "student", status: "active", accessExpiresAt: addDaysISO(30) },
    { id: "u-lucas", name: "Lucas Lima", email: "lucas@prismaestudos.local", role: "student", status: "active", accessExpiresAt: addDaysISO(7) }
  ],
  contests: [...editalCatalog.contests],
  profiles: {
    "u-ana": {
      studentName: "Ana Ribeiro",
      objective: "Aprovar em concurso de analista",
      context: "Concurso",
      dailyMinutes: 90,
      days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
      preferredTime: "19:00",
      interests: analystContest?.subjects || editalCatalog.contests[0]?.subjects || ["s-mat", "s-por", "s-dir"],
      contests: [...defaultContestIds],
      activeContestId: analystContest?.id || defaultActiveContestId,
      level: "intermediario",
      reviewPreference: "semanal",
      topicsPerDay: 2,
      mixSubjects: true,
      configured: false,
      onboardingCompleted: false
    },
    "u-lucas": {
      studentName: "Lucas Lima",
      objective: "Vestibular",
      context: "Prova",
      dailyMinutes: 60,
      days: ["Seg", "Qua", "Sex"],
      preferredTime: "07:00",
      interests: technicianContest?.subjects || ["s-mat", "s-his"],
      contests: [...defaultContestIds],
      activeContestId: technicianContest?.id || defaultActiveContestId,
      level: "iniciante",
      reviewPreference: "a cada 2 dias",
      topicsPerDay: 1,
      mixSubjects: false
    }
  },
  subjects: [
    ...editalCatalog.subjects,
    { id: "s-mat", name: "Matemática", color: "#22d3ee", isBase: true, ownerId: null },
    { id: "s-por", name: "Português", color: "#8b5cf6", isBase: true, ownerId: null },
    { id: "s-dir", name: "Direito Constitucional", color: "#69a7ff", isBase: true, ownerId: null },
    { id: "s-his", name: "História", color: "#38bdf8", isBase: true, ownerId: null },
    { id: "s-ana-red", name: "Redação Estratégica", color: "#ff7a90", isBase: false, ownerId: "u-ana" }
  ],
  topics: [
    ...editalCatalog.topics,
    { id: "t-mat-1", subjectId: "s-mat", title: "Razão e proporção", order: 1, suggestedMinutes: 45, isBase: true, ownerId: null },
    { id: "t-mat-2", subjectId: "s-mat", title: "Porcentagem aplicada", order: 2, suggestedMinutes: 50, isBase: true, ownerId: null },
    { id: "t-mat-3", subjectId: "s-mat", title: "Equações do primeiro grau", order: 3, suggestedMinutes: 55, isBase: true, ownerId: null },
    { id: "t-por-1", subjectId: "s-por", title: "Interpretação de texto", order: 1, suggestedMinutes: 40, isBase: true, ownerId: null },
    { id: "t-por-2", subjectId: "s-por", title: "Classes de palavras", order: 2, suggestedMinutes: 45, isBase: true, ownerId: null },
    { id: "t-por-3", subjectId: "s-por", title: "Pontuação", order: 3, suggestedMinutes: 35, isBase: true, ownerId: null },
    { id: "t-dir-1", subjectId: "s-dir", title: "Princípios fundamentais", order: 1, suggestedMinutes: 50, isBase: true, ownerId: null },
    { id: "t-dir-2", subjectId: "s-dir", title: "Direitos e garantias fundamentais", order: 2, suggestedMinutes: 60, isBase: true, ownerId: null },
    { id: "t-his-1", subjectId: "s-his", title: "Brasil Colônia", order: 1, suggestedMinutes: 45, isBase: true, ownerId: null },
    { id: "t-red-1", subjectId: "s-ana-red", title: "Estrutura da dissertação", order: 1, suggestedMinutes: 40, isBase: false, ownerId: "u-ana" }
  ],
  userSubjects: {
    "u-ana": [...(analystContest?.subjects || editalCatalog.contests[0]?.subjects || []), "s-ana-red"],
    "u-lucas": technicianContest?.subjects || ["s-mat", "s-his"]
  },
  userTopics: {
    "u-ana": {
      "t-mat-1": { status: "concluido", progress: 100, unlocked: true, completedAt: daysAgo(5) },
      "t-mat-2": { status: "em-andamento", progress: 35, unlocked: true, completedAt: null },
      "t-mat-3": { status: "pendente", progress: 0, unlocked: false, completedAt: null },
      "t-por-1": { status: "concluido", progress: 100, unlocked: true, completedAt: daysAgo(2) },
      "t-por-2": { status: "pendente", progress: 0, unlocked: true, completedAt: null },
      "t-por-3": { status: "pendente", progress: 0, unlocked: false, completedAt: null },
      "t-dir-1": { status: "pendente", progress: 0, unlocked: true, completedAt: null },
      "t-dir-2": { status: "pendente", progress: 0, unlocked: false, completedAt: null },
      "t-red-1": { status: "pendente", progress: 0, unlocked: true, completedAt: null }
    },
    "u-lucas": {
      "t-mat-1": { status: "concluido", progress: 100, unlocked: true, completedAt: daysAgo(1) },
      "t-mat-2": { status: "pendente", progress: 0, unlocked: true, completedAt: null },
      "t-his-1": { status: "pendente", progress: 0, unlocked: true, completedAt: null }
    }
  },
  sessions: [
    { id: "ss-1", userId: "u-ana", subjectId: "s-mat", topicId: "t-mat-1", date: daysAgo(5), plannedMinutes: 45, studiedMinutes: 45, result: "concluido" },
    { id: "ss-2", userId: "u-ana", subjectId: "s-por", topicId: "t-por-1", date: daysAgo(2), plannedMinutes: 40, studiedMinutes: 42, result: "concluido" },
    { id: "ss-3", userId: "u-ana", subjectId: "s-mat", topicId: "t-mat-2", date: isoToday, plannedMinutes: 50, studiedMinutes: 20, result: "parcial" },
    { id: "ss-4", userId: "u-lucas", subjectId: "s-mat", topicId: "t-mat-1", date: daysAgo(1), plannedMinutes: 45, studiedMinutes: 45, result: "concluido" }
  ],
  reviews: [
    { id: "r-1", userId: "u-ana", subjectId: "s-mat", topicId: "t-mat-1", originalDate: daysAgo(5), dueDate: isoToday, count: 1, status: "pendente" },
    { id: "r-2", userId: "u-ana", subjectId: "s-por", topicId: "t-por-1", originalDate: daysAgo(2), dueDate: addDaysISO(1), count: 0, status: "pendente" },
    { id: "r-3", userId: "u-lucas", subjectId: "s-mat", topicId: "t-mat-1", originalDate: daysAgo(1), dueDate: isoToday, count: 0, status: "pendente" }
  ],
  dailyEnergy: {},
  themes: {
    "u-ana": { mode: "dark", primary: "#22d3ee", secondary: "#8b5cf6", cardStyle: "soft", banner: "assets/prisma-estudos-logo.png", density: "normal" },
    "u-lucas": { mode: "dark", primary: "#38bdf8", secondary: "#6366f1", cardStyle: "solid", banner: "assets/prisma-estudos-logo.png", density: "compact" }
  },
  route: "dashboard"
};

let state = loadState();
let timer = null;
let activeTimerState = null;
let focusAudio = null;
let hasRemoteSession = false;
let saveTimer = null;
let studyReviews = [];
let studyReviewsLoaded = false;
let finishStudySnapshots = {};
let userPreferences = {
  theme: "dark",
  accentColor: "blue",
  studyGoal: "",
  dailyStudyMinutes: 60,
  preferredSubjects: [],
  notificationsEnabled: true,
  soundEnabled: true,
  layoutMode: "default"
};

const pageTitles = {
  dashboard: "Seu Plano Hoje",
  schedule: "Cronograma Interativo",
  subjects: "Matérias e Tópicos",
  reviews: "Revisões",
  history: "Histórico de Estudos",
  motivation: "Frases Motivacionais",
  profile: "Meu Perfil de Estudos",
  customize: "Personalizar App",
  admin: "Administração"
};

const navItems = [
  ["dashboard", "layout-dashboard", "Plano Hoje"],
  ["schedule", "calendar-days", "Cronograma"],
  ["subjects", "book-open", pageTitles.subjects],
  ["reviews", "refresh-cw", pageTitles.reviews],
  ["history", "history", pageTitles.history],
  ["motivation", "sparkles", pageTitles.motivation],
  ["profile", "user-round", pageTitles.profile],
  ["customize", "palette", pageTitles.customize],
  ["admin", "shield-check", pageTitles.admin],
  ["logout", "log-out", "Sair"]
];

const motivationalPhrases = [
  "Pare de planejar. Comece a executar.",
  "A aprovação é construída em blocos pequenos, repetidos todos os dias.",
  "Hoje você só precisa vencer o próximo tópico.",
  "Constância vale mais que intensidade sem direção.",
  "O estudo de hoje é uma versão futura sua agradecendo em silêncio.",
  "Não espere motivação perfeita. Comece e deixe o ritmo aparecer.",
  "Cada revisão feita diminui a distância entre você e a aprovação.",
  "Você não precisa estudar tudo hoje. Precisa continuar.",
  "Disciplina é decidir uma vez e cumprir um pouco por dia.",
  "O edital parece grande até você transformar tudo em pequenas ações.",
  "Seu foco não precisa ser perfeito, só precisa voltar.",
  "Um dia bem executado muda a semana inteira.",
  "A melhor estratégia é aquela que você consegue repetir.",
  "Você está mais perto quando para de negociar com o próprio plano.",
  "Faça o simples bem feito. Amanhã o sistema recalcula o próximo passo.",
  "A aprovação não cobra pressa. Cobra continuidade.",
  "Hoje é dia de executar, não de carregar o peso do edital inteiro.",
  "Quando cansar, reduza a carga. Só não solte a direção.",
  "O progresso fica visível depois que você aceita os dias pequenos.",
  "Estudar com clareza é tirar decisões do caminho.",
  "Você não está começando do zero. Está somando mais um bloco.",
  "A revisão de hoje protege o esforço de ontem.",
  "O seu concorrente real é a versão que desiste antes de abrir o app.",
  "Faça uma ação principal. Depois decida a próxima.",
  "Todo avanço conta, principalmente nos dias em que parecia pouco."
];

const themePresets = {
  dark: {
    label: "Prisma Escuro",
    bg: "#050b14",
    panel: "#0b1628",
    panel2: "#0f2037",
    card: "#101c31",
    cardSoft: "#172640",
    text: "#f5f8ff",
    muted: "#9fb0cc",
    line: "rgba(148, 163, 184, 0.16)",
    primary: "#22d3ee",
    secondary: "#8b5cf6",
    danger: "#ff6b6b",
    success: "#2dd4bf",
    warning: "#a78bfa"
  },
  light: {
    label: "Claro Premium",
    bg: "#f4f7fb",
    panel: "#ffffff",
    panel2: "#eef4f8",
    card: "#ffffff",
    cardSoft: "#eaf1f7",
    text: "#13202b",
    muted: "#5d7180",
    line: "rgba(19, 32, 43, 0.13)",
    primary: "#2563eb",
    secondary: "#7c3aed",
    danger: "#dc2626",
    success: "#0891b2",
    warning: "#7c3aed"
  },
  purple: {
    label: "Prisma Violeta",
    bg: "#080817",
    panel: "#12132a",
    panel2: "#191a3a",
    card: "#171831",
    cardSoft: "#22234a",
    text: "#f5f0ff",
    muted: "#a99ac5",
    line: "rgba(205, 190, 255, 0.13)",
    primary: "#8b35f5",
    secondary: "#22d3ee",
    danger: "#fb7185",
    success: "#38bdf8",
    warning: "#a78bfa"
  },
  blue: {
    label: "Azul Tecnológico",
    bg: "#07111f",
    panel: "#0f1c2f",
    panel2: "#152842",
    card: "#13233a",
    cardSoft: "#1d3557",
    text: "#eef7ff",
    muted: "#91a8bd",
    line: "rgba(148, 190, 255, 0.13)",
    primary: "#38bdf8",
    secondary: "#6366f1",
    danger: "#f87171",
    success: "#2dd4bf",
    warning: "#a78bfa"
  }
};

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", async () => {
  localStorage.removeItem("prisma-estudos-token");
  bindLogin();
  const hasLocalSession = localStorage.getItem(LOCAL_SESSION_KEY) === "true";

  if (PAGE_MODE === "login") {
    if (state.currentUserId && !hasLocalSession) {
      await syncStateFromApi();
    }
    if (state.currentUserId) {
      window.location.replace(APP_PATH);
    }
    return;
  }

  if (PAGE_MODE === "app") {
    if (state.currentUserId && !hasLocalSession) {
      await syncStateFromApi();
    }
    if (state.currentUserId) {
      enterApp();
    } else {
      window.location.replace(LOGIN_PATH);
    }
    return;
  }

  if (state.currentUserId && !hasLocalSession) {
    await syncStateFromApi();
  }
  if (state.currentUserId) enterApp();
});

function bindLogin() {
  $("#login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitLogin();
  });

  $("#toggle-password")?.addEventListener("click", () => {
    const input = $("#login-password");
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    $("#toggle-password").textContent = isPassword ? "Ocultar" : "Mostrar";
    $("#toggle-password").setAttribute("aria-label", isPassword ? "Ocultar senha" : "Mostrar senha");
  });

  $("#menu-toggle")?.addEventListener("click", () => $(".sidebar").classList.toggle("open"));
  $("#notification-button")?.addEventListener("click", renderNotifications);
}

async function submitLogin() {
  const button = $("#login-submit");
  const message = $("#login-message");
  button.disabled = true;
  button.textContent = "Entrando...";
  message.className = "login-message is-loading";
  message.textContent = "Validando acesso ao Prisma Estudos...";
  const result = await login($("#login-email").value, $("#login-password").value);
  if (result !== true && !$("#login-screen").classList.contains("hidden")) {
    button.disabled = false;
    button.textContent = "Entrar no Prisma Estudos";
    message.className = "login-message is-error";
    message.textContent = typeof result === "string"
      ? result
      : "Login ou senha incorretos. Verifique os dados e tente novamente.";
  }
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return mergeSeedCatalog(structuredClone(seedState));
  try {
    return mergeSeedCatalog({ ...structuredClone(seedState), ...JSON.parse(saved) });
  } catch {
    return mergeSeedCatalog(structuredClone(seedState));
  }
}

function mergeSeedCatalog(source) {
  const merged = {
    ...structuredClone(seedState),
    ...source
  };
  const sourceContests = (source.contests || []).filter((contest) => !legacyContestIds.has(contest.id));
  merged.contests = mergeById(sourceContests, seedState.contests);
  merged.subjects = mergeById(source.subjects || [], seedState.subjects);
  merged.topics = mergeById(source.topics || [], seedState.topics);
  merged.users = (merged.users || []).map(({ password, passwordHash, password_hash, ...user }) => user);
  Object.keys(merged.profiles || {}).forEach((userId) => {
    const profile = merged.profiles[userId] || {};
    const profileContests = (profile.contests?.length ? profile.contests : []).filter((contestId) => !legacyContestIds.has(contestId));
    profile.contests = unique([...profileContests, ...defaultContestIds]);
    if (!profile.activeContestId || !merged.contests.some((contest) => contest.id === profile.activeContestId)) {
      profile.activeContestId = profile.contests.find((contestId) => defaultContestIds.includes(contestId)) || defaultActiveContestId;
    }
    const activeContest = merged.contests.find((contest) => contest.id === profile.activeContestId);
    if (activeContest?.subjects?.length) {
      merged.userSubjects ||= {};
      merged.userSubjects[userId] = unique([...(merged.userSubjects[userId] || []), ...activeContest.subjects]);
      profile.interests = unique([...(profile.interests || []), ...activeContest.subjects]);
    }
    const ownSubjectIds = (merged.subjects || [])
      .filter((subject) => subject.ownerId === userId && !subject.isBase)
      .map((subject) => subject.id);
    profile.extraInterests = unique([...(profile.extraInterests || []), ...ownSubjectIds]);
    profile.interests = unique([...(profile.interests || []), ...ownSubjectIds]);
    merged.userSubjects ||= {};
    merged.userSubjects[userId] = unique([...(merged.userSubjects[userId] || []), ...ownSubjectIds]);
    merged.profiles[userId] = profile;
  });
  return merged;
}

function mergeById(seedItems, sourceItems) {
  const map = new Map();
  [...seedItems, ...sourceItems].forEach((item) => {
    if (item?.id) map.set(item.id, item);
  });
  return [...map.values()];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueRemoteSave();
}

async function saveStateNow() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!hasRemoteSession) return;
  clearTimeout(saveTimer);
  try {
    const response = await fetch(`${API_BASE}/state`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ state })
    });
    if (!response.ok) throw new Error("Save failed");
    const data = await response.json();
    const route = state.route;
    const localState = state;
    state = preserveLocalUiState(normalizeRemoteState(data.state), localState);
    state.route = route;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast("Backend indisponivel. Alteracoes mantidas localmente.");
  }
}

async function login(email, password) {
  return loginWithApi(email, password);
}

async function loginWithApi(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message = data.message || "Login ou senha inválidos.";
      if (PAGE_MODE !== "login") showToast(message);
      return message;
    }
    const data = await response.json();
    hasRemoteSession = true;
    localStorage.removeItem(LOCAL_SESSION_KEY);
    const localState = state;
    state = preserveLocalUiState(normalizeRemoteState(data.state), localState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (PAGE_MODE === "login") {
      window.location.assign(APP_PATH);
      return true;
    }
    enterApp();
    return true;
  } catch {
    return "Nao foi possivel conectar ao Prisma Estudos agora. Tente novamente em instantes.";
  }
}

async function syncStateFromApi() {
  try {
    const response = await fetch(`${API_BASE}/state`, {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Invalid session");
    const data = await response.json();
    const route = state.route;
    const localState = state;
    state = preserveLocalUiState(normalizeRemoteState(data.state), localState);
    state.route = route || state.route;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    hasRemoteSession = true;
  } catch {
    hasRemoteSession = false;
    state.currentUserId = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function queueRemoteSave() {
  if (!hasRemoteSession) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const response = await fetch(`${API_BASE}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ state })
      });
      if (!response.ok) throw new Error("Save failed");
      const data = await response.json();
      const route = state.route;
      const localState = state;
      state = preserveLocalUiState(normalizeRemoteState(data.state), localState);
      state.route = route;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      showToast("Backend indisponível. Alterações mantidas localmente.");
    }
  }, 450);
}

// ── User Preferences API helpers ──────────────────────────────────────────────

async function loadUserPreferences() {
  if (!hasRemoteSession) return;
  try {
    const response = await fetch(`${API_BASE}/preferences`, { credentials: "include" });
    if (!response.ok) return;
    const data = await response.json();
    if (data.preferences) userPreferences = { ...userPreferences, ...data.preferences };
  } catch {
    // silently keep defaults
  }
}

async function saveUserPreferences(data) {
  const r = await fetch(`${API_BASE}/preferences`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).message) || "Erro ao salvar preferências.");
  const result = await r.json();
  if (result.preferences) userPreferences = { ...userPreferences, ...result.preferences };
  return userPreferences;
}

function applyUserPreferences() {
  const { layoutMode, notificationsEnabled, soundEnabled } = userPreferences;
  document.body.classList.toggle("density-compact", layoutMode === "compact");
  document.body.classList.toggle("density-comfortable", layoutMode === "comfortable");
  if (layoutMode === "default") {
    document.body.classList.remove("density-compact", "density-comfortable");
  }
  applyUserPreferences._notificationsEnabled = notificationsEnabled !== false;
  applyUserPreferences._soundEnabled = soundEnabled !== false;
}

// ── Study Reviews API helpers ─────────────────────────────────────────────────

async function loadStudyReviews() {
  if (!hasRemoteSession) return;
  try {
    const response = await fetch(`${API_BASE}/reviews`, { credentials: "include" });
    if (!response.ok) return;
    studyReviews = (await response.json()).reviews || [];
  } catch {
    // silently keep existing data
  }
  studyReviewsLoaded = true;
}

async function apiCreateReview(data) {
  const r = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).message) || "Erro ao criar revisão.");
  return (await r.json()).review;
}

async function apiUpdateReview(id, data) {
  const r = await fetch(`${API_BASE}/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).message) || "Erro ao atualizar revisão.");
  return (await r.json()).review;
}

async function apiDeleteReview(id) {
  const r = await fetch(`${API_BASE}/reviews/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).message) || "Erro ao apagar revisão.");
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────

function normalizeRemoteState(remoteState) {
  const normalized = mergeSeedCatalog({
    ...remoteState,
    route: remoteState.route || "dashboard"
  });
  Object.keys(normalized.profiles || {}).forEach((userId) => {
    normalized.profiles[userId] = {
      contests: [...defaultContestIds],
      activeContestId: defaultActiveContestId,
      extraInterests: [],
      configured: false,
      ...normalized.profiles[userId]
    };
  });
  return normalized;
}

function preserveLocalUiState(remoteState, localState) {
  const userId = localState.currentUserId;
  return {
    ...remoteState,
    profiles: mergeLocalProfileState(remoteState.profiles, localState.profiles, userId),
    subjects: mergeOwnedSubjects(remoteState.subjects, localState.subjects, userId),
    topics: mergeOwnedTopics(remoteState.topics, localState.topics, localState.subjects, userId),
    userSubjects: mergeLocalUserSubjects(remoteState.userSubjects, localState.userSubjects, userId),
    userTopics: mergeTopicChecklistState(remoteState.userTopics, localState.userTopics),
    themes: localState.themes,
    dailyEnergy: localState.dailyEnergy,
    energyPromptOpen: localState.energyPromptOpen,
    activeTimers: localState.activeTimers,
    syllabusActiveSubjectId: localState.syllabusActiveSubjectId
  };
}

function mergeLocalProfileState(remoteProfiles = {}, localProfiles = {}, userId) {
  if (!userId || !localProfiles?.[userId]) return remoteProfiles;
  const remoteProfile = remoteProfiles?.[userId] || {};
  const localProfile = localProfiles[userId] || {};
  return {
    ...remoteProfiles,
    [userId]: {
      ...remoteProfile,
      extraInterests: unique([...(remoteProfile.extraInterests || []), ...(localProfile.extraInterests || [])]),
      interests: unique([...(remoteProfile.interests || []), ...(localProfile.interests || [])])
    }
  };
}

function mergeOwnedSubjects(remoteSubjects = [], localSubjects = [], userId) {
  if (!userId) return remoteSubjects || [];
  return mergeById(remoteSubjects || [], (localSubjects || []).filter((subject) => subject.ownerId === userId));
}

function mergeOwnedTopics(remoteTopics = [], localTopics = [], localSubjects = [], userId) {
  if (!userId) return remoteTopics || [];
  const localOwnedSubjectIds = new Set((localSubjects || []).filter((subject) => subject.ownerId === userId).map((subject) => subject.id));
  const ownedTopics = (localTopics || []).filter((topic) => topic.ownerId === userId || localOwnedSubjectIds.has(topic.subjectId));
  return mergeById(remoteTopics || [], ownedTopics);
}

function mergeLocalUserSubjects(remoteUserSubjects = {}, localUserSubjects = {}, userId) {
  if (!userId) return remoteUserSubjects || {};
  return {
    ...remoteUserSubjects,
    [userId]: unique([...(remoteUserSubjects?.[userId] || []), ...(localUserSubjects?.[userId] || [])])
  };
}

function mergeTopicChecklistState(remoteTopics = {}, localTopics = {}) {
  const merged = structuredClone(remoteTopics || {});
  Object.entries(localTopics || {}).forEach(([userId, topics]) => {
    Object.entries(topics || {}).forEach(([topicId, localTopic]) => {
      if (!localTopic) return;
      merged[userId] ||= {};
      merged[userId][topicId] ||= {};
      ["theoryRead", "summaryDone", "exercisesDone"].forEach((field) => {
        if (localTopic[field] !== undefined) {
          merged[userId][topicId][field] = localTopic[field];
        }
      });
    });
  });
  return merged;
}

function enterApp() {
  const user = currentUser();
  $("#login-screen").classList.add("hidden");
  $("#app-shell").classList.remove("hidden");
  $("#user-name").textContent = user.name;
  $("#user-email").textContent = user.email;
  $("#user-avatar").textContent = initials(user.name);
  $("#user-role-label").textContent = user.role === "admin" ? "Administrador" : "Estudante";
  $("#today-label").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(today);
  applyTheme();
  loadUserPreferences().then(applyUserPreferences).catch(() => {});
  renderNav();
  render();
  setTimeout(showDailyMotivation, 650);
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId);
}

function isAdmin() {
  return currentUser()?.role === "admin";
}

function studentId() {
  return isAdmin() ? "u-ana" : state.currentUserId;
}

function renderNav() {
  const nav = $("#sidebar-nav");
  nav.innerHTML = "";
  const locked = requiresProfileSetup();
  navItems.forEach(([route, icon, label]) => {
    if (route === "admin" && !isAdmin()) return;
    if (locked && !["profile", "logout"].includes(route)) return;
    const button = document.createElement("button");
    button.className = `nav-item ${state.route === route ? "active" : ""} ${route === "logout" ? "nav-item-logout" : ""}`;
    button.type = "button";
    button.innerHTML = `<span class="nav-icon">${iconSvg(icon)}</span><span>${label}</span>`;
    button.addEventListener("click", () => {
      if (route === "logout") {
        fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
        state.currentUserId = null;
        hasRemoteSession = false;
        localStorage.removeItem(LOCAL_SESSION_KEY);
        saveState();
        window.location.assign(LOGIN_PATH);
        return;
      }
      state.route = route;
      saveState();
      $(".sidebar").classList.remove("open");
      if (route === "reviews" && hasRemoteSession) {
        studyReviewsLoaded = false;
        loadStudyReviews().then(() => render());
      }
      render();
    });
    nav.appendChild(button);
  });
}

function iconSvg(name) {
  const icons = {
    "layout-dashboard": '<path d="M3 3h8v8H3z"/><path d="M13 3h8v5h-8z"/><path d="M13 10h8v11h-8z"/><path d="M3 13h8v8H3z"/>',
    "calendar-days": '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    timer: '<path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/><path d="M18.4 7.6 20 6"/>',
    "book-open": '<path d="M12 7v14"/><path d="M3 18a2 2 0 0 1 2-2h7V5H5a2 2 0 0 0-2 2z"/><path d="M21 18a2 2 0 0 0-2-2h-7V5h7a2 2 0 0 1 2 2z"/>',
    "refresh-cw": '<path d="M21 12a9 9 0 0 1-15.6 6.1L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.6 5.9L21 8"/><path d="M21 3v5h-5"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    "user-round": '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2a10 10 0 0 0 0 20h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h3a7 7 0 0 0 0-14z"/>',
    sparkles: '<path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/><path d="m5 14 .9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9z"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',
    "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons["layout-dashboard"]}</svg>`;
}

function render() {
  $("#page-title").textContent = pageTitles[state.route] || "Prisma Estudos";
  renderNav();
  applyTheme();
  const root = $("#view-root");
  if (requiresProfileSetup()) {
    state.route = "profile";
    $("#page-title").textContent = "Configurar Perfil";
    root.innerHTML = "";
    root.appendChild(renderProfile(true));
    return;
  }
  const routeMap = {
    dashboard: renderDashboard,
    schedule: renderSchedule,
    subjects: renderSubjects,
    reviews: renderReviews,
    history: renderHistory,
    motivation: renderMotivationFeed,
    profile: renderProfile,
    customize: renderCustomize,
    admin: renderAdmin
  };
  root.innerHTML = "";
  root.appendChild(routeMap[state.route]?.() || renderDashboard());
  maybeShowWeeklyReview();
}

function requiresProfileSetup() {
  if (!state.currentUserId || isAdmin()) return false;
  return profileFor(state.currentUserId).configured !== true;
}

function contestsFor(id) {
  const profile = profileFor(id);
  const selected = profile.contests?.length ? profile.contests : state.contests?.map((contest) => contest.id) || [];
  return (state.contests || []).filter((contest) => selected.includes(contest.id));
}

function activeContestFor(id) {
  const profile = profileFor(id);
  const contests = contestsFor(id);
  return contests.find((contest) => contest.id === profile.activeContestId) || contests[0] || state.contests?.[0];
}

function setActiveContest(id, contestId) {
  const profile = profileFor(id);
  profile.activeContestId = contestId;
  const contest = contestById(contestId);
  if (contest?.subjects?.length) {
    profile.interests = unique([...contest.subjects, ...(profile.extraInterests || [])]);
    state.userSubjects[id] = profile.interests;
    initializeUserTopics(id);
  }
  state.route = "schedule";
  saveState();
  render();
}

function contestById(id) {
  return (state.contests || []).find((contest) => contest.id === id);
}

function contestSubjectsFor(id, contest) {
  const subjectIds = new Set([...(contest?.subjects || []), ...(profileFor(id).extraInterests || [])]);
  return dedupeSubjectsByName(
    availableSubjects(id).filter((subject) => subjectIds.size === 0 || subjectIds.has(subject.id) || subject.ownerId === id)
  );
}

function contestProgress(id, contest = activeContestFor(id)) {
  const subjects = contestSubjectsFor(id, contest);
  const topicIds = new Set(subjects.flatMap((subject) => topicsForSubject(subject.id).map((topic) => topic.id)));
  const topics = [...topicIds].map(topicById).filter(Boolean);
  const completed = topics.filter((topic) => state.userTopics[id]?.[topic.id]?.status === "concluido").length;
  const total = topics.length || 1;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

function reviewBuckets(id) {
  const reviews = reviewsFor(id).filter((review) => review.status === "pendente").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return {
    overdue: reviews.filter((review) => review.dueDate < isoToday),
    today: reviews.filter((review) => review.dueDate === isoToday),
    upcoming: reviews.filter((review) => review.dueDate > isoToday)
  };
}

function adaptiveInsights(id) {
  const stats = getStats(id);
  const buckets = reviewBuckets(id);
  const weak = weakSubjects(id)[0];
  const strong = strongSubjects(id)[0];
  const comparison = weeklyComparison(id);
  const recovery = recoveryPlan(id);
  const insights = [];
  if (recovery.active) insights.push(recovery.message);
  if (comparison.minutes.deltaPct !== null) insights.push(comparison.minutes.deltaPct >= 0 ? `Você estudou ${comparison.minutes.deltaPct}% mais que na semana anterior.` : `Você estudou ${Math.abs(comparison.minutes.deltaPct)}% menos que na semana anterior. Vamos retomar com leveza.`);
  if (buckets.overdue.length) insights.push(`Reorganizei ${buckets.overdue.length} revisão(ões) atrasada(s) como prioridade de hoje.`);
  if (weak) insights.push(`Reforce ${weak.name}: é a matéria que mais merece atenção agora.`);
  if (strong) insights.push(`${strong.name} está consistente. Mantenha o ritmo sem gastar energia decidindo.`);
  if (stats.streak >= 3) insights.push(`Você manteve constância por ${stats.streak} dias seguidos.`);
  if (!stats.todayMinutes) insights.push("Comece pelo estudo do dia. O sistema já escolheu a próxima ação.");
  if (stats.weekMinutes > 240) insights.push("Semana forte: considere pausas curtas entre blocos para sustentar desempenho.");
  return insights.slice(0, 4);
}

function renderDashboard() {
  const id = studentId();
  const stats = getStats(id);
  const contests = contestsFor(id);
  const study = nextStudy(id);
  const buckets = reviewBuckets(id);
  const insights = adaptiveInsights(id);
  const comparison = weeklyComparison(id);
  const recovery = recoveryPlan(id);
  return htmlElement(`
    <div>
      <section class="plan-hero">
        <div>
          <span class="eyebrow">${new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(today)}</span>
          <h1>Seu Plano Hoje</h1>
          <p>Olá, ${currentUser().name.split(" ")[0]}. Seu plano está organizado para você estudar com clareza, foco e constância.</p>
          <div class="hero-summary">
            <span>${formatMinutes(stats.todayMinutes)} hoje</span>
            <span>${buckets.today.length} revisões</span>
            <span>${stats.streak} dias de sequência</span>
          </div>
        </div>
        <div class="today-focus">
          <span class="tag">Próxima ação</span>
          <strong>${study ? subjectById(study.subjectId).name : "Nenhum tópico pendente"}</strong>
          <small>${study ? study.title : "Você está em dia com o plano atual."}</small>
          ${study ? `<div class="progress-track"><div class="progress-fill" style="--value:${study.progress}%"></div></div>` : ""}
          ${study ? `<button class="primary-button" data-action="start-study" data-topic="${study.id}">${iconSvg("calendar-days")} Iniciar agora</button>` : ""}
        </div>
      </section>

      <section class="contest-grid">
        ${contests.map((contest) => contestCard(id, contest)).join("")}
      </section>

      <section class="grid cols-4 dashboard-metrics">
        ${metric("Tempo hoje", formatMinutes(stats.todayMinutes), "Blocos concluídos no dia")}
        ${metric("Sequência", `${stats.streak} dias`, "Constância atual")}
        ${metric("Revisões pendentes", buckets.today.length + buckets.overdue.length, "Hoje e atrasadas")}
        ${metric("Progresso semanal", `${contestProgress(id).percent}%`, "Edital concluído")}
      </section>

      <section class="grid cols-3 dashboard-metrics" style="margin-top:16px">
        ${metric("Revisões hoje", buckets.today.length)}
        ${metric("Revisões atrasadas", buckets.overdue.length)}
        ${metric("Desempenho geral", `${completionRateFor(id)}%`)}
      </section>

      <section class="grid" style="margin-top:16px">
        ${weeklyComparisonCard(comparison)}
      </section>

      ${recovery.active ? recoveryCard(recovery) : ""}

      <section class="grid cols-2" style="margin-top:16px">
        <div class="panel">
          <div class="panel-header"><div><h3>Inteligência adaptativa</h3><p>O sistema reorganiza prioridades para reduzir esforço mental</p></div></div>
          <div class="insight-list">${insights.map((item) => `<div class="notice">${item}</div>`).join("")}</div>
        </div>
        <div class="panel">
          <div class="panel-header"><div><h3>Matérias fortes e fracas</h3><p>Prioridade automática para o próximo bloco</p></div></div>
          ${strengthBoard(id)}
        </div>
      </section>

      <section class="panel" style="margin-top:16px">
        <div class="panel-header"><div><h3>Evolução semanal</h3><p>Minutos estudados nos últimos 7 dias</p></div><span class="tag">Matéria mais estudada: ${stats.topSubject}</span></div>
        ${barChart(stats.weekly, 90)}
      </section>

      <section class="panel" style="margin-top:16px">
        <div class="panel-header"><div><h3>Calendário De Constância</h3><p>Dias estudados, revisões e aproveitamento no mês.</p></div></div>
        ${calendar(id)}
      </section>
    </div>
  `, (root) => {
    bindScheduleActions(root);
  });
}

function contestCard(id, contest) {
  const progress = contestProgress(id, contest);
  const buckets = reviewBuckets(id);
  return `
    <article class="contest-card" style="--contest:${contest.accent}">
      <div class="contest-image-frame">
        <img src="${contest.image}" alt="${contest.name} ${contest.role}">
        <span>${contest.name}</span>
      </div>
      <div class="contest-card-body">
        <span class="tag">${contest.organ}</span>
        <h3>${contest.name}</h3>
        <p>${contest.role}</p>
        <div class="progress-track"><div class="progress-fill" style="--value:${progress.percent}%"></div></div>
        <dl class="mini-stats">
          <div><dt>Edital</dt><dd>${progress.percent}%</dd></div>
          <div><dt>Revisões</dt><dd>${buckets.today.length + buckets.overdue.length}</dd></div>
          <div><dt>Sequência</dt><dd>${getStats(id).streak}d</dd></div>
        </dl>
        <button class="primary-button" data-open-contest="${contest.id}">Abrir cronograma</button>
      </div>
    </article>
  `;
}

function weeklyComparisonCard(comparison) {
  return `
    <section class="panel comparison-card">
      <div class="panel-header"><div><h3>Você Contra Você</h3><p>${comparison.message}</p></div></div>
      <dl class="mini-stats">
        <div><dt>Minutos</dt><dd>${formatDelta(comparison.minutes.deltaPct, "%")}</dd></div>
        <div><dt>Dias</dt><dd>${formatDelta(comparison.days.delta, "d")}</dd></div>
        <div><dt>Revisões</dt><dd>${formatDelta(comparison.reviews.delta, "")}</dd></div>
      </dl>
      <p class="muted">${comparison.performanceMessage}</p>
    </section>
  `;
}

function recoveryCard(recovery) {
  return `
    <section class="panel recovery-card" style="margin-top:16px">
      <div class="panel-header"><div><h3>Plano De Recuperação</h3><p>${recovery.message}</p></div><span class="tag">Modo Recuperação</span></div>
      <div class="recovery-actions">
        ${recovery.actions.map((action) => `<div class="notice">${action}</div>`).join("")}
      </div>
    </section>
  `;
}

function phraseOfDay(id = studentId()) {
  const seed = Number(isoToday.replaceAll("-", ""));
  const stats = getStats(id);
  const buckets = reviewBuckets(id);
  if (buckets.overdue.length) return "Hoje é dia de retomar com leveza: faça as revisões primeiro e deixe o plano reorganizar o resto.";
  if (stats.streak >= 7) return `Você manteve constância por ${stats.streak} dias. Proteja esse ritmo com mais um bloco simples hoje.`;
  if (!stats.todayMinutes) return "Comece pelo primeiro bloco. O movimento vem depois do primeiro clique.";
  if (stats.todayMinutes >= 60) return "Você já abriu vantagem hoje. Agora mantenha o foco sem se cobrar perfeição.";
  return motivationalPhrases[seed % motivationalPhrases.length];
}

function renderMotivationFeed() {
  const dailyPhrase = phraseOfDay();
  const feedPhrases = motivationFeedPhrases(140);
  return htmlElement(`
    <div class="motivation-page">
      <section class="motivation-hero">
        <span class="eyebrow">Frase do dia</span>
        <h2>${dailyPhrase}</h2>
        <p>Role para baixo para avançar frase por frase, como um feed de foco.</p>
      </section>

      <section class="motivation-feed-shell">
        <div class="motivation-feed">
          ${feedPhrases.map((phrase, index) => `
            <article class="motivation-card ${phrase === dailyPhrase ? "active" : ""}" aria-label="Frase ${index + 1}">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <strong>${phrase}</strong>
              <small>Role para a próxima</small>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `);
}

function motivationFeedPhrases(count = 120) {
  const starts = [
    "Hoje, escolha o próximo bloco e execute.",
    "Quando a mente quiser complicar, volte ao plano.",
    "A aprovação gosta de rotina simples.",
    "Você não precisa vencer o edital inteiro agora.",
    "A revisão protege o esforço que você já fez.",
    "O foco volta quando você começa pequeno.",
    "Um tópico concluído é uma decisão a menos amanhã.",
    "Dias difíceis também contam quando você aparece.",
    "A clareza nasce de saber qual é a próxima ação.",
    "Seu ritmo é construído no acúmulo."
  ];
  const endings = [
    "Faça sem negociar.",
    "Deixe o sistema cuidar da ordem.",
    "Só avance o próximo passo.",
    "Respire, clique e continue.",
    "O resultado vem do retorno diário.",
    "Menos peso, mais execução.",
    "A constância vence a pressa.",
    "Hoje também é progresso.",
    "Você está treinando presença.",
    "Feito é melhor que perfeito."
  ];
  const phrases = [...motivationalPhrases];
  for (let index = 0; phrases.length < count; index += 1) {
    phrases.push(`${starts[index % starts.length]} ${endings[Math.floor(index / starts.length) % endings.length]}`);
  }
  return phrases;
}

function renderSchedule() {
  const id = studentId();
  const contest = activeContestFor(id);
  const progress = contestProgress(id, contest);
  const study = nextStudy(id);
  const buckets = reviewBuckets(id);
  const dueReviews = [...buckets.overdue, ...buckets.today];
  return htmlElement(`
    <div class="grid">
      <section class="schedule-header">
        <div>
          <span class="eyebrow">Cronograma inteligente</span>
          <h2>${contest?.name || "Plano de estudos"} · ${contest?.role || "Concurso"}</h2>
          <p>${contest?.organ || "O sistema escolhe a próxima ação e mantém sua continuidade."}</p>
        </div>
        <div class="score-ring" style="--score:${progress.percent}">
          <strong>${progress.percent}%</strong>
          <small>Edital concluído</small>
        </div>
      </section>

      <section class="daily-action-grid">
      <section class="daily-card daily-card-study">
        <div class="panel-header">
          <div><h3>Estudo do Dia</h3><p>${study ? "Você tem 1 sessão de estudo programada para hoje." : "Seu estudo principal está em dia."}</p></div>
          <span class="status-pill status-${study?.status || "pendente"}">${statusLabel(study?.status || "pendente")}</span>
        </div>
        ${study ? `
          <div class="study-focus-card">
            <div class="study-lines">
              <span class="tag">Próximo bloco</span>
              <div><small>${subjectById(study.subjectId).name}</small><strong>${study.title}</strong></div>
              <div class="study-quick-meta"><span>${study.suggestedMinutes} min</span><span>${study.progress}% concluído</span></div>
              <div class="progress-track"><div class="progress-fill" style="--value:${study.progress}%"></div></div>
            </div>
            <div class="actions">
              <button class="primary-button" data-action="start-study" data-topic="${study.id}">${iconSvg("timer")} Iniciar</button>
              <button class="ghost-button" data-action="finish-direct" data-topic="${study.id}">Marcar feito</button>
            </div>
          </div>
        ` : emptyState("Plano em dia", "Nenhum tópico pendente para as matérias selecionadas. Você pode revisar conteúdos ou manter o ritmo amanhã.", "calendar-days")}
      </section>

      <section class="daily-card daily-card-review">
        <div class="panel-header">
          <div><h3>Revisão do Dia</h3><p>Você tem ${dueReviews.length} revisão(ões) para fazer agora.</p></div>
          <span class="tag">${dueReviews.length} agora</span>
        </div>
        <div class="daily-review-list">
          ${dueReviews.length ? dueReviews.slice(0, 4).map(scheduleReviewItem).join("") : emptyState("Sem revisões", "Você pode focar no estudo principal.", "refresh-cw")}
          ${dueReviews.length > 4 ? `<button class="secondary-button" data-route="reviews">Visualizar todas as revisões</button>` : ""}
        </div>
      </section>
      </section>

      <section class="panel">
        <div class="panel-header"><div><h3>Recomendação adaptativa</h3><p>O sistema ajusta prioridades conforme constância, atrasos e desempenho</p></div></div>
        <div class="insight-list">${adaptiveInsights(id).map((item) => `<div class="notice">${item}</div>`).join("")}</div>
      </section>

      ${verticalizedSyllabus(id, contest)}
    </div>
  `, (root) => {
    bindScheduleActions(root);
    bindVerticalizedSyllabus(root, id);
  });
}

function verticalizedSyllabus(id, contest) {
  const subjects = contestSubjectsFor(id, contest);
  const groupedSubjects = [
    ["Conhecimentos Gerais", subjects.filter((subject) => subjectCategoryForContest(subject.id, contest) === "Conhecimentos Gerais")],
    ["Conhecimentos Específicos", subjects.filter((subject) => subjectCategoryForContest(subject.id, contest) === "Conhecimentos Específicos")],
    ["Matérias adicionadas", subjects.filter((subject) => !subjectCategoryForContest(subject.id, contest))]
  ].filter(([, items]) => items.length);
  const activeSubjectId = state.syllabusActiveSubjectId?.[id] && subjects.some((subject) => subject.id === state.syllabusActiveSubjectId[id])
    ? state.syllabusActiveSubjectId[id]
    : null;
  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Mapa Do Edital</h3><p>Escolha uma matéria e avance qualquer tópico sem perder registro, revisões ou histórico.</p></div>
      </div>
      <label class="syllabus-search">Pesquisar matéria
        <input id="syllabus-subject-search" type="search" placeholder="Digite o nome da matéria">
      </label>
      <div class="subject-picker syllabus-subject-picker">
        ${groupedSubjects.map(([label, items]) => `
          <div class="syllabus-category" data-syllabus-category="${label.toLowerCase()}">
            <div class="bucket-title"><span>${label}</span><strong>${items.length}</strong></div>
            ${items.map((subject) => {
              const progress = subjectProgress(id, subject.id);
              const isActive = subject.id === activeSubjectId;
              const topics = topicsForSubject(subject.id).sort((a, b) => a.order - b.order);
              return `
                <div class="subject-block" data-syllabus-subject-name="${`${label} ${subject.name}`.toLowerCase()}">
                  <button class="subject-card ${isActive ? "active" : ""}" data-syllabus-subject="${subject.id}">
                    <span class="tag">${label}</span>
                    <strong>${subject.name}</strong>
                    <small>${progress.completed}/${progress.total} tópicos concluídos</small><span class="chevron">›</span>
                  </button>
                  ${isActive ? syllabusTopicTable(id, topics) : ""}
                </div>
              `;
            }).join("")}
          </div>
        `).join("")}
      </div>
      ${subjects.length ? "" : `<p class="muted">Nenhuma matéria disponível neste edital.</p>`}
    </section>
  `;
}

function subjectCategoryForContest(subjectId, contest) {
  if (contest?.conhecimentosGerais?.includes(subjectId)) return "Conhecimentos Gerais";
  if (contest?.conhecimentosEspecificos?.includes(subjectId)) return "Conhecimentos Específicos";
  return null;
}

function syllabusTopicTable(id, topics) {
  return `
    <div class="syllabus-table-wrap">
      <table class="syllabus-table">
        <colgroup>
          <col class="syllabus-content-col">
          <col class="syllabus-action-col">
          <col class="syllabus-action-col">
          ${[1, 2, 3, 4, 5, 6].map(() => `<col class="syllabus-review-col">`).join("")}
          <col class="syllabus-score-col">
        </colgroup>
        <thead>
          <tr>
            <th rowspan="2">Conteúdo</th>
            <th rowspan="2">Iniciar</th>
            <th rowspan="2">Teoria</th>
            <th colspan="6">Revisões</th>
            <th rowspan="2">Aproveitamento</th>
          </tr>
          <tr>${[1, 2, 3, 4, 5, 6].map((item) => `<th class="review-number"><span>${item}ª</span></th>`).join("")}</tr>
        </thead>
        <tbody>
          ${topics.map((topic) => syllabusRow(id, topic)).join("") || `<tr><td colspan="10">Nenhum tópico nesta matéria.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function syllabusRow(id, topic) {
  ensureUserTopic(id, topic.id);
  const userTopic = state.userTopics[id][topic.id];
  const reviewsDone = reviewsFor(id).filter((review) => review.topicId === topic.id && review.status !== "pendente").length;
  return `
    <tr>
      <td><strong>${topic.title}</strong></td>
      <td><button class="icon-button syllabus-start-button" data-action="start-study" data-topic="${topic.id}" title="Iniciar estudo">${iconSvg("timer")}</button></td>
      <td class="theory-cell"><button class="mini-check ${userTopic.theoryRead ? "done" : ""}" data-syllabus-field="theoryRead" data-topic="${topic.id}" aria-label="Teoria lida"></button></td>
      ${[1, 2, 3, 4, 5, 6].map((item) => `<td class="review-cell"><span class="mini-check ${reviewsDone >= item ? "done" : ""}"></span></td>`).join("")}
      <td><span class="status-pill status-${userTopic.status}">${topicChecklistProgress(userTopic)}%</span></td>
    </tr>
  `;
}

function bindVerticalizedSyllabus(root, id) {
  root.querySelector("#syllabus-subject-search")?.addEventListener("input", (event) => {
    const term = event.target.value.trim().toLowerCase();
    root.querySelectorAll("[data-syllabus-subject-name]").forEach((block) => {
      block.classList.toggle("hidden", term && !block.dataset.syllabusSubjectName.includes(term));
    });
  });
  root.querySelectorAll("[data-syllabus-subject]").forEach((button) => {
    button.addEventListener("click", () => {
      state.syllabusActiveSubjectId ||= {};
      state.syllabusActiveSubjectId[id] = state.syllabusActiveSubjectId[id] === button.dataset.syllabusSubject ? null : button.dataset.syllabusSubject;
      saveState();
      render();
    });
  });
  root.querySelectorAll("[data-syllabus-field]").forEach((button) => {
    button.addEventListener("click", () => toggleTopicField(id, button.dataset.topic, button.dataset.syllabusField, button));
  });
}

function reviewBucketSection(label, reviews, emptyMessage = "Nada por aqui.") {
  return `
    <div>
      <div class="bucket-title"><span>${label}</span><strong>${reviews.length}</strong></div>
      <div class="grid">${reviews.length ? reviews.map(reviewCard).join("") : emptyState("Sem revisões", emptyMessage, "refresh-cw")}</div>
    </div>
  `;
}

function scheduleReviewItem(review) {
  const isNewStyle = Boolean(review.title);
  const subjectName = isNewStyle ? review.subject : (subjectById(review.subjectId)?.name || "Revisão");
  const topicTitle = isNewStyle ? (review.topic || review.title) : (topicById(review.topicId)?.title || "Tópico");
  const canRestart = !isNewStyle && review.topicId;
  return `
    <article class="daily-review-item">
      <div>
        <strong>${topicTitle}</strong>
        <small>${subjectName}</small>
      </div>
      <div class="actions">
        ${canRestart ? `<button class="secondary-button" data-start-review="${review.id}">${iconSvg("refresh-cw")} Revisar</button>` : ""}
        <button class="primary-button" data-done-review="${review.id}">${iconSvg("shield-check")} Feita</button>
      </div>
    </article>
  `;
}

function bindScheduleActions(root) {
  root.querySelectorAll("[data-open-contest]").forEach((button) => {
    button.addEventListener("click", () => setActiveContest(studentId(), button.dataset.openContest));
  });
  root.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = button.dataset.route;
      saveState();
      render();
    });
  });
  root.querySelectorAll("[data-action='start-study']").forEach((button) => {
    button.addEventListener("click", () => openTimer(button.dataset.topic, false));
  });
  root.querySelectorAll("[data-action='finish-direct']").forEach((button) => {
    button.addEventListener("click", () => openFinishStudy(button.dataset.topic, 0));
  });
  bindReviewButtons(root);
}

function renderSubjects() {
  const id = studentId();
  const subjects = visibleSubjects(id);
  const activeSubjectId = state.subjectsActiveSubjectId?.[id] && subjects.some((subject) => subject.id === state.subjectsActiveSubjectId[id])
    ? state.subjectsActiveSubjectId[id]
    : null;
  const selectedTopics = new Set(Object.entries(state.userTopics[id] || {}).filter(([, value]) => value.unlocked !== false).map(([topicId]) => topicId));
  return htmlElement(`
    <div class="grid">
      <section class="panel">
        <div class="panel-header">
          <div><h3>Matérias E Tópicos</h3><p>Escolha uma matéria, pesquise e selecione os tópicos que entram no seu plano.</p></div>
          <button class="primary-button" id="add-subject">Nova matéria própria</button>
        </div>
        <label>Filtrar matéria<input id="subject-search" type="search" placeholder="Digite o nome da matéria"></label>

        <div class="subject-picker">
          ${subjects.map((subject) => {
            const progress = subjectProgress(id, subject.id);
            const isActive = subject.id === activeSubjectId;
            const subjectTopics = topicsForSubject(subject.id).sort((a, b) => a.order - b.order);
            return `
              <div class="subject-block" data-subject-name="${subject.name.toLowerCase()}">
                <button class="subject-card ${isActive ? "active" : ""}" data-select-subject="${subject.id}">
                  <span class="tag">${subject.isBase ? "Base Global" : "Própria"}</span>
                  <strong>${subject.name}</strong>
                  <small>${progress.completed}/${progress.total} tópicos concluídos</small><span class="chevron">›</span>
                </button>
                ${isActive ? topicSelector(subject, subjectTopics, selectedTopics, id) : ""}
              </div>
            `;
          }).join("")}
        </div>
        ${subjects.length ? "" : `<p class="muted">Nenhuma matéria disponível.</p>`}
        <div class="notice">Os tópicos selecionados entram automaticamente no cronograma, revisões e histórico.</div>
      </section>
    </div>
  `, (root) => {
    root.querySelector("#add-subject").addEventListener("click", () => openSubjectModal(null, false, id));
    root.querySelectorAll("[data-select-subject]").forEach((button) => {
      button.addEventListener("click", () => {
        state.subjectsActiveSubjectId ||= {};
        state.subjectsActiveSubjectId[id] = state.subjectsActiveSubjectId[id] === button.dataset.selectSubject ? null : button.dataset.selectSubject;
        saveState();
        render();
      });
    });
    root.querySelectorAll("[data-add-topic]").forEach((button) => button.addEventListener("click", () => openTopicModal(button.dataset.addTopic)));
    root.querySelector("#subject-search")?.addEventListener("input", (event) => {
      const term = event.target.value.trim().toLowerCase();
      root.querySelectorAll(".subject-block").forEach((block) => {
        block.classList.toggle("hidden", term && !block.dataset.subjectName.includes(term));
      });
    });
    root.querySelectorAll("[data-toggle-topic-selection]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => toggleTopicSelection(id, checkbox.dataset.toggleTopicSelection, checkbox.checked));
    });
    root.querySelectorAll(".topic-search").forEach((input) => {
      input.addEventListener("input", (event) => {
        const term = event.target.value.trim().toLowerCase();
        event.target.closest(".topic-selector").querySelectorAll(".topic-select-row").forEach((row) => {
          row.classList.toggle("hidden", term && !row.dataset.topicTitle.includes(term));
        });
      });
    });
  });
}

function topicSelector(subject, subjectTopics, selectedTopics, id) {
  return `
    <div class="topic-selector">
      <div class="panel-header">
        <div><h3>${subject.name}</h3><p>${subjectTopics.length} tópico(s) disponíveis para seleção.</p></div>
        <button class="secondary-button" data-add-topic="${subject.id}">Novo tópico</button>
      </div>
      <label>Pesquisar tópico<input class="topic-search" type="search" placeholder="Digite para filtrar tópicos"></label>
      <div class="topic-select-list">
        ${subjectTopics.map((topic) => {
          const userTopic = state.userTopics[id]?.[topic.id] || { status: "pendente", progress: 0, unlocked: topic.order === 1 };
          return `
            <label class="topic-select-row" data-topic-title="${topic.title.toLowerCase()}">
              <input type="checkbox" data-toggle-topic-selection="${topic.id}" ${selectedTopics.has(topic.id) ? "checked" : ""}>
              <span>
                <strong>${topic.order}. ${topic.title}</strong>
              </span>
            </label>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderReviews() {
  const id = studentId();

  // Revisões do estado (sistema antigo, para compatibilidade)
  const stateReviews = studyReviewsLoaded ? [] : reviewsFor(id).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Mesclamos API reviews + state reviews sem duplicatas (API tem prioridade)
  const apiIds = new Set(studyReviews.map((r) => r.id));
  const allReviews = [...studyReviews, ...stateReviews.filter((r) => !apiIds.has(r.id))];

  const pending = allReviews.filter((r) => r.status === "pendente");
  const done = allReviews.filter((r) => r.status !== "pendente");
  const dueOf = (r) => r.nextReviewDate || r.dueDate || isoToday;
  const overdue = pending.filter((r) => dueOf(r) < isoToday).sort((a, b) => dueOf(a).localeCompare(dueOf(b)));
  const todayItems = pending.filter((r) => dueOf(r) === isoToday);
  const upcoming = pending.filter((r) => dueOf(r) > isoToday).sort((a, b) => dueOf(a).localeCompare(dueOf(b)));

  const loadingHint = hasRemoteSession && !studyReviewsLoaded
    ? `<p style="text-align:center;padding:8px;opacity:.7">Carregando revisões do servidor...</p>`
    : "";

  return htmlElement(`
    <section class="panel">
      ${loadingHint}
      <div class="panel-header"><div><h3>Revisões Inteligentes</h3><p>Veja tudo que está pendente, adiante revisões futuras quando quiser e mantenha sua memória ativa.</p></div></div>
      <section class="grid cols-4">
        ${metric("Para fazer", pending.length)}
        ${metric("Atrasadas", overdue.length)}
        ${metric("Agendadas", upcoming.length)}
        ${metric("Feitas", done.length)}
      </section>
      <div class="review-board" style="margin-top:16px">
        ${reviewBucketSection("Atrasadas", overdue, "Nenhuma revisão atrasada agora.")}
        ${reviewBucketSection("Hoje", todayItems, "Nenhuma revisão marcada para hoje. Você pode focar no estudo principal.")}
        ${reviewBucketSection("Agendadas", upcoming, "Nenhuma revisão futura agendada no momento.")}
      </div>
      <details class="subject-details review-done-details" ${done.length ? "" : "open"}>
        <summary><strong>Revisões concluídas</strong><span>${done.length} feita(s)</span></summary>
        <div class="compact-list">${done.length ? done.map(reviewCard).join("") : emptyState("Sem revisões concluídas", "As revisões marcadas como feitas aparecerão aqui.", "shield-check")}</div>
      </details>
    </section>
  `, bindReviewButtons);
}

function reviewsBySubject(id, reviews) {
  const subjects = visibleSubjects(id);
  return subjects.map((subject) => {
    const items = reviews.filter((review) => review.subjectId === subject.id);
    if (!items.length) return "";
    return `
      <details class="subject-details" ${items.some((review) => review.dueDate === isoToday && review.status === "pendente") ? "open" : ""}>
        <summary><strong>${subject.name}</strong><span>${items.length} revisão(ões)</span></summary>
        <div class="compact-list">${items.map(reviewCard).join("")}</div>
      </details>
    `;
  }).join("");
}

function reviewCard(review) {
  const isNewStyle = Boolean(review.title);
  const subjectName = isNewStyle ? review.subject : (subjectById(review.subjectId)?.name || "");
  const topicTitle = isNewStyle ? (review.topic || review.title) : (topicById(review.topicId)?.title || "");
  const dueDate = review.nextReviewDate || review.dueDate || isoToday;
  const count = review.count || 0;
  const isUpcoming = review.status === "pendente" && dueDate > isoToday;
  const isOverdue = review.status === "pendente" && dueDate < isoToday;
  const perfNote = !isNewStyle && review.topicId ? ` · ${previousPerformance(review.topicId, review.userId)}` : "";
  const canRestart = !isNewStyle && review.topicId;
  return `
    <div class="review-row compact-review-row ${isUpcoming ? "is-upcoming" : ""} ${isOverdue ? "is-overdue" : ""}">
      <div>
        ${subjectName ? `<span class="tag">${subjectName}</span>` : ""}
        <strong>${topicTitle}</strong>
        <small>${formatDate(dueDate)} · ${count} feita(s)${perfNote}</small>
      </div>
      <div class="actions">
        ${review.status === "pendente" ? `
          ${isUpcoming ? `<button class="secondary-button" data-advance-review="${review.id}">${iconSvg("calendar-days")} Adiantar para hoje</button>` : canRestart ? `<button class="secondary-button" data-start-review="${review.id}">${iconSvg("refresh-cw")} Refazer revisão</button>` : ""}
          <button class="primary-button" data-done-review="${review.id}">${iconSvg("shield-check")} Marcar como feita</button>
        ` : ""}
        ${review.status !== "pendente" ? `<span class="status-pill status-${review.status}">${statusLabel(review.status)}</span>` : ""}
      </div>
    </div>
  `;
}

function bindReviewButtons(root) {
  root.querySelectorAll("[data-start-review]").forEach((button) => {
    button.addEventListener("click", () => {
      const review = state.reviews.find((r) => r.id === button.dataset.startReview);
      if (review?.topicId) openTimer(review.topicId, true);
    });
  });
  root.querySelectorAll("[data-done-review]").forEach((button) => {
    button.addEventListener("click", () => openNextReview(button.dataset.doneReview));
  });
  root.querySelectorAll("[data-advance-review]").forEach((button) => {
    button.addEventListener("click", () => advanceReview(button.dataset.advanceReview));
  });
}

function advanceReview(reviewId) {
  const apiReview = studyReviews.find((item) => item.id === reviewId);
  if (apiReview) {
    apiUpdateReview(reviewId, { next_review_date: isoToday })
      .then(() => loadStudyReviews())
      .then(() => { showToast("Revisão adiantada para hoje."); render(); })
      .catch((err) => showToast(err.message || "Erro ao adiantar revisão."));
    return;
  }
  const review = state.reviews.find((item) => item.id === reviewId);
  if (!review) return;
  review.dueDate = isoToday;
  saveState();
  showToast("Revisão adiantada para hoje.");
  render();
}

function renderHistory() {
  const id = studentId();
  const sessions = sessionsFor(id).sort((a, b) => b.date.localeCompare(a.date));
  const stats = getStats(id);
  const subjects = visibleSubjects(id);
  return htmlElement(`
    <section class="panel">
      <div class="panel-header">
        <div><h3>Histórico inteligente</h3><p>Tempo, revisões, desempenho e evolução agrupados por matéria</p></div>
        <div class="actions"><button class="primary-button" id="export-csv">Exportar CSV</button><button class="ghost-button" id="export-pdf">Exportar PDF</button></div>
      </div>
      <section class="grid cols-4">
        ${metric("Tempo estudado", formatMinutes(stats.totalMinutes))}
        ${metric("Revisões registradas", reviewsFor(id).length)}
        ${metric("Aproveitamento", `${completionRateFor(id)}%`)}
        ${metric("Matérias estudadas", Object.keys(stats.bySubject).length)}
      </section>
      <label>Filtrar matéria<input id="history-subject-search" type="search" placeholder="Digite o nome da matéria"></label>
      <div id="history-list" class="compact-accordion">${historySubjectList(id, sessions, subjects)}</div>
    </section>
  `, (root) => {
    root.querySelector("#history-subject-search").addEventListener("input", (event) => {
      const term = event.target.value.trim().toLowerCase();
      root.querySelectorAll(".subject-details").forEach((item) => {
        item.classList.toggle("hidden", term && !item.dataset.subjectName.includes(term));
      });
    });
    root.querySelector("#export-csv").addEventListener("click", () => exportCSV(id));
    root.querySelector("#export-pdf").addEventListener("click", () => window.print());
  });
}

function historySubjectList(id, sessions, subjects) {
  return subjects.map((subject) => {
    const items = sessions.filter((session) => session.subjectId === subject.id);
    if (!items.length) return "";
    return `
      <details class="subject-details" data-subject-name="${subject.name.toLowerCase()}">
        <summary><strong>${subject.name}</strong><span>${items.length} registro(s)</span></summary>
        <div class="compact-list">${historyTopicRows(id, items)}</div>
      </details>
    `;
  }).join("") || `<p class="muted">Nenhuma sessão encontrada.</p>`;
}

function historyTopicRows(id, sessions) {
  const grouped = sessions.reduce((acc, session) => {
    acc[session.topicId] ||= [];
    acc[session.topicId].push(session);
    return acc;
  }, {});
  return Object.entries(grouped).map(([topicId, items]) => {
    const reviews = reviewsFor(id).filter((review) => review.topicId === topicId && review.status !== "pendente");
    const minutes = items.reduce((sum, session) => sum + session.studiedMinutes, 0);
    const dates = items.map((session) => formatDate(session.date)).join(", ");
    const performance = Math.round((items.filter((session) => session.result === "concluido").length / items.length) * 100);
    return `
      <div class="history-row compact-history-row">
        <div>
          <strong>${topicById(topicId).title}</strong>
          <small>${dates} · ${formatMinutes(minutes)} · ${reviews.length} revisão(ões) · ${performance}% desempenho</small>
        </div>
        <span class="status-pill status-${performance >= 70 ? "concluido" : "parcial"}">${performance}%</span>
      </div>
    `;
  }).join("");
}

function renderProfile(isSetup = false) {
  const id = studentId();
  const profile = profileFor(id);
  const selectedDays = new Set(profile.days || []);
  const selectedInterests = new Set(profile.interests || []);
  const selectedContests = new Set(profile.contests || []);
  const selectedExtras = new Set(profile.extraInterests || []);
  const interestOptions = interestSubjectOptions(id, selectedContests);
  return htmlElement(`
    <section class="panel">
      <div class="panel-header"><div><h3>${isSetup ? "Configure Seu Perfil" : "Meu Perfil De Estudos"}</h3><p>${isSetup ? "Antes de acessar o app, escolha como o Prisma Estudos vai montar seu plano automaticamente." : "Preferências usadas para gerar o cronograma diário."}</p></div></div>
      <form id="profile-form" class="form-grid">
        <div class="grid cols-2">
          <label>Nome Do Estudante<input name="studentName" value="${profile.studentName || ""}" required></label>
          <label>Objetivo De Estudo<input name="objective" value="${profile.objective || ""}" required></label>
          <label>Concurso, Prova Ou Estudo Livre<input name="context" value="${profile.context || ""}" required></label>
          <label>Tempo Disponível Por Dia<input name="dailyMinutes" type="number" min="15" value="${profile.dailyMinutes || 60}" required></label>
          <label>Horário Preferido De Estudo<input name="preferredTime" type="time" value="${profile.preferredTime || "19:00"}"></label>
          <label>Nível Atual<select name="level">${options(["iniciante", "intermediario", "avancado"], profile.level)}</select></label>
          <label>Preferência De Revisão<select name="reviewPreference">${options(["diária", "a cada 2 dias", "semanal", "quinzenal", "mensal", "personalizada"], profile.reviewPreference)}</select></label>
          <label>Quantos Tópicos Deseja Estudar Por Dia<input name="topicsPerDay" type="number" min="1" max="8" value="${profile.topicsPerDay || 1}"></label>
          <label>Misturar Matérias No Mesmo Dia<select name="mixSubjects">${options(["sim", "não"], profile.mixSubjects ? "sim" : "não")}</select></label>
        </div>

        <fieldset class="choice-section">
          <legend>Dias Da Semana Disponíveis</legend>
          <div class="choice-grid days-grid">
            ${["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day) => choiceCard("days", day, day, selectedDays.has(day))).join("")}
          </div>
        </fieldset>

        <fieldset class="choice-section">
          <legend>Concursos Em Acompanhamento</legend>
          <label>Filtrar concursos<input class="profile-filter" data-filter-list="contests-list" type="search" placeholder="Digite o concurso ou cargo"></label>
          <div class="profile-list contest-choice-list" id="contests-list">
            ${(state.contests || []).map((contest) => contestChoiceCard(contest, selectedContests.has(contest.id))).join("")}
          </div>
        </fieldset>

        <details class="choice-section collapsible-choice-section">
          <summary>Matérias De Interesse <span>${interestOptions.length} disponíveis</span></summary>
          <label>Filtrar matérias<input class="profile-filter" data-filter-list="interests-list" type="search" placeholder="Digite o nome da matéria"></label>
          <div class="profile-list" id="interests-list">
            ${interestOptions.map((option) => choiceCard("interests", option.ids.join("|"), option.name, option.ids.some((subjectId) => selectedInterests.has(subjectId)), option.detail)).join("")}
          </div>
        </details>

        <details class="choice-section collapsible-choice-section">
          <summary>Matérias Adicionadas Pelo Aluno <span>${studentExtraSubjectOptions(id).length} adicionadas</span></summary>
          <label>Filtrar matérias adicionadas<input class="profile-filter" data-filter-list="extras-list" type="search" placeholder="Digite o nome da matéria"></label>
          <div class="profile-list" id="extras-list">
            ${studentExtraSubjectOptions(id).map((subject) => choiceCard("extraInterests", subject.id, subject.name, selectedExtras.has(subject.id))).join("") || `<p class="muted">Nenhuma matéria própria adicionada ainda.</p>`}
          </div>
        </details>

        <button class="primary-button" type="submit">${isSetup ? "Concluir Configuração" : "Salvar Perfil"}</button>
      </form>
    </section>
  `, (root) => {
    root.querySelectorAll(".profile-filter").forEach((input) => {
      input.addEventListener("input", () => filterProfileList(root, input));
    });
    root.querySelector("#profile-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const days = checkedValues(event.target, "days");
      const interests = checkedValues(event.target, "interests");
      const contests = checkedValues(event.target, "contests");
      const extraInterests = checkedValues(event.target, "extraInterests");
      const ownSubjects = studentExtraSubjectOptions(id).map((subject) => subject.id);
      if (!days.length || !interests.length || !contests.length) {
        showToast("Selecione dias disponíveis, matérias e pelo menos um concurso.");
        return;
      }
      state.profiles[id] = {
        studentName: data.get("studentName"),
        objective: data.get("objective"),
        context: data.get("context"),
        dailyMinutes: Number(data.get("dailyMinutes")),
        days,
        preferredTime: data.get("preferredTime"),
        interests: unique([...interests, ...extraInterests]),
        contests,
        extraInterests: unique([...extraInterests, ...ownSubjects]),
        activeContestId: contests.includes(profile.activeContestId) ? profile.activeContestId : contests[0],
        level: data.get("level"),
        reviewPreference: data.get("reviewPreference"),
        topicsPerDay: Number(data.get("topicsPerDay")),
        mixSubjects: data.get("mixSubjects") === "sim",
        configured: true
      };
      state.userSubjects[id] = unique([...state.profiles[id].interests, ...state.profiles[id].extraInterests]);
      initializeUserTopics(id);
      saveState();
      showToast("Perfil atualizado.");
      if (isSetup) {
        showOnboardingSlides(id);
      } else {
        render();
      }
    });
  });
}

function choiceCard(name, value, label, checked, detail = "") {
  return `
    <label class="choice-card" data-filter-text="${`${label} ${detail}`.toLowerCase()}">
      <input type="checkbox" name="${name}" value="${value}" ${checked ? "checked" : ""}>
      <span>${titleText(label)}</span>
      ${detail ? `<small>${titleText(detail)}</small>` : ""}
    </label>
  `;
}

function contestChoiceCard(contest, checked) {
  return `
    <label class="choice-card contest-choice-card" data-filter-text="${`${contest.name} ${contest.role} ${contest.organ}`.toLowerCase()}">
      <input type="checkbox" name="contests" value="${contest.id}" ${checked ? "checked" : ""}>
      <div class="contest-choice-image">
        <img src="${contest.image}" alt="${contest.role}">
        <span>${contest.name}</span>
      </div>
      <span>${titleText(contest.role)}</span>
      <small>${titleText(contest.organ)}</small>
    </label>
  `;
}

function interestSubjectOptions(id, selectedContests = new Set()) {
  const selectedContestIds = [...selectedContests].filter((contestId) => !legacyContestIds.has(contestId));
  const contestSubjectIds = selectedContestIds.length
    ? selectedContestIds.flatMap((contestId) => contestById(contestId)?.subjects || [])
    : defaultContestIds.flatMap((contestId) => contestById(contestId)?.subjects || []);
  const allowed = new Set(contestSubjectIds);
  const subjects = availableSubjects(id).filter((subject) => allowed.size === 0 || allowed.has(subject.id) || subject.ownerId === id);
  const map = new Map();
  subjects.forEach((subject) => {
    const key = subject.name.toLocaleLowerCase("pt-BR");
    const existing = map.get(key) || { name: subject.name, ids: [], categories: new Set(), cargos: new Set() };
    existing.ids.push(subject.id);
    (state.contests || []).forEach((contest) => {
      if (!contest.subjects?.includes(subject.id)) return;
      existing.cargos.add(contest.cargo || contest.role);
      const category = subjectCategoryForContest(subject.id, contest);
      if (category) existing.categories.add(category);
    });
    map.set(key, existing);
  });
  return [...map.values()]
    .map((item) => ({
      name: item.name,
      ids: unique(item.ids),
      detail: [...item.categories, ...item.cargos].join(" · ")
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function studentExtraSubjectOptions(id) {
  return availableSubjects(id)
    .filter((subject) => subject.ownerId === id && !subject.isBase)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function filterProfileList(root, input) {
  const term = input.value.trim().toLowerCase();
  root.querySelectorAll(`#${input.dataset.filterList} .choice-card`).forEach((item) => {
    item.classList.toggle("hidden", term && !item.dataset.filterText.includes(term));
  });
}

function checkedValues(form, name) {
  return unique([...form.querySelectorAll(`input[name="${name}"]:checked`)].flatMap((input) => input.value.split("|").filter(Boolean)));
}

function renderCustomize() {
  const id = studentId();
  const theme = themeFor(id);
  const preset = themePresets[theme.preset || "dark"] || themePresets.dark;
  const prefs = userPreferences;
  return htmlElement(`
    <div class="grid">
      <section class="panel">
        <div class="panel-header"><div><h3>Personalizar Aparência</h3><p>Escolha um tema pronto ou ajuste as cores principais do seu ambiente.</p></div></div>
        <form id="theme-form" class="form-grid">
          <fieldset class="choice-section">
            <legend>Temas Prontos</legend>
            <div class="theme-preset-grid">
              ${Object.entries(themePresets).map(([key, item]) => `
                <label class="theme-preset-card" style="--preset-primary:${item.primary}; --preset-secondary:${item.secondary}; --preset-bg:${item.bg}; --preset-card:${item.card};">
                  <input type="radio" name="preset" value="${key}" ${key === (theme.preset || "dark") ? "checked" : ""}>
                  <span class="theme-preview"><i></i><i></i><i></i></span>
                  <strong>${item.label}</strong>
                </label>
              `).join("")}
            </div>
          </fieldset>
          <div class="grid cols-2">
            <label>Estilo dos cards<select name="cardStyle">${options(["soft", "glass", "solid"], theme.cardStyle)}</select></label>
            <label>Cor principal<input name="primary" type="color" value="${theme.primary}"></label>
            <label>Cor secundária<input name="secondary" type="color" value="${theme.secondary}"></label>
            <label>Cor de fundo<input name="bg" type="color" value="${theme.bg || preset.bg}"></label>
            <label>Cor dos cards<input name="card" type="color" value="${theme.card || preset.card}"></label>
            <label>Densidade visual<select name="density">${options(["compact", "normal", "comfortable"], theme.density)}</select></label>
          </div>
          <button class="primary-button" type="submit">Salvar aparência</button>
        </form>
      </section>

      <section class="panel">
        <div class="panel-header"><div><h3>Preferências de Estudo</h3><p>Configure metas, notificações e comportamento do app. Salvo diretamente no servidor.</p></div></div>
        ${hasRemoteSession ? `
          <form id="prefs-form" class="form-grid">
            <label>Objetivo de estudo
              <input name="studyGoal" type="text" placeholder="Ex: Aprovação no TRT-SP 2025" maxlength="255">
            </label>
            <div class="grid cols-2">
              <label>Minutos diários de estudo
                <input name="dailyStudyMinutes" type="number" min="10" max="600" step="5" value="${prefs.dailyStudyMinutes || 60}">
              </label>
              <label>Layout padrão
                <select name="layoutMode">${options(["default", "compact", "comfortable"], prefs.layoutMode || "default")}</select>
              </label>
            </div>
            <div class="grid cols-2">
              <label class="checkbox-label">
                <input type="checkbox" name="notificationsEnabled" ${prefs.notificationsEnabled !== false ? "checked" : ""}> Ativar notificações
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="soundEnabled" ${prefs.soundEnabled !== false ? "checked" : ""}> Ativar sons de estudo
              </label>
            </div>
            <button class="primary-button" type="submit" id="prefs-submit">Salvar preferências</button>
          </form>
        ` : `<p class="muted">Faça login para salvar suas preferências no servidor.</p>`}
      </section>
    </div>
  `, (root) => {
    root.querySelectorAll("input[name='preset']").forEach((input) => {
      input.addEventListener("change", () => {
        const selected = themePresets[input.value] || themePresets.dark;
        root.querySelector("input[name='primary']").value = selected.primary;
        root.querySelector("input[name='secondary']").value = selected.secondary;
        root.querySelector("input[name='bg']").value = selected.bg;
        root.querySelector("input[name='card']").value = selected.card;
      });
    });
    root.querySelector("#theme-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const selectedPreset = data.get("preset") || "dark";
      state.themes[id] = {
        ...themePresets[selectedPreset],
        preset: selectedPreset,
        cardStyle: data.get("cardStyle"),
        density: data.get("density"),
        primary: data.get("primary"),
        secondary: data.get("secondary"),
        bg: data.get("bg"),
        card: data.get("card")
      };
      saveState();
      showToast("Personalização salva.");
      render();
    });
    if (hasRemoteSession) {
      const goalInput = root.querySelector("input[name='studyGoal']");
      if (goalInput) goalInput.value = prefs.studyGoal || "";
      root.querySelector("#prefs-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitBtn = root.querySelector("#prefs-submit");
        const formData = new FormData(event.target);
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvando...";
        try {
          await saveUserPreferences({
            studyGoal: formData.get("studyGoal") || "",
            dailyStudyMinutes: Number(formData.get("dailyStudyMinutes") || 60),
            layoutMode: formData.get("layoutMode") || "default",
            notificationsEnabled: formData.has("notificationsEnabled"),
            soundEnabled: formData.has("soundEnabled")
          });
          applyUserPreferences();
          showToast("Preferências salvas com sucesso.");
        } catch (error) {
          showToast(error.message || "Erro ao salvar preferências.");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Salvar preferências";
        }
      });
    }
  });
}

function renderAdmin() {
  if (!isAdmin()) return renderDashboard();
  const stats = adminStats();
  return htmlElement(`
    <div class="grid">
      <section class="grid cols-4">
        ${metric("Usuários ativos", stats.activeUsers)}
        ${metric("Acessos expirando", stats.expiringSoon)}
        ${metric("Acessos expirados", stats.expiredUsers)}
        ${metric("Tempo total estudado", formatMinutes(stats.totalMinutes))}
      </section>
      <section class="grid cols-4">
        ${metric("Engajamento 7 dias", `${stats.weeklyActiveUsers}/${stats.studentUsers}`)}
        ${metric("Média por aluno", formatMinutes(stats.avgMinutesPerStudent))}
        ${metric("Conclusão média", `${stats.avgCompletion}%`)}
        ${metric("Revisões pendentes", stats.pendingReviews)}
      </section>
      <section class="panel">
        <div class="tabs">
          <button class="tab-button active" data-admin-tab="users">Usuários</button>
          <button class="tab-button" data-admin-tab="catalog">Matérias base</button>
          <button class="tab-button" data-admin-tab="progress">Progresso geral</button>
          <button class="tab-button" data-admin-tab="access">Acessos</button>
        </div>
        <div id="admin-content">${adminUsers()}</div>
      </section>
    </div>
  `, (root) => {
    root.querySelectorAll("[data-admin-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const content = root.querySelector("#admin-content");
        content.innerHTML = button.dataset.adminTab === "users" ? adminUsers() : button.dataset.adminTab === "catalog" ? adminCatalog() : button.dataset.adminTab === "access" ? adminAccess() : adminProgress();
        bindAdminContent(root);
      });
    });
    bindAdminContent(root);
  });
}

function bindAdminContent(root) {
  root.querySelectorAll("[data-new-user]").forEach((button) => button.addEventListener("click", () => openUserModal()));
  root.querySelectorAll("[data-edit-user]").forEach((button) => button.addEventListener("click", () => openUserModal(button.dataset.editUser)));
  root.querySelectorAll("[data-delete-user]").forEach((button) => button.addEventListener("click", () => deleteUser(button.dataset.deleteUser)));
  root.querySelectorAll("[data-new-base-subject]").forEach((button) => button.addEventListener("click", () => openSubjectModal(null, true)));
  root.querySelectorAll("[data-add-topic]").forEach((button) => button.addEventListener("click", () => openTopicModal(button.dataset.addTopic, null, true)));
}

function adminUsers() {
  return `
    <div class="panel-header"><div><h3>Usuários</h3><p>Cadastrar, editar, excluir e definir tempo de acesso</p></div><button class="primary-button" data-new-user>Novo usuário</button></div>
    <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Login</th><th>Perfil</th><th>Status</th><th>Acesso</th><th>Ações</th></tr></thead><tbody>
      ${state.users.map((user) => `<tr><td>${user.name}</td><td>${user.email}</td><td>${user.role}</td><td>${user.status}</td><td>${accessBadge(user)}</td><td><button class="ghost-button" data-edit-user="${user.id}">Editar</button> ${user.id !== "u-admin" ? `<button class="danger-button" data-delete-user="${user.id}">Excluir</button>` : ""}</td></tr>`).join("")}
    </tbody></table></div>
  `;
}

function adminCatalog() {
  const bases = state.subjects.filter((subject) => subject.isBase);
  return `
    <div class="panel-header"><div><h3>Matérias e tópicos base</h3><p>Catálogo global visível para estudantes</p></div><button class="primary-button" data-new-base-subject>Nova matéria base</button></div>
    <div class="grid">${bases.map((subject) => `
      <div class="admin-row">
        <div><h3>${subject.name}</h3><p class="muted">${topicsForSubject(subject.id).length} tópicos cadastrados</p></div>
        <button class="secondary-button" data-add-topic="${subject.id}">Novo tópico base</button>
      </div>`).join("")}
    </div>
  `;
}

function adminProgress() {
  return `
    <div class="panel-header"><div><h3>Progresso geral</h3><p>Saúde de estudo, ritmo e risco de abandono por aluno</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>Usuário</th><th>Acesso</th><th>Tempo total</th><th>Semana</th><th>Streak</th><th>Conclusão</th><th>Revisões</th><th>Último estudo</th><th>Matéria mais estudada</th></tr></thead><tbody>
      ${state.users.filter((user) => user.role === "student").map((user) => {
        const stats = getStats(user.id);
        return `<tr><td>${user.name}</td><td>${accessBadge(user)}</td><td>${formatMinutes(stats.totalMinutes)}</td><td>${formatMinutes(stats.weekMinutes)}</td><td>${stats.streak} dias</td><td>${completionRateFor(user.id)}%</td><td>${stats.pendingReviews}</td><td>${lastStudyLabel(user.id)}</td><td>${stats.topSubject}</td></tr>`;
      }).join("")}
    </tbody></table></div>
  `;
}

function adminAccess() {
  const users = state.users.filter((user) => user.role === "student").sort((a, b) => accessSortValue(a) - accessSortValue(b));
  return `
    <div class="panel-header"><div><h3>Controle de acessos</h3><p>Veja vencimentos, renove alunos e antecipe bloqueios</p></div><button class="primary-button" data-new-user>Novo usuário</button></div>
    <div class="admin-insights">
      ${users.map((user) => {
        const stats = getStats(user.id);
        return `
          <article class="admin-insight">
            <div>
              <span class="tag">${accessLabel(user)}</span>
              <h3>${user.name}</h3>
              <p class="muted">${user.email}</p>
            </div>
            <dl class="review-meta">
              <div><dt>Dias restantes</dt><dd>${accessDaysLeft(user) ?? "Livre"}</dd></div>
              <div><dt>Estudou na semana</dt><dd>${formatMinutes(stats.weekMinutes)}</dd></div>
              <div><dt>Último estudo</dt><dd>${lastStudyLabel(user.id)}</dd></div>
            </dl>
            <div class="actions">
              <button class="ghost-button" data-edit-user="${user.id}">Editar acesso</button>
            </div>
          </article>
        `;
      }).join("") || `<p class="muted">Nenhum estudante cadastrado.</p>`}
    </div>
  `;
}

function openTimer(topicId, isReview) {
  const topic = topicById(topicId);
  const subject = subjectById(topic.subjectId);
  const savedTimer = state.activeTimers?.[topicId];
  closeTimer();
  openModal(`
    <div class="focus-mode">
      <div class="focus-topbar">
        <span class="tag">${isReview ? "Modo Revisão" : "Modo Foco"}</span>
        <button class="icon-button" data-close-modal aria-label="Sair do modo foco">X</button>
      </div>
      <div class="focus-layout">
        <section class="focus-copy">
          <span class="eyebrow">${subject.name}</span>
          <h2>${topic.title}</h2>
          <p>Tempo sugerido: ${topic.suggestedMinutes} minutos. Sem distrações, apenas o próximo bloco.</p>
          <div class="prisma-sounds">
            <div class="focus-audio">
              <button class="ghost-button" id="ambient-toggle">${isAmbientMuted() ? "Som Desligado" : "Som Ligado"}</button>
              <small>Playlist Prisma Estudos para tocar junto com o foco.</small>
            </div>
            <label>Som de estudo
              <select id="study-sound">
                ${studySoundOptions().map((sound) => `<option value="${sound.id}" ${sound.id === selectedStudySound() ? "selected" : ""}>${sound.label}</option>`).join("")}
              </select>
            </label>
          </div>
          <button class="primary-button focus-start-main" id="timer-start-main">Iniciar estudo</button>
        </section>
        <section class="timer-face">
          <div class="timer-ring" id="timer-ring" style="--pct:0">
            <div class="timer-inner">
              <div>
                <small id="timer-total">Total: ${Math.round((savedTimer?.totalSeconds || topic.suggestedMinutes * 60) / 60)} min</small>
                <strong id="timer-left">${formatClock(savedTimer?.remainingSeconds || topic.suggestedMinutes * 60)}</strong>
                <small id="timer-percent">0%</small>
              </div>
            </div>
          </div>
          <p class="muted" id="timer-message">Escolha o tempo e inicie quando estiver pronto.</p>
        </section>
      </div>
      <div class="focus-controls">
        ${[30, 45, 60].map((minutes) => `<button class="ghost-button" data-minutes="${minutes}">${minutes} min</button>`).join("")}
        <label>Personalizado<input id="custom-minutes" type="number" min="1" value="${topic.suggestedMinutes}"></label>
      </div>
      <div class="actions focus-actions">
        <button class="primary-button" id="timer-start">Iniciar</button>
        <button class="ghost-button" id="timer-pause">Pausar</button>
        <button class="secondary-button" id="timer-resume">Continuar</button>
        <button class="danger-button" id="timer-finish">Finalizar estudo</button>
        <button class="ghost-button" data-close-modal>Sair do modo foco</button>
      </div>
        </div>
  `, (modal) => {
    let totalSeconds = savedTimer?.totalSeconds || topic.suggestedMinutes * 60;
    let remaining = savedTimer?.remainingSeconds || totalSeconds;
    let halfAlert = false;
    activeTimerState = { topicId, isReview, get totalSeconds() { return totalSeconds; }, get remainingSeconds() { return remaining; } };
    const setMinutes = (minutes) => {
      totalSeconds = Math.max(1, Number(minutes)) * 60;
      remaining = totalSeconds;
      halfAlert = false;
      persistTimerProgress(topicId, totalSeconds, remaining, isReview);
      updateTimer(totalSeconds, remaining);
    };
    modal.querySelectorAll("[data-minutes]").forEach((button) => button.addEventListener("click", () => setMinutes(button.dataset.minutes)));
    modal.querySelector("#custom-minutes").addEventListener("input", (event) => setMinutes(event.target.value));
    const startTimer = () => {
      if (!isAmbientMuted()) startAmbientAudio();
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        remaining -= 1;
        persistTimerProgress(topicId, totalSeconds, remaining, isReview);
        const percent = Math.round(((totalSeconds - remaining) / totalSeconds) * 100);
        updateTimer(totalSeconds, remaining);
        if (!halfAlert && percent >= 50) {
          halfAlert = true;
          playTone(660, 0.16);
          modal.querySelector("#timer-message").textContent = "Você chegou na metade do estudo";
        }
        if (remaining <= 0) {
          playTone(420, 0.25);
          playTone(760, 0.25, 0.12);
          modal.querySelector("#timer-message").textContent = "Tempo de estudo finalizado";
          const studied = Math.ceil(totalSeconds / 60);
          clearTimerProgress(topicId);
          closeTimer();
          setTimeout(() => openFinishStudy(topicId, studied, isReview), 450);
        }
      }, 1000);
    };
    modal.querySelector("#timer-start").addEventListener("click", startTimer);
    modal.querySelector("#timer-start-main").addEventListener("click", startTimer);
    modal.querySelector("#timer-pause").addEventListener("click", () => {
      persistTimerProgress(topicId, totalSeconds, remaining, isReview);
      stopAmbientAudio();
      closeTimer();
      showToast("Progresso do timer salvo para continuar depois.");
    });
    modal.querySelector("#timer-resume").addEventListener("click", () => modal.querySelector("#timer-start").click());
    modal.querySelector("#timer-finish").addEventListener("click", () => {
      const studied = Math.max(1, Math.ceil((totalSeconds - remaining) / 60));
      clearTimerProgress(topicId);
      stopAmbientAudio();
      closeTimer();
      openFinishStudy(topicId, studied, isReview);
    });
    modal.querySelector("#ambient-toggle").addEventListener("click", () => {
      const muted = !isAmbientMuted();
      setAmbientMuted(muted);
      modal.querySelector("#ambient-toggle").textContent = muted ? "Som Desligado" : "Som Ligado";
      if (muted) stopAmbientAudio();
      else startAmbientAudio();
    });
    modal.querySelector("#study-sound").addEventListener("change", (event) => {
      setStudySound(event.target.value);
      if (!isAmbientMuted()) {
        stopAmbientAudio();
        startAmbientAudio();
      }
    });
    updateTimer(totalSeconds, remaining);
  });
}

function updateTimer(total, remaining) {
  const safeRemaining = Math.max(0, remaining);
  const percent = Math.round(((total - safeRemaining) / total) * 100);
  $("#timer-ring").style.setProperty("--pct", percent);
  $("#timer-total").textContent = `Total: ${Math.round(total / 60)} min`;
  $("#timer-left").textContent = formatClock(safeRemaining);
  $("#timer-percent").textContent = `${percent}%`;
}

function closeTimer() {
  if (timer) clearInterval(timer);
  if (activeTimerState) {
    persistTimerProgress(activeTimerState.topicId, activeTimerState.totalSeconds, activeTimerState.remainingSeconds, activeTimerState.isReview);
  }
  stopAmbientAudio();
  timer = null;
  activeTimerState = null;
}

function isAmbientMuted() {
  return localStorage.getItem("prisma-estudos-ambient-muted") === "true";
}

function setAmbientMuted(muted) {
  localStorage.setItem("prisma-estudos-ambient-muted", String(muted));
}

function studySoundOptions() {
  return [
    { id: "rain", label: "Chuva Relaxante", base: [72], wave: "sine", gain: 0.012, noise: 0.16, filter: 2400 },
    { id: "piano", label: "Piano Ambiente", base: [130.81, 196, 261.63, 329.63], wave: "sine", gain: 0.044, noise: 0, filter: 1350 }
  ];
}

function selectedStudySound() {
  const saved = localStorage.getItem("prisma-estudos-sound");
  return studySoundOptions().some((sound) => sound.id === saved) ? saved : "rain";
}

function setStudySound(soundId) {
  localStorage.setItem("prisma-estudos-sound", soundId);
}

function currentStudySound() {
  return studySoundOptions().find((sound) => sound.id === selectedStudySound()) || studySoundOptions()[0];
}

function startAmbientAudio() {
  if (focusAudio || isAmbientMuted()) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const sound = currentStudySound();
  const master = ctx.createGain();
  master.gain.value = sound.id === "rain" ? 0.12 : 0.028;
  master.connect(ctx.destination);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = sound.filter || 1200;
  filter.Q.value = sound.id === "rain" ? 0.2 : 0.8;
  filter.connect(master);
  const delay = ctx.createDelay();
  delay.delayTime.value = sound.id === "rain" ? 0.08 : 0.32;
  const delayGain = ctx.createGain();
  delayGain.gain.value = sound.id === "rain" ? 0.02 : 0.12;
  delay.connect(delayGain).connect(filter);
  const oscillators = sound.base.map((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = index === 0 ? "sine" : sound.wave;
    osc.frequency.value = freq;
    gain.gain.value = index === 0 ? sound.gain * 2.6 : sound.gain;
    lfo.frequency.value = 0.035 + index * 0.012;
    lfoGain.gain.value = 4 + index;
    lfo.connect(lfoGain).connect(osc.frequency);
    osc.connect(gain).connect(filter);
    osc.connect(gain).connect(delay);
    osc.start();
    lfo.start();
    return { osc, lfo };
  });
  const noise = sound.noise ? createNoiseSource(ctx, filter, sound.noise, sound.id) : null;
  const rainDrops = sound.id === "rain" ? createRainDrops(ctx, filter) : [];
  focusAudio = { ctx, oscillators, noise, rainDrops };
}

function stopAmbientAudio() {
  if (!focusAudio) return;
  focusAudio.oscillators.forEach((item) => {
    try { item.osc.stop(); } catch {}
    try { item.lfo.stop(); } catch {}
  });
  if (focusAudio.noise) {
    try { focusAudio.noise.stop(); } catch {}
  }
  (focusAudio.rainDrops || []).forEach((item) => {
    try { item.stop(); } catch {}
  });
  focusAudio.ctx.close?.();
  focusAudio = null;
}

function createNoiseSource(ctx, destination, gainValue, soundId = selectedStudySound()) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    const soft = Math.random() + Math.random() + Math.random() + Math.random() - 2;
    data[i] = soundId === "rain" ? soft * 0.5 : (Math.random() * 2 - 1) * 0.55;
  }
  const noise = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = soundId === "rain" ? 2600 : 1800;
  gain.gain.value = gainValue;
  noise.buffer = buffer;
  noise.loop = true;
  noise.connect(filter).connect(gain).connect(destination);
  noise.start();
  return noise;
}

function createRainDrops(ctx, destination) {
  return [0.9, 1.35, 1.9].map((rate, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 520 + index * 140;
    gain.gain.value = 0.0025 + index * 0.001;
    osc.connect(gain).connect(destination);
    osc.start();
    const interval = setInterval(() => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0005, now);
      gain.gain.linearRampToValueAtTime(0.012 + index * 0.003, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.22);
    }, rate * 1000);
    return {
      stop() {
        clearInterval(interval);
        osc.stop();
      }
    };
  });
}

function persistTimerProgress(topicId, totalSeconds, remainingSeconds, isReview) {
  state.activeTimers ||= {};
  const studiedSeconds = Math.max(0, totalSeconds - Math.max(0, remainingSeconds));
  if (studiedSeconds <= 0) return;
  state.activeTimers[topicId] = {
    topicId,
    totalSeconds,
    remainingSeconds: Math.max(0, remainingSeconds),
    isReview,
    updatedAt: new Date().toISOString()
  };
  saveState();
}

function clearTimerProgress(topicId) {
  if (activeTimerState?.topicId === topicId) activeTimerState = null;
  if (state.activeTimers?.[topicId]) {
    delete state.activeTimers[topicId];
    saveState();
  }
}

function openFinishStudy(topicId, studiedMinutes, isReview = false) {
  const topic = topicById(topicId);
  const subject = subjectById(topic.subjectId);
  openModal(`
    <div class="panel-header"><div><h3>Finalização do estudo</h3><p>${subject.name} · ${topic.title}</p></div></div>
    <h2>Você finalizou este tópico?</h2>
    <div class="grid">
      <button class="primary-button" data-result="concluido">Sim, concluí o tópico</button>
      <button class="ghost-button" data-result="nao-concluido">Não, preciso continuar depois</button>
      <button class="secondary-button" data-result="parcial">Estudei parcialmente</button>
      <button class="ghost-button" type="button" data-close-modal>Voltar</button>
    </div>
  `, (modal) => {
    modal.querySelectorAll("[data-result]").forEach((button) => {
      button.addEventListener("click", () => finalizeStudy(topicId, button.dataset.result, studiedMinutes, isReview));
    });
  });
}

function finishStudySnapshotKey(userId, topicId) {
  return `${userId}:${topicId}`;
}

function createFinishStudySnapshot(userId, topicId) {
  const key = finishStudySnapshotKey(userId, topicId);
  if (finishStudySnapshots[key]) return key;
  finishStudySnapshots[key] = {
    userId,
    topicId,
    userTopics: JSON.parse(JSON.stringify(state.userTopics[userId] || {})),
    sessionsLength: state.sessions.length
  };
  return key;
}

function restoreFinishStudySnapshot(snapshotKey) {
  const snapshot = finishStudySnapshots[snapshotKey];
  if (!snapshot) return false;
  state.userTopics[snapshot.userId] = JSON.parse(JSON.stringify(snapshot.userTopics));
  state.sessions = state.sessions.slice(0, snapshot.sessionsLength);
  delete finishStudySnapshots[snapshotKey];
  saveStateNow();
  render();
  return true;
}

function finalizeStudy(topicId, result, studiedMinutes, isReview) {
  const id = studentId();
  const topic = topicById(topicId);
  let snapshotKey = null;
  if (!isReview && ["concluido", "parcial"].includes(result)) {
    snapshotKey = createFinishStudySnapshot(id, topicId);
  }
  ensureUserTopic(id, topicId);
  const userTopic = state.userTopics[id][topicId];
  userTopic.status = result;
  userTopic.progress = result === "concluido" ? 100 : result === "parcial" ? Math.max(userTopic.progress, 55) : Math.max(userTopic.progress, 20);
  if (result === "concluido") {
    userTopic.completedAt = isoToday;
    userTopic.theoryRead = true;
    userTopic.summaryDone = true;
    userTopic.exercisesDone = true;
    unlockNextTopic(id, topic);
  }
  state.sessions.push({
    id: idFor("ss"),
    userId: id,
    subjectId: topic.subjectId,
    topicId,
    date: isoToday,
    plannedMinutes: topic.suggestedMinutes,
    studiedMinutes: studiedMinutes || topic.suggestedMinutes,
    result
  });
  saveState();
  if (isReview) {
    showToast("Revisão registrada no histórico.");
    closeModal();
    render();
    return;
  }
  if (result === "concluido") openReviewSetup(topicId, { studiedMinutes, isReview, snapshotKey });
  if (result === "nao-concluido") {
    showToast("O tópico continuará no próximo estudo.");
    closeModal();
    render();
  }
  if (result === "parcial") openPartialChoice(topicId, { studiedMinutes, isReview, snapshotKey });
}

function openPartialChoice(topicId, context = {}) {
  openModal(`
    <div class="panel-header"><div><h3>Progresso parcial salvo</h3><p>Defina como o cronograma deve seguir</p></div></div>
    <div class="grid">
      <button class="primary-button" id="partial-continue">Continuar no próximo estudo</button>
      <button class="secondary-button" id="partial-advance">Avançar mesmo assim</button>
      <button class="ghost-button" id="partial-back" type="button">Voltar</button>
    </div>
  `, (modal) => {
    modal.querySelector("#partial-continue").addEventListener("click", () => {
      if (context.snapshotKey) delete finishStudySnapshots[context.snapshotKey];
      closeModal();
      showToast("O tópico permanece como próximo estudo.");
      render();
    });
    modal.querySelector("#partial-advance").addEventListener("click", () => {
      if (context.snapshotKey) delete finishStudySnapshots[context.snapshotKey];
      unlockNextTopic(studentId(), topicById(topicId));
      closeModal();
      showToast("Próximo tópico liberado.");
      render();
    });
    modal.querySelector("#partial-back").addEventListener("click", () => {
      if (context.snapshotKey) restoreFinishStudySnapshot(context.snapshotKey);
      openFinishStudy(topicId, context.studiedMinutes, context.isReview);
    });
  });
}

function openReviewSetup(topicId, context = {}) {
  const options = [
    ["1", "Amanhã"],
    ["7", "Daqui 7 dias"],
    ["15", "Daqui 15 dias"],
    ["30", "Daqui 30 dias"],
    ["60", "Daqui 60 dias"],
    ["90", "Daqui 90 dias"],
    ["120", "Daqui 120 dias"]
  ];
  openModal(`
    <div class="panel-header"><div><h3>Configuração de revisão</h3><p>Selecione um ou mais dias para revisar esse tópico.</p></div></div>
    <div class="choice-grid review-choice-grid">
      ${options.map(([days, label]) => `
        <label class="choice-card">
          <input type="checkbox" name="review-days" value="${days}">
          <span>${label}</span>
        </label>
      `).join("")}
      <label>Personalizado<input id="custom-review-date" type="date"></label>
    </div>
    <div class="grid" style="margin-top:16px">
      <button class="ghost-button" id="back-to-finish-study" type="button">Voltar</button>
      <button class="primary-button" id="save-review-schedule" type="button">Salvar revisão</button>
    </div>
  `, (modal) => {
    modal.querySelector("#back-to-finish-study").addEventListener("click", () => {
      if (context.snapshotKey) restoreFinishStudySnapshot(context.snapshotKey);
      openFinishStudy(topicId, context.studiedMinutes, context.isReview);
    });
    modal.querySelector("#save-review-schedule").addEventListener("click", () => {
      const selectedDates = [...modal.querySelectorAll("input[name='review-days']:checked")].map((input) => addDaysISO(Number(input.value)));
      const customDate = modal.querySelector("#custom-review-date").value;
      if (customDate) selectedDates.push(customDate);
      const reviewDates = unique(selectedDates);
      if (context.snapshotKey && reviewDates.length) delete finishStudySnapshots[context.snapshotKey];
      saveReviews(topicId, reviewDates);
    });
  });
}

function saveReviews(topicId, dueDates) {
  if (!dueDates.length) return showToast("Selecione pelo menos uma data de revisão.");
  const id = studentId();
  const topic = topicById(topicId);
  const subject = subjectById(topic.subjectId);

  // Mantém no estado antigo para compatibilidade com dashboard
  dueDates.forEach((dueDate) => {
    state.reviews.push({ id: idFor("r"), userId: id, subjectId: topic.subjectId, topicId, originalDate: isoToday, dueDate, count: 0, status: "pendente" });
  });
  saveState();
  closeModal();
  showToast(`${dueDates.length} revisão(ões) programada(s).`);
  render();

  // Persiste também na nova tabela study_reviews via API
  if (hasRemoteSession) {
    Promise.all(
      dueDates.map((dueDate) =>
        apiCreateReview({
          title: topic.title,
          subject: subject?.name || "",
          topic: topic.title,
          next_review_date: dueDate
        }).catch(() => {})
      )
    ).then(() => loadStudyReviews()).then(() => render()).catch(() => {});
  }
}

function openNextReview(reviewId) {
  const apiReview = studyReviews.find((item) => item.id === reviewId);

  if (apiReview) {
    // Revisão da nova tabela study_reviews: usa dificuldade para calcular próxima data
    openModal(`
      <div class="panel-header"><div><h3>Como foi a revisão?</h3><p>${apiReview.title}</p></div></div>
      <p style="margin-bottom:12px;opacity:.8">Escolha a dificuldade para agendar a próxima revisão automaticamente.</p>
      <div class="grid cols-2" style="gap:8px">
        ${[
          ["facil", "Fácil", "Próxima em 7 dias"],
          ["medio", "Médio", "Próxima em 3 dias"],
          ["dificil", "Difícil", "Próxima em 1 dia"],
          ["encerrar", "Encerrar", "Não revisar mais"]
        ].map(([diff, label, hint]) => `
          <button class="${diff === "encerrar" ? "danger-button" : "ghost-button"}" data-difficulty="${diff}">
            <strong>${label}</strong><br><small>${hint}</small>
          </button>`).join("")}
      </div>
    `, (modal) => {
      modal.querySelectorAll("[data-difficulty]").forEach((button) => {
        button.addEventListener("click", async () => {
          const diff = button.dataset.difficulty;
          const isClosing = diff === "encerrar";
          try {
            await apiUpdateReview(reviewId, {
              status: isClosing ? "encerrada" : "concluida",
              difficulty: isClosing ? undefined : diff
            });
            if (!isClosing) {
              const dayMap = { facil: 7, medio: 3, dificil: 1 };
              await apiCreateReview({
                title: apiReview.title,
                subject: apiReview.subject || "",
                topic: apiReview.topic || "",
                difficulty: diff,
                notes: apiReview.notes || ""
              });
            }
            await loadStudyReviews();
            closeModal();
            showToast("Revisão atualizada.");
            render();
          } catch (err) {
            showToast(err.message || "Erro ao atualizar revisão.");
          }
        });
      });
    });
    return;
  }

  // Revisão do sistema antigo (state.reviews)
  const review = state.reviews.find((item) => item.id === reviewId);
  if (!review) return;
  openModal(`
    <div class="panel-header"><div><h3>Próxima revisão</h3><p>${topicById(review.topicId)?.title || "Tópico"}</p></div></div>
    <div class="grid cols-3">
      ${[
        ["1", "Revisar amanhã"],
        ["3", "Daqui 3 dias"],
        ["7", "Daqui 7 dias"],
        ["15", "Daqui 15 dias"],
        ["30", "Daqui 30 dias"],
        ["0", "Encerrar revisões"]
      ].map(([days, label]) => `<button class="${days === "0" ? "danger-button" : "ghost-button"}" data-next-review="${days}">${label}</button>`).join("")}
    </div>
  `, (modal) => {
    modal.querySelectorAll("[data-next-review]").forEach((button) => {
      button.addEventListener("click", () => {
        const days = Number(button.dataset.nextReview);
        review.count = (review.count || 0) + 1;
        review.status = days === 0 ? "encerrada" : "feita";
        if (days > 0) {
          state.reviews.push({ ...review, id: idFor("r"), dueDate: addDaysISO(days), status: "pendente" });
        }
        saveState();
        closeModal();
        showToast("Revisão atualizada.");
        render();
      });
    });
  });
}

function openSubjectModal(subjectId = null, forceBase = false, ownerIdOverride = null) {
  const ownerId = ownerIdOverride || studentId();
  const subject = subjectId ? subjectById(subjectId) : { name: "", color: "#25d4c8", isBase: forceBase };
  openModal(`
    <div class="panel-header"><div><h3>${subjectId ? "Editar matéria" : "Nova matéria"}</h3><p>${subject.isBase ? "Catálogo base global" : "Matéria privada do estudante"}</p></div><button class="icon-button" data-close-modal>X</button></div>
    <form id="subject-form" class="form-grid">
      <label>Nome<input name="name" value="${subject.name}" required></label>
      <label>Cor<input name="color" type="color" value="${subject.color || "#25d4c8"}"></label>
      <button class="primary-button" type="submit">Salvar matéria</button>
    </form>
  `, (modal) => {
    modal.querySelector("#subject-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const submitButton = event.target.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      if (subjectId) {
        Object.assign(subject, { name: data.get("name"), color: data.get("color") });
      } else {
        const id = idFor("s");
        state.subjects.push({ id, name: data.get("name"), color: data.get("color"), isBase: forceBase, ownerId: forceBase ? null : ownerId });
        state.userSubjects[ownerId] = unique([...(state.userSubjects[ownerId] || []), id]);
        const profile = profileFor(ownerId);
        profile.extraInterests = unique([...(profile.extraInterests || []), id]);
        profile.interests = unique([...(profile.interests || []), id]);
        state.subjectsActiveSubjectId ||= {};
        state.subjectsActiveSubjectId[ownerId] = id;
      }
      await saveStateNow();
      closeModal();
      render();
    });
  });
}

function openTopicModal(subjectId = null, topicId = null, forceBase = false) {
  const subject = subjectById(subjectId);
  const topicOwnerId = forceBase ? null : (subject.ownerId || studentId());
  const topicIsBase = forceBase || Boolean(subject.isBase && !subject.ownerId);
  const topic = topicId ? topicById(topicId) : { title: "", subjectId, order: topicsForSubject(subjectId).length + 1, suggestedMinutes: 45, isBase: topicIsBase };
  openModal(`
    <div class="panel-header"><div><h3>${topicId ? "Editar tópico" : "Novo tópico"}</h3><p>${subjectById(topic.subjectId).name}</p></div><button class="icon-button" data-close-modal>X</button></div>
    <form id="topic-form" class="form-grid">
      <label>Título<input name="title" value="${topic.title}" required></label>
      <div class="grid cols-2">
        <label>Ordem<input name="order" type="number" min="1" value="${topic.order}" required></label>
        <label>Tempo sugerido<input name="suggestedMinutes" type="number" min="5" value="${topic.suggestedMinutes}" required></label>
      </div>
      <button class="primary-button" type="submit">Salvar tópico</button>
    </form>
  `, (modal) => {
    modal.querySelector("#topic-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const submitButton = event.target.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      if (topicId) {
        Object.assign(topic, { title: data.get("title"), order: Number(data.get("order")), suggestedMinutes: Number(data.get("suggestedMinutes")) });
      } else {
        const id = idFor("t");
        state.topics.push({
          id,
          subjectId,
          title: data.get("title"),
          order: Number(data.get("order")),
          suggestedMinutes: Number(data.get("suggestedMinutes")),
          isBase: topicIsBase,
          ownerId: topicIsBase ? null : topicOwnerId
        });
        state.users.filter((user) => user.role === "student").forEach((user) => initializeUserTopics(user.id));
      }
      await saveStateNow();
      closeModal();
      render();
    });
  });
}

function deleteSubject(id) {
  const subject = subjectById(id);
  if (!canEdit(subject)) return showToast("Matérias base não podem ser excluídas pelo estudante.");
  state.subjects = state.subjects.filter((item) => item.id !== id);
  state.topics = state.topics.filter((topic) => topic.subjectId !== id);
  Object.keys(state.userSubjects).forEach((userId) => state.userSubjects[userId] = state.userSubjects[userId].filter((subjectId) => subjectId !== id));
  saveState();
  render();
}

function deleteTopic(id) {
  const topic = topicById(id);
  if (!canEdit(topic)) return showToast("Tópicos base não podem ser excluídos pelo estudante.");
  state.topics = state.topics.filter((item) => item.id !== id);
  Object.keys(state.userTopics).forEach((userId) => delete state.userTopics[userId][id]);
  saveState();
  render();
}

function openUserModal(userId = null) {
  const user = userId ? state.users.find((item) => item.id === userId) : { name: "", email: "", role: "student", status: "active", accessExpiresAt: addDaysISO(30) };
  openModal(`
    <div class="panel-header"><div><h3>${userId ? "Editar usuário" : "Novo usuário"}</h3><p>Controle administrativo de acesso e validade do login</p></div><button class="icon-button" data-close-modal>X</button></div>
    <form id="user-form" class="form-grid">
      <div class="grid cols-2">
        <label>Nome<input name="name" value="${user.name}" required></label>
        <label>Login<input name="email" type="email" value="${user.email}" required></label>
        <label>Senha<input name="password" type="password" value="" ${userId ? 'placeholder="Preencha somente se quiser trocar"' : "required"} autocomplete="new-password"></label>
        <label>Perfil<select name="role">${options(["student", "admin"], user.role)}</select></label>
        <label>Status<select name="status">${options(["active", "inactive"], user.status)}</select></label>
        <label>Tempo de acesso
          <select name="accessPreset">
            ${options(["manter", "7 dias", "30 dias", "90 dias", "180 dias", "365 dias", "vitalicio", "manual"], userId ? "manter" : "30 dias")}
          </select>
        </label>
        <label>Vence em<input name="accessExpiresAt" type="date" value="${user.accessExpiresAt || ""}"></label>
      </div>
      <div class="notice">Se o acesso vencer, o estudante não conseguirá fazer login. Administradores podem ficar com acesso vitalício.</div>
      <button class="primary-button" type="submit">Salvar usuário</button>
    </form>
  `, (modal) => {
    modal.querySelector("#user-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.target).entries());
      if (!values.password) delete values.password;
      values.accessExpiresAt = resolveAccessExpiration(values.accessPreset, values.accessExpiresAt, user.accessExpiresAt);
      delete values.accessPreset;
      if (userId) Object.assign(user, values);
      else {
        const id = idFor("u");
        state.users.push({ id, ...values });
        if (values.role === "student") {
          state.profiles[id] = { ...structuredClone(state.profiles["u-ana"]), studentName: values.name, interests: ["s-mat", "s-por"] };
          state.userSubjects[id] = ["s-mat", "s-por"];
          state.themes[id] = structuredClone(state.themes["u-ana"]);
          initializeUserTopics(id);
        }
      }
      saveState();
      closeModal();
      render();
    });
  });
}

function deleteUser(id) {
  state.users = state.users.filter((user) => user.id !== id);
  delete state.profiles[id];
  delete state.userSubjects[id];
  delete state.userTopics[id];
  delete state.themes[id];
  state.sessions = state.sessions.filter((session) => session.userId !== id);
  state.reviews = state.reviews.filter((review) => review.userId !== id);
  saveState();
  render();
}

function openModal(markup, bind) {
  closeTimer();
  const root = $("#modal-root");
  root.innerHTML = `<section class="modal-card">${markup}</section>`;
  root.classList.remove("hidden");
  root.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
  bind?.(root);
}

function closeModal() {
  closeTimer();
  $("#modal-root").classList.add("hidden");
  $("#modal-root").innerHTML = "";
}

function showOnboardingSlides(id) {
  const profile = profileFor(id);
  const contest = activeContestFor(id);
  openPrismIntro({
    mappedSubjects: profile.interests.length || 0,
    mappedDays: profile.days.length || 0,
    progress: contestProgress(id, contest).percent,
    focus: contest?.role || "aprovação"
  }, () => {
    state.onboardingCompleted ||= {};
    state.onboardingCompleted[id] = true;
    profileFor(id).onboardingCompleted = true;
    state.route = "dashboard";
    saveState();
    closeModal();
    render();
  });
}

function openPrismIntro(summary, onFinish) {
  openModal(`
    <div class="prism-intro" role="dialog" aria-label="Introdução Prisma Estudos">
      <div class="prism-scene" aria-hidden="true">
        <span class="light-beam"></span>
        <span class="prism-core"></span>
        <span class="spectrum spectrum-cyan"></span>
        <span class="spectrum spectrum-blue"></span>
        <span class="spectrum spectrum-violet"></span>
        <span class="spectrum spectrum-rose"></span>
      </div>
      <div class="intro-phrases" aria-label="Sequência de entrada">
        <span>Organize.</span>
        <span>Planeje.</span>
        <span>Evolua.</span>
        <span>Conquiste.</span>
      </div>
      <div class="intro-brand">
        <img src="assets/prisma-estudos-logo.png" alt="Prisma Estudos">
        <strong>Prisma Estudos</strong>
        <small>${summary.mappedSubjects} matéria(s), ${summary.mappedDays} dia(s) e ${summary.progress}% do edital já mapeado para ${summary.focus}.</small>
      </div>
      <button class="primary-button intro-start" id="intro-start">Entrar no painel</button>
    </div>
  `, (modal) => {
    const finish = () => onFinish();
    modal.querySelector("#intro-start").addEventListener("click", finish);
    setTimeout(() => modal.querySelector("#intro-start")?.focus(), 2600);
  });
}

function maybeShowWeeklyReview() {
  if (!state.currentUserId || isAdmin() || requiresProfileSetup()) return;
  const day = today.getDay();
  if (![0, 6].includes(day)) return;
  const weekKey = `${today.getFullYear()}-${getWeekNumber(today)}`;
  state.weeklyReviewSeen ||= {};
  if (state.weeklyReviewSeen[state.currentUserId] === weekKey) return;
  state.weeklyReviewSeen[state.currentUserId] = weekKey;
  saveState();
  setTimeout(() => showWeeklyReviewSlides(state.currentUserId, weekKey), 500);
}

function showWeeklyReviewSlides(id, weekKey) {
  const stats = getStats(id);
  const sessions = sessionsFor(id).filter((session) => daysBetween(session.date, isoToday) < 7);
  const topics = unique(sessions.map((session) => session.topicId)).length;
  const subjects = unique(sessions.map((session) => subjectById(session.subjectId).name));
  const slides = [
    { title: "Retrospectiva Da Semana", body: `Você estudou ${formatMinutes(stats.weekMinutes)} nos últimos 7 dias.`, stat: formatMinutes(stats.weekMinutes), label: "Estudados" },
    { title: "Matérias Estudadas", body: subjects.length ? subjects.join(", ") : "Ainda não houve estudo registrado nesta semana.", stat: subjects.length, label: "Matérias" },
    { title: "Tópicos Avançados", body: `${topics} tópico(s) movimentaram seu edital nesta semana.`, stat: topics, label: "Tópicos" },
    { title: "Metas E Constância", body: `Sua sequência atual é de ${stats.streak} dia(s). ${motivation(stats.streak)}`, stat: `${stats.streak}d`, label: "Sequência" }
  ];
  openSlideDeck("Sua Semana De Estudos", slides, () => {
    state.weeklyReviewSeen ||= {};
    state.weeklyReviewSeen[id] = weekKey;
    saveState();
    closeModal();
  });
}

function openSlideDeck(title, slides, onFinish) {
  let index = 0;
  const renderSlide = () => {
    openModal(`
      <div class="slide-deck slide-theme-${(index % 4) + 1}">
        <span class="eyebrow">${title}</span>
        <strong class="slide-stat">${slides[index].stat || index + 1}</strong>
        <small class="slide-label">${slides[index].label || "Prisma Estudos"}</small>
        <h2>${slides[index].title}</h2>
        <p>${slides[index].body}</p>
        <div class="slide-progress">${slides.map((_, itemIndex) => `<span class="${itemIndex <= index ? "active" : ""}"></span>`).join("")}</div>
        ${index === slides.length - 1 ? `<strong class="slide-final-phrase">Pare de planejar. Comece a executar.</strong>` : ""}
        <div class="actions">
          ${index > 0 ? `<button class="ghost-button" id="slide-prev">Voltar</button>` : ""}
          <button class="primary-button" id="slide-next">${index === slides.length - 1 ? "Iniciar" : "Próximo"}</button>
        </div>
      </div>
    `, (modal) => {
      modal.querySelector("#slide-prev")?.addEventListener("click", () => {
        index -= 1;
        renderSlide();
      });
      modal.querySelector("#slide-next").addEventListener("click", () => {
        if (index === slides.length - 1) onFinish();
        else {
          index += 1;
          renderSlide();
        }
      });
    });
  };
  renderSlide();
}

function nextStudy(id) {
  initializeUserTopics(id);
  const profile = profileFor(id);
  const contest = activeContestFor(id);
  const weak = new Set(weakSubjects(id).map((subject) => subject.id));
  const recovery = recoveryPlan(id);
  const subjects = contest?.subjects?.length ? unique([...contest.subjects, ...(profile.extraInterests || [])]) : profile.interests?.length ? profile.interests : state.userSubjects[id] || [];
  const topic = state.topics
    .filter((item) => subjects.includes(item.subjectId) && visibleTopic(item, id))
    .sort((a, b) => {
      if (recovery.active) return a.suggestedMinutes - b.suggestedMinutes;
      const weakDelta = Number(weak.has(b.subjectId)) - Number(weak.has(a.subjectId));
      if (weakDelta) return weakDelta;
      if (profile.mixSubjects) return a.order - b.order || subjectById(a.subjectId).name.localeCompare(subjectById(b.subjectId).name);
      return subjects.indexOf(a.subjectId) - subjects.indexOf(b.subjectId) || a.order - b.order;
    })
    .find((item) => {
      const userTopic = state.userTopics[id]?.[item.id];
      return userTopic?.unlocked && userTopic.status !== "concluido";
    });
  if (!topic) return null;
  const userTopic = state.userTopics[id][topic.id];
  return { ...topic, status: userTopic.status, progress: userTopic.progress };
}

function initializeUserTopics(id) {
  state.userTopics[id] ||= {};
  visibleSubjects(id).forEach((subject) => {
    const topics = topicsForSubject(subject.id).sort((a, b) => a.order - b.order);
    topics.forEach((topic, index) => {
      state.userTopics[id][topic.id] ||= { status: "pendente", progress: 0, unlocked: index === 0, completedAt: null };
      syncCompletedTopicChecklist(state.userTopics[id][topic.id]);
    });
  });
}

function ensureUserTopic(id, topicId) {
  state.userTopics[id] ||= {};
  state.userTopics[id][topicId] ||= { status: "pendente", progress: 0, unlocked: true, completedAt: null };
  syncCompletedTopicChecklist(state.userTopics[id][topicId]);
}

function syncCompletedTopicChecklist(userTopic) {
  if (userTopic.status !== "concluido") return;
  userTopic.theoryRead = true;
  userTopic.summaryDone = true;
  userTopic.exercisesDone = true;
  userTopic.progress = 100;
}

function unlockNextTopic(id, topic) {
  const next = topicsForSubject(topic.subjectId).sort((a, b) => a.order - b.order).find((item) => item.order > topic.order);
  if (next) {
    ensureUserTopic(id, next.id);
    state.userTopics[id][next.id].unlocked = true;
  }
}

function getStats(id) {
  initializeUserTopics(id);
  const sessions = sessionsFor(id);
  const userTopics = Object.values(state.userTopics[id] || {});
  const totalMinutes = sessions.reduce((sum, session) => sum + session.studiedMinutes, 0);
  const todayMinutes = sessions.filter((session) => session.date === isoToday).reduce((sum, session) => sum + session.studiedMinutes, 0);
  const weekMinutes = sessions.filter((session) => daysBetween(session.date, isoToday) < 7).reduce((sum, session) => sum + session.studiedMinutes, 0);
  const completed = userTopics.filter((topic) => topic.status === "concluido").length;
  const pending = userTopics.filter((topic) => topic.status !== "concluido").length;
  const pendingReviews = reviewsFor(id).filter((review) => review.status === "pendente").length;
  const bySubject = groupMinutesBySubject(sessions);
  const topSubject = Object.entries(bySubject).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sem dados";
  const weekly = {};
  for (let i = 6; i >= 0; i -= 1) {
    const date = addDaysISO(-i);
    weekly[new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(new Date(`${date}T12:00:00`))] = sessions.filter((session) => session.date === date).reduce((sum, session) => sum + session.studiedMinutes, 0);
  }
  return { totalMinutes, todayMinutes, weekMinutes, completed, pending, pendingReviews, bySubject, weekly, topSubject, streak: streakFor(sessions) };
}

function adminStats() {
  const students = state.users.filter((user) => user.role === "student");
  const activeStudents = students.filter((user) => user.status === "active" && isUserAccessActive(user));
  const expiredUsers = students.filter((user) => user.status === "active" && !isUserAccessActive(user)).length;
  const expiringSoon = activeStudents.filter((user) => {
    const days = accessDaysLeft(user);
    return days !== null && days <= 7;
  }).length;
  const weeklyActiveUsers = students.filter((user) => sessionsFor(user.id).some((session) => daysBetween(session.date, isoToday) < 7)).length;
  const avgMinutesPerStudent = students.length ? Math.round(state.sessions.reduce((sum, session) => sum + session.studiedMinutes, 0) / students.length) : 0;
  const avgCompletion = students.length ? Math.round(students.reduce((sum, user) => sum + completionRateFor(user.id), 0) / students.length) : 0;
  return {
    activeUsers: activeStudents.length,
    studentUsers: students.length,
    expiredUsers,
    expiringSoon,
    weeklyActiveUsers,
    avgMinutesPerStudent,
    avgCompletion,
    totalMinutes: state.sessions.reduce((sum, session) => sum + session.studiedMinutes, 0),
    completed: Object.values(state.userTopics).flatMap((topics) => Object.values(topics)).filter((topic) => topic.status === "concluido").length,
    pendingReviews: state.reviews.filter((review) => review.status === "pendente").length
  };
}

function energyForToday(id) {
  return state.dailyEnergy?.[id]?.[isoToday] || null;
}

function setEnergyForToday(id, energy) {
  state.dailyEnergy ||= {};
  state.dailyEnergy[id] ||= {};
  state.dailyEnergy[id][isoToday] = energy;
  saveState();
}

function energyRecommendation(energy) {
  const messages = {
    baixa: "Carga reduzida: priorize revisões curtas e um conteúdo leve.",
    média: "Plano normal: siga o estudo do dia e mantenha constância.",
    alta: "Energia alta: você pode fazer um bloco extra ou atacar tópico mais difícil."
  };
  return messages[energy] || "Escolha sua energia para ajustar o plano.";
}

function weeklyComparison(id) {
  const current = periodStats(id, 0, 6);
  const previous = periodStats(id, 7, 13);
  const minutesDeltaPct = previous.minutes ? Math.round(((current.minutes - previous.minutes) / previous.minutes) * 100) : current.minutes ? 100 : 0;
  const performanceDelta = current.performance - previous.performance;
  return {
    current,
    previous,
    minutes: { deltaPct: minutesDeltaPct },
    days: { delta: current.days - previous.days },
    reviews: { delta: current.reviews - previous.reviews },
    performance: { delta: performanceDelta },
    message: comparisonMessage(minutesDeltaPct, current.days - previous.days),
    performanceMessage: performanceDelta < 0
      ? `Seu aproveitamento caiu ${Math.abs(performanceDelta)}%. Revise os tópicos fracos.`
      : performanceDelta > 0
        ? `Seu aproveitamento subiu ${performanceDelta}%. Continue nessa direção.`
        : "Seu aproveitamento se manteve estável."
  };
}

function periodStats(id, startDaysAgo, endDaysAgo) {
  const sessions = sessionsFor(id).filter((session) => {
    const diff = daysBetween(session.date, isoToday);
    return diff >= startDaysAgo && diff <= endDaysAgo;
  });
  const dates = new Set(sessions.map((session) => session.date));
  const reviews = reviewsFor(id).filter((review) => {
    const completed = review.completedAt || (review.status !== "pendente" ? review.dueDate : null);
    if (!completed) return false;
    const diff = daysBetween(completed, isoToday);
    return diff >= startDaysAgo && diff <= endDaysAgo;
  }).length;
  const performance = sessions.length ? Math.round((sessions.filter((session) => session.result === "concluido").length / sessions.length) * 100) : 0;
  return {
    minutes: sessions.reduce((sum, session) => sum + session.studiedMinutes, 0),
    days: dates.size,
    reviews,
    performance
  };
}

function comparisonMessage(minutesDeltaPct, dayDelta) {
  if (minutesDeltaPct > 0) return `Você estudou ${minutesDeltaPct}% mais que semana passada.`;
  if (minutesDeltaPct < 0) return `Você estudou ${Math.abs(minutesDeltaPct)}% menos que semana passada.`;
  if (dayDelta === 0) return "Você manteve a mesma constância.";
  return dayDelta > 0 ? `Você estudou em ${dayDelta} dia(s) a mais.` : `Você estudou em ${Math.abs(dayDelta)} dia(s) a menos.`;
}

function recoveryPlan(id) {
  const last = sessionsFor(id).sort((a, b) => b.date.localeCompare(a.date))[0];
  const daysIdle = last ? daysBetween(last.date, isoToday) : 0;
  const overdue = reviewBuckets(id).overdue.length;
  const active = daysIdle >= 1 || overdue > 0;
  const actions = [];
  if (overdue) actions.push(`Faça ${Math.min(overdue, 2)} revisão(ões) atrasada(s) antes de conteúdo novo.`);
  if (daysIdle >= 2) actions.push("Execute apenas 1 bloco leve hoje para retomar sem pressão.");
  else if (daysIdle === 1) actions.push("Faça uma retomada curta para proteger a sequência.");
  actions.push("O restante do plano fica em espera para não sobrecarregar.");
  return {
    active,
    daysIdle,
    overdue,
    message: overdue
      ? `Você tem ${overdue} revisão(ões) atrasada(s). Priorizei a recuperação.`
      : daysIdle >= 2
        ? `Você ficou ${daysIdle} dias sem estudar. Reorganizei seu plano para voltar sem pressão.`
        : "Um dia sem estudar acontece. Hoje é só retomar com leveza.",
    actions: actions.slice(0, 3)
  };
}

function formatDelta(value, suffix) {
  const number = value ?? 0;
  if (number > 0) return `+${number}${suffix}`;
  return `${number}${suffix}`;
}

function groupMinutesBySubject(sessions) {
  return sessions.reduce((acc, session) => {
    const subject = subjectById(session.subjectId).name;
    acc[subject] = (acc[subject] || 0) + session.studiedMinutes;
    return acc;
  }, {});
}

function subjectPerformance(id) {
  return visibleSubjects(id).map((subject) => {
    const progress = subjectProgress(id, subject.id);
    const minutes = sessionsFor(id).filter((session) => session.subjectId === subject.id).reduce((sum, session) => sum + session.studiedMinutes, 0);
    const pendingReviews = reviewsFor(id).filter((review) => review.subjectId === subject.id && review.status === "pendente").length;
    return { ...subject, score: progress.percent, minutes, pendingReviews };
  });
}

function weakSubjects(id) {
  return subjectPerformance(id).filter((subject) => subject.score < 70 || subject.pendingReviews > 0).sort((a, b) => a.score - b.score || b.pendingReviews - a.pendingReviews);
}

function strongSubjects(id) {
  return subjectPerformance(id).filter((subject) => subject.score >= 70).sort((a, b) => b.score - a.score || b.minutes - a.minutes);
}

function strengthBoard(id) {
  const strong = strongSubjects(id).slice(0, 3);
  const weak = weakSubjects(id).slice(0, 3);
  return `
    <div class="strength-board">
      <div><h4>Fortes</h4>${strong.map((subject) => `<span class="tag">${subject.name} · ${subject.score}%</span>`).join("") || `<p class="muted">Ainda coletando dados.</p>`}</div>
      <div><h4>Reforçar</h4>${weak.map((subject) => `<span class="tag">${subject.name} · ${subject.score}%</span>`).join("") || `<p class="muted">Nenhum ponto crítico agora.</p>`}</div>
    </div>
  `;
}

function previousPerformance(topicId, userId = studentId()) {
  const sessions = sessionsFor(userId).filter((session) => session.topicId === topicId);
  if (!sessions.length) return "sem registro";
  const last = sessions[sessions.length - 1];
  if (last.result === "concluido") return "bom";
  if (last.result === "parcial") return "parcial";
  return "reforçar";
}

function streakFor(sessions) {
  const studiedDays = new Set(sessions.map((session) => session.date));
  let count = 0;
  for (let i = 0; i < 90; i += 1) {
    if (!studiedDays.has(addDaysISO(-i))) break;
    count += 1;
  }
  return count;
}

function visibleSubjects(id) {
  const profile = profileFor(id);
  const contest = activeContestFor(id);
  const selected = contest?.subjects?.length
    ? new Set([...(contest.subjects || []), ...(profile.extraInterests || [])])
    : new Set(state.userSubjects[id] || []);
  return dedupeSubjectsByName(
    state.subjects
      .filter((subject) => subject.isBase || subject.ownerId === id)
      .filter((subject) => selected.size === 0 || selected.has(subject.id) || subject.ownerId === id)
  );
}

function availableSubjects(id) {
  return state.subjects.filter((subject) => subject.isBase || subject.ownerId === id);
}

function dedupeSubjectsByName(subjects) {
  const map = new Map();
  subjects.forEach((subject) => {
    const key = subject.name.toLocaleLowerCase("pt-BR");
    if (!map.has(key)) map.set(key, subject);
  });
  return [...map.values()];
}

function visibleTopic(topic, id) {
  return topic.isBase || topic.ownerId === id || subjectById(topic.subjectId)?.ownerId === id;
}

function canEdit(item) {
  return isAdmin() || (!item.isBase && item.ownerId === studentId());
}

function isUserAccessActive(user) {
  if (!user || user.status !== "active") return false;
  if (user.role === "admin") return true;
  if (!user.accessExpiresAt) return true;
  return daysBetween(isoToday, user.accessExpiresAt) >= 0;
}

function accessDaysLeft(user) {
  if (!user?.accessExpiresAt) return null;
  return daysBetween(isoToday, user.accessExpiresAt);
}

function accessLabel(user) {
  if (user.status !== "active") return "inativo";
  if (user.role === "admin" || !user.accessExpiresAt) return "acesso vitalício";
  const days = accessDaysLeft(user);
  if (days < 0) return `expirado há ${Math.abs(days)} dia(s)`;
  if (days === 0) return "vence hoje";
  return `${days} dia(s) restantes`;
}

function accessBadge(user) {
  const status = !isUserAccessActive(user) ? "status-nao-concluido" : accessDaysLeft(user) !== null && accessDaysLeft(user) <= 7 ? "status-parcial" : "status-concluido";
  return `<span class="status-pill ${status}">${accessLabel(user)}</span>`;
}

function accessSortValue(user) {
  if (!user.accessExpiresAt) return Number.MAX_SAFE_INTEGER;
  return accessDaysLeft(user);
}

function resolveAccessExpiration(preset, manualDate, currentDate) {
  if (preset === "manter") return currentDate || null;
  if (preset === "vitalicio") return null;
  if (preset === "manual") return manualDate || null;
  const days = Number(String(preset).split(" ")[0]);
  return Number.isFinite(days) ? addDaysISO(days) : manualDate || currentDate || null;
}

function completionRateFor(id) {
  initializeUserTopics(id);
  const userTopics = Object.values(state.userTopics[id] || {});
  if (!userTopics.length) return 0;
  return Math.round((userTopics.filter((topic) => topic.status === "concluido").length / userTopics.length) * 100);
}

function lastStudyLabel(id) {
  const last = sessionsFor(id).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!last) return "sem estudo";
  const days = daysBetween(last.date, isoToday);
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  return `${days} dias atrás`;
}

function profileFor(id) {
  state.profiles[id] ||= structuredClone(seedState.profiles["u-ana"]);
  state.profiles[id].contests = unique([...(state.profiles[id].contests || []).filter((contestId) => !legacyContestIds.has(contestId)), ...defaultContestIds]);
  if (!state.profiles[id].activeContestId || !state.contests.some((contest) => contest.id === state.profiles[id].activeContestId)) {
    state.profiles[id].activeContestId = state.profiles[id].contests.find((contestId) => defaultContestIds.includes(contestId)) || defaultActiveContestId;
  }
  const activeContest = contestById(state.profiles[id].activeContestId);
  if (activeContest?.subjects?.length) {
    state.userSubjects[id] = unique([...(state.userSubjects[id] || []), ...activeContest.subjects]);
    state.profiles[id].interests = unique([...(state.profiles[id].interests || []), ...activeContest.subjects]);
  }
  state.profiles[id].extraInterests ||= [];
  state.profiles[id].configured ||= false;
  return state.profiles[id];
}

function themeFor(id) {
  const saved = state.themes[id] || {};
  const presetKey = saved.preset || (saved.mode === "light" ? "light" : "dark");
  const preset = themePresets[presetKey] || themePresets.dark;
  state.themes[id] = {
    ...preset,
    cardStyle: "soft",
    density: "normal",
    ...saved,
    preset: presetKey
  };
  return state.themes[id];
}

function applyTheme() {
  const theme = themeFor(studentId());
  document.body.classList.remove("light-theme");
  document.body.classList.toggle("card-glass", theme.cardStyle === "glass");
  document.body.classList.toggle("card-solid", theme.cardStyle === "solid");
  document.body.classList.toggle("density-compact", theme.density === "compact");
  document.body.classList.toggle("density-comfortable", theme.density === "comfortable");
  const vars = {
    bg: "--bg",
    panel: "--panel",
    panel2: "--panel-2",
    card: "--card",
    cardSoft: "--card-soft",
    text: "--text",
    muted: "--muted",
    line: "--line",
    primary: "--primary",
    secondary: "--secondary",
    danger: "--danger",
    success: "--success",
    warning: "--warning"
  };
  Object.entries(vars).forEach(([key, variable]) => {
    if (theme[key]) document.documentElement.style.setProperty(variable, theme[key]);
  });
}

function renderNotifications() {
  const box = $("#notifications");
  const id = studentId();
  const due = reviewsFor(id).filter((review) => review.status === "pendente" && review.dueDate <= isoToday).length;
  box.innerHTML = `
    <div class="notice">Você tem ${due} revisão(ões) pendente(s) para hoje.</div>
    <div class="notice">${phraseOfDay()}</div>
  `;
  box.classList.toggle("hidden");
}

function showDailyMotivation() {
  if (!state.currentUserId || isAdmin() || requiresProfileSetup()) return;
  const box = $("#notifications");
  box.innerHTML = `<div class="notice daily-phrase"><span class="tag">Frase do dia</span><strong>${phraseOfDay()}</strong></div>`;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 7200);
}

function showToast(message) {
  const box = $("#notifications");
  box.innerHTML = `<div class="notice">${message}</div>`;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 2800);
}

function playTone(freq, duration, delay = 0) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.frequency.value = freq;
  oscillator.type = "sine";
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + delay + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(ctx.currentTime + delay);
  oscillator.stop(ctx.currentTime + delay + duration + 0.03);
}

function exportCSV(id) {
  const rows = [["data", "materia", "topico", "planejado_min", "estudado_min", "resultado"], ...sessionsFor(id).map((session) => [
    session.date,
    subjectById(session.subjectId).name,
    topicById(session.topicId).title,
    session.plannedMinutes,
    session.studiedMinutes,
    session.result
  ])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `prisma-estudos-historico-${id}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function htmlElement(markup, bind) {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  const element = template.content.firstElementChild;
  bind?.(element);
  return element;
}

function metric(label, value, caption = "") {
  return `<article class="metric-card"><span>${label}</span><strong>${value}</strong>${caption ? `<small>${caption}</small>` : ""}</article>`;
}

function emptyState(title, message, icon = "calendar-days") {
  return `
    <div class="empty-state">
      <span class="empty-state-icon">${iconSvg(icon)}</span>
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;
}

function barChart(data, maxFallback = null) {
  const entries = Object.entries(data);
  const max = maxFallback || Math.max(1, ...entries.map(([, value]) => value));
  if (!entries.length) return `<p class="muted">Sem dados ainda.</p>`;
  return `<div class="chart">${entries.map(([label, value]) => `
    <div class="bar-row"><span>${label}</span><div class="bar"><span style="--value:${Math.max(4, Math.round((value / max) * 100))}%"></span></div><small>${value} min</small></div>
  `).join("")}</div>`;
}

function calendar(id) {
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const offset = first.getDay();
  let cells = "";
  for (let i = 0; i < offset; i += 1) cells += `<div></div>`;
  for (let day = 1; day <= lastDay; day += 1) {
    const date = toISODate(new Date(today.getFullYear(), today.getMonth(), day));
    const sessions = sessionsFor(id).filter((session) => session.date === date);
    const reviews = reviewsFor(id).filter((review) => review.dueDate === date || review.completedAt === date);
    const minutes = sessions.reduce((sum, session) => sum + session.studiedMinutes, 0);
    const performance = sessions.length ? Math.round((sessions.filter((session) => session.result === "concluido").length / sessions.length) * 100) : 0;
    const tooltip = `${formatDate(date)} | ${minutes} min | ${reviews.length} revisão(ões) | ${performance}% aproveitamento`;
    cells += `
      <div class="day-cell ${sessions.length ? "has-study" : ""} ${reviews.length ? "has-review" : ""}" title="${tooltip}">
        <strong>${day}</strong>
        ${sessions.length ? `<small>${minutes} min</small>` : ""}
        ${reviews.length ? `<small>${reviews.length} revisão(ões)</small>` : ""}
      </div>
    `;
  }
  return `<div class="calendar">${cells}</div>`;
}

function options(items, selected) {
  return items.map((item) => `<option value="${item}" ${item === selected ? "selected" : ""}>${titleText(item)}</option>`).join("");
}

function subjectProgress(id, subjectId) {
  const topics = topicsForSubject(subjectId);
  const completed = topics.filter((topic) => state.userTopics[id]?.[topic.id]?.status === "concluido").length;
  const total = topics.length || 1;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

function toggleTopicField(userId, topicId, field, control = null) {
  ensureUserTopic(userId, topicId);
  state.userTopics[userId][topicId][field] = !state.userTopics[userId][topicId][field];
  state.userTopics[userId][topicId].progress = topicChecklistProgress(state.userTopics[userId][topicId]);
  control?.classList.toggle("done", Boolean(state.userTopics[userId][topicId][field]));
  const row = control?.closest("tr");
  const progressPill = row?.querySelector("td:last-child .status-pill");
  if (progressPill) progressPill.textContent = `${state.userTopics[userId][topicId].progress}%`;
  saveState();
}

function toggleTopicSelection(userId, topicId, selected) {
  ensureUserTopic(userId, topicId);
  state.userTopics[userId][topicId].unlocked = selected;
  if (!selected && state.userTopics[userId][topicId].status !== "concluido") {
    state.userTopics[userId][topicId].progress = 0;
  }
  saveState();
}

function topicChecklistProgress(userTopic) {
  const checks = ["theoryRead", "summaryDone", "exercisesDone"];
  const done = checks.filter((field) => userTopic[field]).length;
  return Math.max(userTopic.progress || 0, Math.round((done / checks.length) * 70));
}

function reviewDots(userId, topicId) {
  const total = reviewsFor(userId).filter((review) => review.topicId === topicId && review.status !== "pendente").length;
  return Array.from({ length: 6 }, (_, index) => `<span class="${index < total ? "done" : ""}">${index + 1}ª</span>`).join("");
}

function relatedTopics(topic) {
  const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\W+/).filter((word) => word.length > 4);
  const words = new Set(normalize(topic.title));
  return topicsForSubject(topic.subjectId)
    .filter((item) => item.id !== topic.id && normalize(item.title).some((word) => words.has(word)))
    .slice(0, 2)
    .map((item) => `Relacionado: ${item.title}`);
}

function subjectById(id) {
  return state.subjects.find((subject) => subject.id === id) || { name: "Matéria removida", color: "#999" };
}

function topicById(id) {
  return state.topics.find((topic) => topic.id === id) || { title: "Tópico removido", subjectId: "missing", suggestedMinutes: 30, order: 1 };
}

function topicsForSubject(subjectId) {
  return state.topics.filter((topic) => topic.subjectId === subjectId);
}

function sessionsFor(id) {
  return state.sessions.filter((session) => session.userId === id);
}

function reviewsFor(id) {
  return state.reviews.filter((review) => review.userId === id);
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}min`;
  if (!m) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatClock(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days));
  return toISODate(date);
}

function daysAgo(days) {
  return addDaysISO(-days);
}

function daysBetween(a, b) {
  return Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);
}

function idFor(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function unique(values) {
  return [...new Set(values)];
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function titleText(text) {
  return String(text)
    .split(" ")
    .map((word) => word ? word[0].toUpperCase() + word.slice(1) : "")
    .join(" ");
}

function getWeekNumber(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);
}

function statusLabel(status) {
  const labels = {
    pendente: "Pendente",
    "em-andamento": "Em Andamento",
    concluido: "Concluído",
    concluida: "Concluída",
    "nao-concluido": "Não Concluído",
    parcial: "Parcial",
    feita: "Feita",
    encerrada: "Encerrada"
  };
  return labels[status] || status;
}

function motivation(streak) {
  if (streak >= 7) return "Sua sequência está sólida; mantenha o bloco de hoje simples e bem feito.";
  if (streak >= 3) return "Você já criou tração; hoje é dia de proteger o ritmo.";
  return "Comece pelo próximo tópico disponível e deixe o sistema carregar a organização.";
}
