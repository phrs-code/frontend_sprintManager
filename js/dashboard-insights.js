document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Admin";

  let statusChartInstance = null;
  let categoryChartInstance = null;
  let priorityChartInstance = null;

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const userNameElement = document.getElementById("userName");
  if (userNameElement) userNameElement.textContent = userName;

  function normalizeStatus(status = "") {
    return status
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function countByField(tasks, field) {
    const result = {};

    tasks.forEach((task) => {
      const value = task[field] || "Não informado";
      result[value] = (result[value] || 0) + 1;
    });

    return result;
  }

  function getMostUsed(data) {
    const entries = Object.entries(data);

    if (entries.length === 0) return "-";

    entries.sort((a, b) => b[1] - a[1]);

    return entries[0][0];
  }

  function calculateAverageCompletionTime(tasks) {
    const completedWithDates = tasks.filter((task) => {
      return (
        normalizeStatus(task.status).includes("concl") &&
        task.createdAt &&
        task.updatedAt
      );
    });

    if (completedWithDates.length === 0) return "-";

    const totalHours = completedWithDates.reduce((sum, task) => {
      const created = new Date(task.createdAt);
      const updated = new Date(task.updatedAt);

      const diffHours = (updated - created) / (1000 * 60 * 60);

      return sum + diffHours;
    }, 0);

    const average = totalHours / completedWithDates.length;

    if (average < 24) {
      return `${average.toFixed(1)}h`;
    }

    return `${(average / 24).toFixed(1)} dias`;
  }

  function createCharts(tasks) {
    const pendentes = tasks.filter((task) =>
      normalizeStatus(task.status).includes("pendente")
    ).length;

    const andamento = tasks.filter((task) =>
      normalizeStatus(task.status).includes("andamento")
    ).length;

    const concluidas = tasks.filter((task) =>
      normalizeStatus(task.status).includes("concl")
    ).length;

    const completedTasks = tasks.filter((task) =>
      normalizeStatus(task.status).includes("concl")
    );

    const statusCanvas = document.getElementById("statusChart");
    const categoryCanvas = document.getElementById("categoryChart");
    const priorityCanvas = document.getElementById("priorityChart");

    if (statusChartInstance) statusChartInstance.destroy();
    if (categoryChartInstance) categoryChartInstance.destroy();
    if (priorityChartInstance) priorityChartInstance.destroy();

    statusChartInstance = new Chart(statusCanvas, {
      type: "doughnut",
      data: {
        labels: ["Pendentes", "Em andamento", "Concluídas"],
        datasets: [
          {
            data: [pendentes, andamento, concluidas],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    const categoryData = countByField(completedTasks, "categoria");

    categoryChartInstance = new Chart(categoryCanvas, {
      type: "bar",
      data: {
        labels: Object.keys(categoryData),
        datasets: [
          {
            label: "Tarefas concluídas",
            data: Object.values(categoryData),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    const priorityData = countByField(completedTasks, "prioridade");

    priorityChartInstance = new Chart(priorityCanvas, {
      type: "bar",
      data: {
        labels: Object.keys(priorityData),
        datasets: [
          {
            label: "Tarefas concluídas",
            data: Object.values(priorityData),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    return {
      pendentes,
      andamento,
      concluidas,
      categoryData,
      priorityData,
    };
  }

  async function loadDashboard() {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar tarefas.");
      }

      const tasks = await response.json();

      const total = tasks.length;

      const {
        concluidas,
        categoryData,
        priorityData,
      } = createCharts(tasks);

      const taxaConclusao =
        total > 0 ? Math.round((concluidas / total) * 100) : 0;

      const tempoMedio = calculateAverageCompletionTime(tasks);
      const totalCategoriasConcluidas = Object.keys(categoryData).length;
      const prioridadeMaisConcluida = getMostUsed(priorityData);

      document.getElementById("completionRate").textContent = `${taxaConclusao}%`;
      document.getElementById("averageCompletionTime").textContent = tempoMedio;
      document.getElementById("completedCategoriesCount").textContent = totalCategoriasConcluidas;
      document.getElementById("topCompletedPriority").textContent = prioridadeMaisConcluida;

      document.getElementById("completedInsight").textContent = `${taxaConclusao}%`;
      document.getElementById("mainInsightText").textContent =
        `As tarefas concluídas estão distribuídas em ${totalCategoriasConcluidas} categorias, com prioridade ${prioridadeMaisConcluida} aparecendo com maior frequência.`;

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      alert("Não foi possível carregar os dados do dashboard.");
    }
  }

  await loadDashboard();
});