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
function getPriorityClass(priority = "") {
  const p = priority.toLowerCase();
  if (p.includes("alta")) return "high";
  if (p.includes("média") || p.includes("media")) return "medium";
  return "low";
}

function getStatusClass(status = "") {
  const s = normalizeStatus(status);
  if (s.includes("pendente")) return "pending";
  if (s.includes("andamento")) return "progress";
  if (s.includes("conclui")) return "done";
  return "";
}

function renderTasks() {
  taskList.innerHTML = "";

  if (!currentFilteredTasks.length) {
    taskList.innerHTML = '<tr><td colspan="6" class="empty-message" style="text-align: center; padding: 20px;">Nenhuma tarefa encontrada.</td></tr>';
    if (loadMoreContainer) loadMoreContainer.style.display = "none";
    return;
  }

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
      <td style="font-size: 16px;">
        <a href="./update_task.html?id=${task._id || task.id}" style="text-decoration: none; margin-right: 12px; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" title="Editar Tarefa">✏️</a>
        
        <span onclick="deleteTask('${task._id || task.id}')" style="cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" title="Excluir Tarefa">🗑️</span>
    `;

    taskList.appendChild(tr);
  });


  if (currentFilteredTasks.length > visibleTasksCount) {
    loadMoreContainer.style.display = "block";
  } else {
    loadMoreContainer.style.display = "none";
  }
}

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

  visibleTasksCount = 3;
  renderTasks();
}


if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    visibleTasksCount += 3;
    renderTasks();
  });
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}


filterButtons.forEach((button) => {
  button.addEventListener("click", (e) => {

    filterButtons.forEach((btn) => btn.classList.remove("active"));

    e.target.classList.add("active");

    applyFilters();
  });
});


async function deleteTask(taskId) {

  const isConfirmed = confirm("Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.");

  if (!isConfirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 204 || response.ok) {
      alert("Tarefa excluída com sucesso!");


      loadTasks();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Falha ao excluir a tarefa.");
    }
  } catch (error) {
    console.error("Erro ao deletar:", error);
    alert(`Ocorreu um erro: ${error.message}`);
  }
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
    allTasks = tasks;
    updateMetrics(tasks);
    applyFilters();
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    taskList.innerHTML = '<p class="empty-message">Não foi possível carregar as tarefas. Verifique se o backend está rodando.</p>';
  }

  const openTaskDrawer = document.getElementById("openTaskDrawer");
  const closeTaskDrawer = document.getElementById("closeTaskDrawer");
  const cancelTaskDrawer = document.getElementById("cancelTaskDrawer");
  const taskDrawer = document.getElementById("taskDrawer");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerTaskForm = document.getElementById("drawerTaskForm");

  function openDrawer() {
    taskDrawer.classList.add("open");
    drawerOverlay.classList.add("open");
    taskDrawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    taskDrawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
    taskDrawer.setAttribute("aria-hidden", "true");
  }

  openTaskDrawer.addEventListener("click", openDrawer);
  closeTaskDrawer.addEventListener("click", closeDrawer);
  cancelTaskDrawer.addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);

  drawerTaskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const saveButton = drawerTaskForm.querySelector(".drawer-save");

    saveButton.disabled = true;
    saveButton.textContent = "Salvando...";

    const taskData = {
      titulo: document.getElementById("drawerTaskTitle").value.trim(),
      descricao: document.getElementById("drawerDescription").value.trim(),
      categoria: document.getElementById("drawerCategory").value,
      prioridade: document.getElementById("drawerPriority").value,
      status: document.getElementById("drawerStatus").value,
      data_limite: document.getElementById("drawerDeadline").value,
    };

    if (
      !taskData.titulo ||
      !taskData.descricao ||
      !taskData.categoria ||
      !taskData.prioridade ||
      !taskData.status
    ) {
      alert("Preencha todos os campos obrigatórios.");
      saveButton.disabled = false;
      saveButton.textContent = "Salvar ✓";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar tarefa.");
      }

      drawerTaskForm.reset();
      closeDrawer();
      await loadTasks();

      alert("Tarefa criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      alert(`Erro ao criar tarefa: ${error.message}`);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Salvar ✓";
    }
  });
}

loadTasks();
