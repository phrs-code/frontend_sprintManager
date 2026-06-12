document.addEventListener('DOMContentLoaded', () => {

    const registrationForm = document.getElementById('registrationForm');

    registrationForm.addEventListener('submit', async function (event) {
        
        event.preventDefault();

        const nameInput = document.getElementById('username').value.trim();
        const emailInput = document.getElementById('registration-email').value.trim();
        const passwordInput = document.getElementById('registration-password').value.trim();
        const ageInput = document.getElementById('registration-years').value.trim();

        if(!nameInput || !emailInput || !passwordInput || !ageInput) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (passwordInput.length < 6) {
            alert('A senha deve possuir pelo menos 6 caracteres.');
            return;
        }

        const registrationData = {
            name: nameInput,
            email: emailInput,
            password: passwordInput,
            age: ageInput
        };

        const API_URL = "http://localhost:5000";

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            if (response.ok) {
                const data = await response.json();
                
                console.log('Cadastro efetuado com sucesso!', data);
                
                alert('Cadastro realizado com sucesso!');
                window.location.href = '/login.html';
                
            } else {
                const errorData = await response.json();
                alert(`Falha no cadastro: ${errorData.message || 'Dados inválidos.'}`);
            }
        } catch(error) {
            console.error('Erro na requisição Fetch:', error);
            alert('Ocorreu um erro de conexão com o servidor. Tente novamente mais tarde.');
        }
    })
});