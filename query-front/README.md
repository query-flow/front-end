# Query-Flow 🚀

**Query-Flow** é uma plataforma web construída em **React + Vite**, com um design inspirado no ChatGPT.
Ela permite que usuários finais interajam com sua própria plataforma através de um chat inteligente, enquanto administradores possuem acesso a um painel administrativo com dashboards, gerenciamento de usuários e configurações.

---

## 📂 Estrutura do Repositório

```bash
src/
 ├─ assets/          # Imagens e ícones (logo, etc.)
 ├─ components/      # Componentes reutilizáveis (Sidebar, ChatBox, etc.)
 ├─ hooks/           # Hooks customizados
 ├─ pages/           # Páginas principais
 │   ├─ admin/       # Área administrativa (Home, Config, Plano, etc.)
 │   ├─ Home.jsx     # Tela do chat principal
 │   ├─ Login.jsx    # Tela de login
 │   ├─ ForgotPassword.jsx  # Recuperação de senha
 ├─ services/        # Integrações com API (auth, chat, etc.)
 ├─ styles/          # Estilos CSS globais e de componentes
 ├─ App.jsx          # Definição de rotas principais
 ├─ main.jsx         # Ponto de entrada React
```

---

## ⚙️ Tecnologias Utilizadas

* **React 18** com **Vite** (build rápido e HMR)
* **React Router DOM** para navegação
* **CSS Modules / custom styles** para estilização
* **LocalStorage** para sessão mock
* **Fetch API** para integração futura com backend

---

## 🚀 Funcionalidades Principais

### 👤 Usuário comum

* Login e autenticação
* Chat em tempo real com histórico persistente na sidebar
* Criação e exclusão de conversas
* Interface minimalista e intuitiva

### 🛠️ Admin

* Acesso restrito a `/admin`
* Sidebar com navegação para:

  * **Home (dashboard inicial)**
  * **Configurações**
  * **Usuários dependentes**
  * **Cadastrar usuário**
  * **Gerenciar plano**
  * **Gerenciar usuários**
* Visualização de métricas (mensagens enviadas, tempo de resposta, usuários ativos)
* Botão **Sair** (retorna ao login, limpando sessão)

---

## 🔑 Rotas Principais

| Rota      | Descrição              |
| --------- | ---------------------- |
| `/login`  | Tela de login          |
| `/forgot` | Recuperação de senha   |
| `/`       | Página inicial do chat |
| `/admin`  | Painel administrativo  |

---

## 💻 Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-repo/query-flow.git
cd query-flow
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar em modo desenvolvimento

```bash
npm run dev
```

> Acesse em: [http://localhost:5173](http://localhost:5173)

### 4. Build para produção

```bash
npm run build
```

### 5. Pré-visualizar build

```bash
npm run preview
```

---

## 🧩 Fluxo interno

1. **Login** → usuário autentica, token e role salvos em `localStorage`.
2. **Chat** → mensagens do usuário são enviadas para uma API (mock hoje, mas já preparado para backend real).

   * Histórico salvo no estado do React.
   * Sidebar lista conversas, com opção de criar/excluir.
3. **Admin** → acesso direto via `/admin`, com componentes separados por página (`AdminHome`, `Settings`, `Plan`, etc.).
4. **Logout** → `localStorage.clear()` e redireciona para `/login`.

---

## 🔮 Próximos Passos

* Integração real com backend (API REST ou GraphQL).
* Persistência de histórico de chat em banco de dados.
* Controle de permissões refinado (RBAC).
* Dashboards dinâmicos com **Chart.js** ou **Recharts**.

---

📌 Esse repositório é usado para desenvolver o **frontend** da plataforma Query-Flow.
O objetivo é fornecer uma interface moderna para interação de usuários e administração de fluxos.

