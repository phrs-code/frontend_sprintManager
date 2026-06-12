document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("editTaskForm");
    const errorMessageElement = document.getElementById('error-message');

    const titleInput = document.getElementById("taskTitle");
    const descriptionInput = document.getElementById("taskDescription");
    const statusSelect = document.getElementById("status");
    const categorySelect = document.getElementById("category");
    const prioritySelect = document.getElementById("priority");

    const API_URL = "http://localhost:5000";

    // 1. Extraindo o ID da tarefa da URL (ex: /edit_task.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("id");

    const showMessage = (message, isError = true) => {
        errorMessageElement.textContent = message;
        errorMessageElement.style.color = isError ? "#d9534f" : "#5cb85c";
    };

    // Se não houver ID na URL, avisa o usuário e bloqueia o formulário
    if (!taskId) {
        showMessage("Erro: ID da tarefa não encontrado.");
        form.querySelector('button[type="submit"]').disabled = true;
        return;
    }

    // 2. Função para carregar os dados atuais da tarefa e preencher os inputs
    const loadTaskData = async () => {
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`);
            
            if (!response.ok) {
                throw new Error("Não foi possível carregar os dados da tarefa.");
            }

            const task = await response.json();

            // Preenche o formulário com os dados vindos da API
            titleInput.value = task.title;
            descriptionInput.value = task.description;
            statusSelect.value = task.status;
            categorySelect.value = task.category;
            prioritySelect.value = task.priority;

        } catch (error) {
            console.error("Erro ao carregar a tarefa:", error);
            showMessage(error.message);
        }
    };

    // Chama a função de carregamento assim que a página abre
    await loadTaskData();

    // 3. Evento para ATUALIZAR a tarefa (método PUT)
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const taskData = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            status: statusSelect.value,
            category: categorySelect.value,
            priority: prioritySelect.value,
        };

        if (!taskData.title || !taskData.description || !taskData.status || !taskData.category || !taskData.priority) {
            showMessage("Nenhum campo pode estar em branco.");
            return;
        }

        showMessage("Atualizando...", false);

        try {
        
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar a tarefa. Tente novamente.");
            }

            showMessage("Tarefa atualizada com sucesso!", false);
            
        } catch (error) {
            console.error("Erro na requisição PUT:", error);
            showMessage(error.message);
        }
    });
});