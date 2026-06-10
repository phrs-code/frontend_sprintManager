const API_URL = "http://localhost:5000";

const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName") || "Admin";

const userNameElement = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");
const taskList = document.getElementById("taskList");

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

function renderTasks(tasks) {
  taskList.innerHTML = "";

  if (!tasks.length) {
    taskList.innerHTML = '<p class="empty-message">Nenhuma tarefa encontrada para este usuário.</p>';
    return;
  }

  tasks.forEach((task) => {
    const title = task.titulo || task.title || "Tarefa sem título";
    const description = task.descricao || task.description || "Sem descrição informada.";
    const status = task.status || "Sem status";
    const priority = task.prioridade || task.priority || "Sem prioridade";

    const article = document.createElement("article");
    article.className = "task-item";

    article.innerHTML = `
      <header>
        <h3>${title}</h3>
        <span class="badge">${status}</span>
      </header>
      <p>${description}</p>
      <small>Prioridade: ${priority}</small>
    `;

    taskList.appendChild(article);
  });
}

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
    updateMetrics(tasks);
    renderTasks(tasks);
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    taskList.innerHTML = '<p class="empty-message">Não foi possível carregar as tarefas. Verifique se o backend está rodando.</p>';
  }
}

loadTasks();
