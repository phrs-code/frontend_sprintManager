document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (event) {
        
        event.preventDefault();

        const emailInput = document.getElementById('email').value.trim();
        const passwordInput = document.getElementById('password').value.trim();

        if(!emailInput || !passwordInput) {
            alert('Por favor, preencha todos os campos. (email e senha)');
            return;
        }

        const loginData = {
            email: emailInput,
            password: passwordInput
        };

        const API_URL = "http://localhost:5000";

        try {
            const response = await fetch(`${API_URL}/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();
                
                console.log('Login efetuado com sucesso!', data);
                
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                
                alert('Login realizado com sucesso!');
                window.location.href = 'dashboard.html';
                
            } else {
                const errorData = await response.json();
                alert(`Falha no login: ${errorData.message || 'Credenciais inválidas.'}`);
            }
        }catch(error){
            console.error('Erro na requisição Fetch:', error);
            alert('Ocorreu um erro de conexão com o servidor. Tente novamente mais tarde.');
        }
    })
});