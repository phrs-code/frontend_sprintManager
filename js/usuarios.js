document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Admin";

  const userNameElement = document.getElementById("userName");
  const usersList = document.getElementById("usersList");
  const searchUserInput = document.getElementById("searchUserInput");

  let allUsers = [];

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  if (userNameElement) {
    userNameElement.textContent = userName;
  }

  function normalizeText(text = "") {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function updateUserMetrics(users) {
    const total = users.length;

    const admins = users.filter((user) =>
      normalizeText(user.papel || user.role).includes("admin")
    ).length;

    const collaborators = total - admins;

    const departments = new Set(
      users
        .map((user) => user.departamento)
        .filter((department) => department)
    );

    document.getElementById("totalUsers").textContent = total;
    document.getElementById("adminUsers").textContent = admins;
    document.getElementById("collaboratorUsers").textContent = collaborators;
    document.getElementById("departmentsCount").textContent = departments.size;
  }

  function renderUsers(users) {
    usersList.innerHTML = "";

    if (users.length === 0) {
      usersList.innerHTML = `
        <tr>
          <td colspan="5" class="empty-message">Nenhum usuário encontrado.</td>
        </tr>
      `;
      return;
    }

    users.forEach((user) => {
      const name = user.name || user.nome || "Sem nome";
      const email = user.email || "-";
      const papel = user.papel || user.role || "Colaborador";
      const departamento = user.departamento || "Não informado";
      const ultimoAcesso = user.ultimo_acesso || "Hoje";

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>
          <strong>${name}</strong>
        </td>
        <td>${email}</td>
        <td><span class="tag">${papel}</span></td>
        <td>${departamento}</td>
        <td>${ultimoAcesso}</td>
      `;

      usersList.appendChild(tr);
    });
  }

  function applyUserSearch() {
    const searchTerm = normalizeText(searchUserInput.value);

    const filteredUsers = allUsers.filter((user) => {
      const name = normalizeText(user.name || user.nome);
      const email = normalizeText(user.email);
      const departamento = normalizeText(user.departamento);
      const papel = normalizeText(user.papel || user.role);

      return (
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        departamento.includes(searchTerm) ||
        papel.includes(searchTerm)
      );
    });

    renderUsers(filteredUsers);
  }

  async function loadUsers() {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar usuários.");
      }

      const users = await response.json();

      allUsers = users;

      updateUserMetrics(users);
      renderUsers(users);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);

      usersList.innerHTML = `
        <tr>
          <td colspan="5" class="empty-message">
            Não foi possível carregar os usuários. Verifique se o backend está rodando.
          </td>
        </tr>
      `;
    }
  }

  searchUserInput.addEventListener("input", applyUserSearch);

  await loadUsers();
});