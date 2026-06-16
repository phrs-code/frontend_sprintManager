document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Admin";

  const userNameElement = document.getElementById("userName");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  if (userNameElement) {
    userNameElement.textContent = userName;
  }

  async function loadTasks() {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar tarefas.");
    }

    return await response.json();
  }

  function normalizeStatus(status = "") {
    return status
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function countBy(tasks, field) {
    return tasks.reduce((acc, task) => {
      const value = task[field] || "Não informado";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function createChart(canvasId, type, labels, data) {
    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    new Chart(canvas, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: "Quantidade",
            data,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#e5e7eb",
            },
          },
        },
        scales:
          type === "bar"
            ? {
                x: {
                  ticks: { color: "#e5e7eb" },
                  grid: { color: "rgba(255,255,255,0.08)" },
                },
                y: {
                  ticks: { color: "#e5e7eb" },
                  grid: { color: "rgba(255,255,255,0.08)" },
                },
              }
            : {},
      },
    });
  }

  try {
    const tasks = await loadTasks();

    const total = tasks.length;
    const pendentes = tasks.filter((task) =>
      normalizeStatus(task.status).includes("pendente")
    ).length;
    const andamento = tasks.filter((task) =>
      normalizeStatus(task.status).includes("andamento")
    ).length;
    const concluidas = tasks.filter((task) =>
      normalizeStatus(task.status).includes("conclu")
    ).length;

    document.getElementById("dashboardTotalTasks").textContent = total;
    document.getElementById("dashboardPendingTasks").textContent = pendentes;
    document.getElementById("dashboardProgressTasks").textContent = andamento;
    document.getElementById("dashboardDoneTasks").textContent = concluidas;

    const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    document.getElementById("completionPercent").textContent = `${percentual}%`;

    const statusData = {
      Pendentes: pendentes,
      "Em andamento": andamento,
      Concluídas: concluidas,
    };

    const categoryData = countBy(tasks, "categoria");
    const priorityData = countBy(tasks, "prioridade");

    createChart(
      "statusChart",
      "doughnut",
      Object.keys(statusData),
      Object.values(statusData)
    );

    createChart(
      "categoryChart",
      "bar",
      Object.keys(categoryData),
      Object.values(categoryData)
    );

    createChart(
      "priorityChart",
      "bar",
      Object.keys(priorityData),
      Object.values(priorityData)
    );
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    alert("Não foi possível carregar os dados do dashboard.");
  }
});