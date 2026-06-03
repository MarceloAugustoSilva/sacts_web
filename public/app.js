const API_BASE = "/api";

const resources = {
  appointments: {
    title: "Agendamentos",
    endpoint: "/appointments",
    fields: [
      { name: "patient", label: "Paciente", type: "select", source: "patients", required: true },
      { name: "driver", label: "Motorista", type: "select", source: "drivers", required: true },
      { name: "vehicle", label: "Veículo", type: "select", source: "vehicles", required: true },
      { name: "origin", label: "Origem", type: "text", required: true },
      { name: "destination", label: "Destino", type: "text", required: true },
      { name: "date", label: "Data e horário", type: "datetime-local", required: true },
      { name: "status", label: "Status", type: "select", options: ["agendado", "em_andamento", "concluido", "cancelado"], required: true },
      // Quilometragem em km — usada pelo relatório para calcular o total percorrido.
      { name: "km", label: "Quilometragem (km)", type: "number", min: 0, step: "0.1" },
      { name: "notes", label: "Observações", type: "textarea" }
    ],
    titleOf: item => `${item.patient?.name || "Paciente"} → ${item.destination}`,
    metaOf: item => [
      `Data: ${formatDate(item.date)}`,
      `Motorista: ${item.driver?.name || "-"}`,
      `Veículo: ${item.vehicle?.plate || "-"}`,
      `Origem: ${item.origin}`,
      `Km: ${item.km ? Number(item.km).toLocaleString("pt-BR") : "0"}`
    ]
  },
  patients: {
    title: "Pacientes",
    endpoint: "/patients",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "sus", label: "Cartão SUS", type: "text", required: true },
      { name: "phone", label: "Telefone", type: "text", required: true },
      { name: "city", label: "Cidade", type: "text", required: true },
      { name: "status", label: "Status", type: "select", options: ["ativo", "inativo"], required: true }
    ],
    titleOf: item => item.name,
    metaOf: item => [`SUS: ${item.sus}`, `Telefone: ${item.phone}`, `Cidade: ${item.city}`]
  },
  drivers: {
    title: "Motoristas",
    endpoint: "/drivers",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "cnh", label: "CNH", type: "text", required: true },
      { name: "phone", label: "Telefone", type: "text", required: true },
      { name: "status", label: "Status", type: "select", options: ["ativo", "inativo"], required: true }
    ],
    titleOf: item => item.name,
    metaOf: item => [`CNH: ${item.cnh}`, `Telefone: ${item.phone}`]
  },
  vehicles: {
    title: "Veículos",
    endpoint: "/vehicles",
    fields: [
      { name: "plate", label: "Placa", type: "text", required: true },
      { name: "model", label: "Modelo", type: "text", required: true },
      { name: "capacity", label: "Capacidade", type: "number", required: true },
      { name: "status", label: "Status", type: "select", options: ["disponivel", "manutencao", "inativo"], required: true }
    ],
    titleOf: item => `${item.plate} - ${item.model}`,
    metaOf: item => [`Capacidade: ${item.capacity}`, `Status: ${label(item.status)}`]
  }
};

const state = {
  token: localStorage.getItem("sacts_token"),
  user: JSON.parse(localStorage.getItem("sacts_user") || "null"),
  mode: "login",
  current: "appointments",
  editing: null,
  data: { appointments: [], patients: [], drivers: [], vehicles: [] }
};

const el = {
  authScreen: document.querySelector("#authScreen"),
  dashboard: document.querySelector("#dashboard"),
  authForm: document.querySelector("#authForm"),
  authTitle: document.querySelector("#authTitle"),
  authSubtitle: document.querySelector("#authSubtitle"),
  authButton: document.querySelector("#authButton"),
  toggleAuth: document.querySelector("#toggleAuth"),
  nameGroup: document.querySelector("#nameGroup"),
  nameInput: document.querySelector("#nameInput"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  userName: document.querySelector("#userName"),
  logoutButton: document.querySelector("#logoutButton"),
  seedButton: document.querySelector("#seedButton"),
  tabs: document.querySelectorAll(".tab"),
  formTitle: document.querySelector("#formTitle"),
  listTitle: document.querySelector("#listTitle"),
  listSubtitle: document.querySelector("#listSubtitle"),
  resourceForm: document.querySelector("#resourceForm"),
  records: document.querySelector("#records"),
  cancelEdit: document.querySelector("#cancelEdit"),
  searchInput: document.querySelector("#searchInput"),
  toast: document.querySelector("#toast"),
  loader: document.querySelector("#loader"),
  // Elementos da nova aba de relatórios
  crudView: document.querySelector("#crudView"),
  reportsView: document.querySelector("#reportsView"),
  metricGrid: document.querySelector("#metricGrid"),
  statusChart: document.querySelector("#statusChart"),
  driversChart: document.querySelector("#driversChart"),
  vehiclesChart: document.querySelector("#vehiclesChart"),
  reloadReports: document.querySelector("#reloadReports")
};

function tokenHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...tokenHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) logout(false);
    throw new Error(data.message || "Erro ao processar solicitação");
  }

  return data;
}

function setLoading(active) {
  el.loader.classList.toggle("hidden", !active);
}

function toast(message, type = "success") {
  el.toast.textContent = message;
  el.toast.className = `toast ${type}`;
  setTimeout(() => el.toast.classList.add("hidden"), 3200);
}

function label(value) {
  return String(value || "").replaceAll("_", " ");
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function toInputDate(date) {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function setAuthMode(mode) {
  state.mode = mode;
  const register = mode === "register";
  el.authTitle.textContent = register ? "Criar conta" : "Entrar";
  el.authSubtitle.textContent = register ? "Cadastre-se para acessar o SACTS" : "Acesse sua conta para continuar";
  el.authButton.textContent = register ? "Registrar" : "Entrar";
  el.toggleAuth.textContent = register ? "Já tenho uma conta" : "Criar nova conta";
  el.nameGroup.classList.toggle("hidden", !register);
}

function saveSession(data) {
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem("sacts_token", data.token);
  localStorage.setItem("sacts_user", JSON.stringify(data.user));
}

function logout(show = true) {
  state.token = null;
  state.user = null;
  localStorage.removeItem("sacts_token");
  localStorage.removeItem("sacts_user");
  el.dashboard.classList.add("hidden");
  el.authScreen.classList.remove("hidden");
  if (show) toast("Sessão encerrada");
}

async function handleAuth(event) {
  event.preventDefault();

  const payload = {
    email: el.emailInput.value.trim(),
    password: el.passwordInput.value
  };

  if (state.mode === "register") payload.name = el.nameInput.value.trim();

  if (!payload.email || !payload.password || (state.mode === "register" && !payload.name)) {
    return toast("Preencha os campos obrigatórios", "error");
  }

  if (payload.password.length < 6) {
    return toast("A senha deve ter pelo menos 6 caracteres", "error");
  }

  try {
    setLoading(true);
    const data = await api(state.mode === "register" ? "/auth/register" : "/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    saveSession(data);
    await startDashboard();
    toast(state.mode === "register" ? "Conta criada com sucesso" : "Login realizado");
  } catch (error) {
    toast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function startDashboard() {
  el.authScreen.classList.add("hidden");
  el.dashboard.classList.remove("hidden");
  el.userName.textContent = state.user?.name || "Usuário";
  await loadAll();
  renderResource();
}

async function loadAll() {
  const entries = await Promise.all(Object.entries(resources).map(async ([key, resource]) => {
    const data = await api(resource.endpoint);
    return [key, data];
  }));

  state.data = Object.fromEntries(entries);
}

function renderResource() {
  // Marca a aba ativa em qualquer caso (inclusive para "reports").
  el.tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.resource === state.current));

  // Caso especial: aba de relatórios não usa o CRUD padrão.
  if (state.current === "reports") {
    el.crudView.classList.add("hidden");
    el.reportsView.classList.remove("hidden");
    loadReports();
    return;
  }

  el.reportsView.classList.add("hidden");
  el.crudView.classList.remove("hidden");

  const resource = resources[state.current];
  el.formTitle.textContent = state.editing ? `Editar ${resource.title}` : `Novo ${resource.title.slice(0, -1)}`;
  el.listTitle.textContent = resource.title;
  el.listSubtitle.textContent = `${state.data[state.current].length} registro(s) encontrado(s)`;
  el.cancelEdit.classList.toggle("hidden", !state.editing);
  renderForm();
  renderList();
}

// Rótulos amigáveis para os status do agendamento.
const STATUS_LABELS = {
  agendado: "Agendado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado"
};

// Busca o resumo no backend e desenha os indicadores.
async function loadReports() {
  try {
    setLoading(true);
    const report = await api("/reports/summary");
    renderReports(report);
  } catch (error) {
    toast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function renderReports(report) {
  const { totals, byStatus, driversRanking, vehiclesRanking } = report;

  // Cards numéricos com os principais totais.
  const cards = [
    { label: "Total de viagens", value: totals.appointments },
    { label: "Pacientes transportados", value: totals.patientsTransported },
    { label: "Quilometragem total", value: `${Number(totals.totalKm || 0).toLocaleString("pt-BR")} km` },
    { label: "Frota cadastrada", value: totals.vehicles }
  ];

  el.metricGrid.innerHTML = cards.map(card => `
    <div class="metric-card">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(String(card.value))}</strong>
    </div>
  `).join("");

  // Gráfico de barras simples (puro HTML/CSS) para status.
  const statusItems = Object.entries(byStatus).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key,
    trips: value
  }));
  el.statusChart.innerHTML = renderBars(statusItems);

  // Top 5 motoristas e veículos para não poluir a tela.
  el.driversChart.innerHTML = renderBars(driversRanking.slice(0, 5));
  el.vehiclesChart.innerHTML = renderBars(vehiclesRanking.slice(0, 5));
}

// Recebe uma lista de { name, trips } e devolve um HTML com barras proporcionais.
function renderBars(items) {
  if (!items || !items.length) {
    return `<p class="record-meta">Sem dados para exibir.</p>`;
  }
  // O maior valor define a largura máxima (100%) para escalar as outras barras.
  const max = Math.max(...items.map(i => i.trips), 1);
  return items.map(item => {
    const percent = Math.round((item.trips / max) * 100);
    return `
      <div class="bar-row">
        <span class="bar-label">${escapeHtml(item.name)}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${percent}%"></div>
        </div>
        <span class="bar-value">${item.trips}</span>
      </div>
    `;
  }).join("");
}

function renderForm() {
  const resource = resources[state.current];
  const item = state.editing;

  el.resourceForm.innerHTML = resource.fields.map(field => {
    const value = normalizeValue(item, field);
    const required = field.required ? "required" : "";

    if (field.type === "select") {
      const options = getOptions(field, value);
      return `<label class="field"><span>${field.label}</span><select name="${field.name}" ${required}>${options}</select></label>`;
    }

    if (field.type === "textarea") {
      return `<label class="field"><span>${field.label}</span><textarea name="${field.name}" ${required}>${escapeHtml(value)}</textarea></label>`;
    }

    // Atributos extras opcionais (min, step) para campos numéricos.
    const extra = [
      field.min !== undefined ? `min="${field.min}"` : "",
      field.step !== undefined ? `step="${field.step}"` : ""
    ].join(" ");
    return `<label class="field"><span>${field.label}</span><input name="${field.name}" type="${field.type}" value="${escapeHtml(value)}" ${extra} ${required}></label>`;
  }).join("") + `<div class="form-actions"><button class="primary-btn" type="submit">${item ? "Salvar alterações" : "Cadastrar"}</button></div>`;
}

function normalizeValue(item, field) {
  if (!item) return field.type === "select" && field.options ? field.options[0] : "";
  const value = item[field.name];

  if (field.type === "datetime-local") return toInputDate(value);
  if (value && typeof value === "object" && value._id) return value._id;
  return value ?? "";
}

function getOptions(field, current) {
  if (field.options) {
    return field.options.map(option => `<option value="${option}" ${current === option ? "selected" : ""}>${label(option)}</option>`).join("");
  }

  return `<option value="">Selecione</option>` + state.data[field.source].map(item => {
    const text = item.name || item.plate || item.model;
    return `<option value="${item._id}" ${current === item._id ? "selected" : ""}>${escapeHtml(text)}</option>`;
  }).join("");
}

function renderList() {
  const resource = resources[state.current];
  const term = el.searchInput.value.trim().toLowerCase();
  const records = state.data[state.current].filter(item => JSON.stringify(item).toLowerCase().includes(term));

  if (!records.length) {
    el.records.innerHTML = `<div class="record-card"><p class="record-meta">Nenhum registro encontrado.</p></div>`;
    return;
  }

  el.records.innerHTML = records.map(item => `
    <article class="record-card">
      <div class="record-main">
        <div>
          <h3 class="record-title">${escapeHtml(resource.titleOf(item))}</h3>
          <p class="record-meta">${resource.metaOf(item).map(escapeHtml).join("<br>")}</p>
        </div>
        <span class="status">${label(item.status)}</span>
      </div>
      <div class="record-actions">
        <button class="secondary-btn" type="button" data-action="edit" data-id="${item._id}">Editar</button>
        <button class="danger-btn" type="button" data-action="delete" data-id="${item._id}">Excluir</button>
      </div>
    </article>
  `).join("");
}

async function handleSave(event) {
  event.preventDefault();

  const resource = resources[state.current];
  const formData = new FormData(el.resourceForm);
  const payload = Object.fromEntries(formData.entries());

  for (const field of resource.fields) {
    if (field.required && !String(payload[field.name] || "").trim()) {
      return toast(`Preencha: ${field.label}`, "error");
    }
  }

  try {
    setLoading(true);
    const path = state.editing ? `${resource.endpoint}/${state.editing._id}` : resource.endpoint;
    const method = state.editing ? "PUT" : "POST";

    await api(path, { method, body: JSON.stringify(payload) });
    state.editing = null;
    await loadAll();
    renderResource();
    toast(method === "POST" ? "Registro cadastrado" : "Registro atualizado");
  } catch (error) {
    toast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function handleRecordClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;
  const resource = resources[state.current];

  if (action === "edit") {
    state.editing = state.data[state.current].find(item => item._id === id);
    renderResource();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (action === "delete") {
    const ok = confirm("Deseja excluir este registro?");
    if (!ok) return;

    try {
      setLoading(true);
      await api(`${resource.endpoint}/${id}`, { method: "DELETE" });
      await loadAll();
      renderResource();
      toast("Registro excluído");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }
}

async function seedDemo() {
  try {
    setLoading(true);
    await api("/seed", { method: "POST" });
    await loadAll();
    renderResource();
    toast("Dados demo carregados");
  } catch (error) {
    toast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

el.authForm.addEventListener("submit", handleAuth);
el.toggleAuth.addEventListener("click", () => setAuthMode(state.mode === "login" ? "register" : "login"));
el.logoutButton.addEventListener("click", () => logout(true));
el.seedButton.addEventListener("click", seedDemo);
el.resourceForm.addEventListener("submit", handleSave);
el.records.addEventListener("click", handleRecordClick);
el.searchInput.addEventListener("input", renderList);
el.cancelEdit.addEventListener("click", () => {
  state.editing = null;
  renderResource();
});

el.tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    state.current = tab.dataset.resource;
    state.editing = null;
    if (el.searchInput) el.searchInput.value = "";
    renderResource();
  });
});

// Botão "Atualizar" da aba de relatórios — busca os dados novamente.
if (el.reloadReports) {
  el.reloadReports.addEventListener("click", loadReports);
}

(async function init() {
  if (!state.token) return;

  try {
    setLoading(true);
    const data = await api("/auth/me");
    state.user = data.user;
    await startDashboard();
  } catch (error) {
    logout(false);
  } finally {
    setLoading(false);
  }
})();
