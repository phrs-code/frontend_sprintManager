document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("editTaskForm");
  const errorMessageElement = document.getElementById("error-message");

  const titleInput = document.getElementById("taskTitle");
  const descriptionInput = document.getElementById("taskDescription");
  const statusSelect = document.getElementById("status");
  const categorySelect = document.getElementById("category");
  const prioritySelect = document.getElementById("priority");

  const API_URL = "http://localhost:5000";
  const token = localStorage.getItem("token");

  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("id");

  function showMessage(message, isError = true) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.color = isError ? "#d9534f" : "#5cb85c";
  }

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  if (!taskId) {
    showMessage("Erro: ID da tarefa não encontrado.");
    form.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  async function loadTaskData() {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar os dados da tarefa.");
      }

      const task = await response.json();

      titleInput.value = task.titulo || "";
      descriptionInput.value = task.descricao || "";
      statusSelect.value = task.status || "pendente";
      categorySelect.value = task.categoria || "Desenvolvimento";
      prioritySelect.value = task.prioridade || "baixa";
    } catch (error) {
      console.error("Erro ao carregar a tarefa:", error);
      showMessage(error.message);
    }
  }

  await loadTaskData();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const taskData = {
      titulo: titleInput.value.trim(),
      descricao: descriptionInput.value.trim(),
      status: statusSelect.value,
      categoria: categorySelect.value,
      prioridade: prioritySelect.value,
    };

    if (
      !taskData.titulo ||
      !taskData.descricao ||
      !taskData.status ||
      !taskData.categoria ||
      !taskData.prioridade
    ) {
      showMessage("Nenhum campo pode estar em branco.");
      return;
    }

    showMessage("Atualizando...", false);

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar a tarefa. Tente novamente.");
      }

      showMessage("Tarefa atualizada com sucesso!", false);

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);
    } catch (error) {
      console.error("Erro na requisição PUT:", error);
      showMessage(error.message);
    }
  });
});