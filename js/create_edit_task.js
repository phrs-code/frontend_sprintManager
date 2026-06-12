document.addEventListener("DOMContentLoaded", () => {

    const createForm = document.getElementById("createEditTaskForm");
    const clearButton = document.getElementById("clearButton");
    const errorMessageElement = document.getElementById('error-message');

    const titleInput = document.getElementById("taskTitle");
    const descriptionInput = document.getElementById("taskDescription");
    const statusSelect = document.getElementById("status");
    const categorySelect = document.getElementById("category");
    const prioritySelect = document.getElementById("priority");

    const API_URL = "http://localhost:5000";

    const showMessage = (message, isError = true) => {
        errorMessageElement.textContent = message;
        errorMessageElement.style.color = isError ? "#d9534f" : "#5cb85c";
    };

    clearButton.addEventListener("click", () => {
        createForm.reset();
        errorMessageElement.textContent = "";
    });

    createForm.addEventListener("submit", async (event) => {
    
        event.preventDefault();

        const taskData = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            status: statusSelect.value,
            category: categorySelect.value,
            priority: prioritySelect.value,
        };

        if (!taskData.title || !taskData.description || !taskData.status || !taskData.category || !taskData.priority) {
            showMessage("Preencha todos os campos.");
            return;
        }

        showMessage("Salvando...", false);

        try {

        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        });

    
        if (!response.ok) {
        
            throw new Error("Erro ao salvar a tarefa. Tente novamente.");
        }

        const responseData = await response.json();
        console.log("Tarefa salva com sucesso:", responseData);


        showMessage("Tarefa criada com sucesso!", false);
        createForm.reset();

        } catch (error) {
        console.error("Erro na requisição:", error);
        showMessage(error.message);
        }
  });
})