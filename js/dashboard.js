const API_URL = "http://localhost:5000";

const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName") || "Admin";

let allTasks = [];
let currentFilteredTasks = []; // NOVA: Guarda apenas as tarefas que passaram no filtro
let visibleTasksCount = 3; // NOVA: Quantidade de tarefas visíveis na tela

const userNameElement = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filters button");
const searchInput = document.getElementById("searchInput");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadMoreContainer = document.getElementById("loadMoreContainer");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressTasks = document.getElementById("progressTasks");
const doneTasks = document.getElementById("doneTasks");

if (!token) {
  window.location.href = "login.html";
}

userNameElement.textContent = userName;

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  window.location.href = "login.html";
});

function normalizeStatus(status = "") {
  return status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function updateMetrics(tasks) {
  const total = tasks.length;
  const pendentes = tasks.filter((task) => normalizeStatus(task.status).includes("pendente")).length;
  const andamento = tasks.filter((task) => normalizeStatus(task.status).includes("andamento")).length;
  const concluidas = tasks.filter((task) => normalizeStatus(task.status).includes("conclu")).length;

  totalTasks.textContent = total;
  pendingTasks.textContent = pendentes;
  progressTasks.textContent = andamento;
  doneTasks.textContent = concluidas;
}

// Função auxiliar para definir a cor da prioridade com base no texto
function getPriorityClass(priority = "") {
  const p = priority.toLowerCase();
  if (p.includes("alta")) return "high";
  if (p.includes("média") || p.includes("media")) return "medium";
  return "low";
}

// Função auxiliar para definir a cor do status com base no texto
function getStatusClass(status = "") {
  const s = normalizeStatus(status);
  if (s.includes("pendente")) return "pending";
  if (s.includes("andamento")) return "progress";
  if (s.includes("conclui")) return "done";
  return "";
}

// Nova função renderTasks ajustada para a estrutura de Tabela
// Função renderTasks refatorada
function renderTasks() {
  taskList.innerHTML = "";

  if (!currentFilteredTasks.length) {
    taskList.innerHTML = '<tr><td colspan="6" class="empty-message" style="text-align: center; padding: 20px;">Nenhuma tarefa encontrada.</td></tr>';
    if (loadMoreContainer) loadMoreContainer.style.display = "none";
    return;
  }

  // Pega apenas a "fatia" de tarefas até o limite atual
  const tasksToShow = currentFilteredTasks.slice(0, visibleTasksCount);

  tasksToShow.forEach((task) => {
    const title = task.titulo || task.title || "Tarefa sem título";
    const description = task.descricao || task.description || "Sem descrição informada.";
    const category = task.categoria || task.category || "Geral";
    const priority = task.prioridade || task.priority || "Baixa";
    const deadline = task.data_limite || task.deadline || "-";
    const status = task.status || "Pendente";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <strong>${title}</strong>
        <small>${description}</small>
      </td>
      <td><span class="tag">${category}</span></td>
      <td><span class="priority ${getPriorityClass(priority)}">${priority}</span></td>
      <td>${deadline}</td>
      <td><span class="status ${getStatusClass(status)}">${status}</span></td>
      <td style="cursor: pointer; opacity: 0.7;">✏️ 🗑️</td>
    `;

    taskList.appendChild(tr);
  });

  // Mostra ou esconde o botão de "Carregar Mais"
  if (currentFilteredTasks.length > visibleTasksCount) {
    loadMoreContainer.style.display = "block";
  } else {
    loadMoreContainer.style.display = "none";
  }
}

// Cérebro unificado de filtros
function applyFilters() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const activeButton = document.querySelector(".filters button.active");
  const filterType = activeButton ? activeButton.textContent.trim().toLowerCase() : "todos";

  currentFilteredTasks = allTasks.filter((task) => {
    let matchesStatus = true;
    if (filterType === "pendentes") {
      matchesStatus = normalizeStatus(task.status).includes("pendente");
    } else if (filterType === "andamento") {
      matchesStatus = normalizeStatus(task.status).includes("andamento");
    } else if (filterType === "concluídos") {
      matchesStatus = normalizeStatus(task.status).includes("conclu");
    }

    let matchesText = true;
    if (searchTerm !== "") {
      const title = (task.titulo || task.title || "").toLowerCase();
      const desc = (task.descricao || task.description || "").toLowerCase();
      matchesText = title.includes(searchTerm) || desc.includes(searchTerm);
    }

    return matchesStatus && matchesText;
  });

  // Toda vez que o filtro muda, voltamos a mostrar apenas 3
  visibleTasksCount = 3;
  renderTasks();
}

// Evento do botão Carregar Mais
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    visibleTasksCount += 3; // Aumenta o limite em 3
    renderTasks(); // Renderiza novamente com o novo limite
  });
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

// 2. Aciona o filtro toda vez que um botão for clicado
filterButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    // Remove a classe 'active' de todos os botões
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    
    // Adiciona a classe 'active' apenas no botão que foi clicado
    e.target.classList.add("active");
    
    // Roda a lógica de filtro (que também reseta a paginação)
    applyFilters();
  });
});

async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error("Erro ao carregar tarefas.");
    }

    const tasks = await response.json();
    allTasks = tasks; // Armazena as tarefas localmente para facilitar o filtro
    updateMetrics(tasks);
    applyFilters();
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    taskList.innerHTML = '<p class="empty-message">Não foi possível carregar as tarefas. Verifique se o backend está rodando.</p>';
  }
}

loadTasks();
