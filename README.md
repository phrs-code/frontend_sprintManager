# SprintManager

> 🚧 **Status:** Em desenvolvimento (Work In Progress) 🚧

O SprintManager é uma plataforma de gerenciamento individual de tasks e projetos, com o objetivo
de auxiliar na gestão de prioridades e status das atividades corporativas.

## 💻 Tecnologias

Este projeto é desenvolvido com as seguintes tecnologias:

**Frontend:**
* Html5, CSS, JavaScript

**Backend:**
* API: NodeJS
* Database: MongoDB
* Express.js
* Tratamento de dados: Python

## roadmap Funcionalidades e Roadmap

O que já foi implementado e o que está planejado para o futuro:

- [x] Configuração inicial do repositório
- [x] Criação da API de Autenticação (Backend)
- [x] Tela de Login (Frontend)
- [x] Banco de Dados modelado
- [x] Integração do Frontend com a API de Autenticação
- [x] Criação do painel de controle (Dashboard)

## 🚀 Como Rodar Localmente

- git clone https://github.com/phrs-code/Gerenciador-de-atividades.git
- Instale as dependências com o comando: yarn add
- Digite no terminal: yarn dev

### Pré-requisitos
Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:
* [Git](https://git-scm.com)
* [Node.js](https://nodejs.org/en/) (ou a linguagem que você usa)

### 📁 Estrutura do Projeto 🚧

O projeto está dividido em duas partes principais: `frontend` e `backend`.
## API em Node.js/Express
### Lógica de negócio e regras das rotas
### Conexão com o banco de dados
### Modelagem do banco de dados
### Definição dos endpoints da API
### Autenticação
### HashProvider
### Exemplo das variáveis de ambiente do server


# Meu Projeto              

Gerenciador-de-atividades/
  │
* ├── node_modules/
  │
* ├── src/
	* │   ├── config/
	* │   ├── controllers/
	* │   ├── docs/
	* │   ├── middlewares/
	* │   ├── model/
		* │   │   ├── task.model.js
		* │   │   └── user.model.js
	* │   ├── routes/
	* │   ├── utils/
	* │   └── server.js
	│
* ├── .env
* ├── .gitignore
* ├── env.example
* ├── package-lock.json
* ├── package.json
* ├── populateUsers.js
* ├── README.md
* ├── script.py
* └── yarn.lock

fronted_sprintManager/
  │
* ├── assets/
* ├── css/
	* │   └── style.css
  │
* ├── js/
	* │   ├── create_edit_task.js
	* │   ├── dashboard.js
	* │   ├── login.js
	* │   ├── registration.js
	* │   └── update_task.js
  │
* ├── create_edit_task.html
* ├── dashboard.html
* ├── login.html
* ├── registration.html
* └── update_task.html
