document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "http://localhost:5000";
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName") || "Admin";

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

    function getMostUsed(tasks, field) {
        const count = {};

        tasks.forEach((task) => {
            const value = task[field] || "Não informado";
            count[value] = (count[value] || 0) + 1;
        });

        const entries = Object.entries(count);

        if (entries.length === 0) return "-";

        entries.sort((a, b) => b[1] - a[1]);

        return entries[0][0];
    }

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

        const pendentes = tasks.filter((task) =>
            normalizeStatus(task.status).includes("pendente")
        ).length;

        const andamento = tasks.filter((task) =>
            normalizeStatus(task.status).includes("andamento")
        ).length;

        const concluidas = tasks.filter((task) =>
            normalizeStatus(task.status).includes("conclu")
        ).length;

        const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;

        const categoriaMaisUsada = getMostUsed(tasks, "categoria");
        const prioridadeMaisUsada = getMostUsed(tasks, "prioridade");

        document.getElementById("reportTotalTasks").textContent = total;
        document.getElementById("reportCompletionRate").textContent = `${taxaConclusao}%`;
        document.getElementById("reportPendingTasks").textContent = pendentes;
        document.getElementById("reportDoneTasks").textContent = concluidas;
        
        document.getElementById("summaryTotal").textContent = total;
        document.getElementById("summaryPending").textContent = pendentes;
        document.getElementById("summaryProgress").textContent = andamento;
        document.getElementById("summaryDone").textContent = concluidas;
        document.getElementById("summaryCategory").textContent = categoriaMaisUsada;
        document.getElementById("summaryPriority").textContent = prioridadeMaisUsada;

        document.getElementById("progressBar").style.width = `${taxaConclusao}%`;
        document.getElementById("progressText").textContent = `${taxaConclusao}% concluído`;
        
        document.getElementById("generatedAt").textContent = new Date().toLocaleString("pt-BR", {
        dateStyle: "full",
        timeStyle: "short"
        });

    } catch (error) {
        console.error("Erro ao carregar relatório:", error);
        alert("Não foi possível carregar os dados do relatório.");
    }

    document.getElementById("exportPdfBtn").addEventListener("click", () => {
        document.title = `Relatorio_SprintManager_${new Date()
            .toLocaleDateString("pt-BR")
            .replace(/\//g, "-")}`;

        window.print();
    });
});