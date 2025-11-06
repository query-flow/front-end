// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("voce@empresa.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const saveBaseAuth = (data) => {
    localStorage.setItem("auth_payload", JSON.stringify(data));

    const token =
      data.access_token ||
      data.token ||
      data.accessToken ||
      data.jwt ||
      data.authorization;

    if (token) {
      localStorage.setItem("access_token", token);
    }

    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    // org_id pode vir direto ou dentro de org
    const orgId = data.org_id || data.org?.id;
    if (orgId) {
      localStorage.setItem("org_id", orgId);
    }

    const baseName =
      data.user?.name ||
      data.name ||
      data.full_name ||
      data.username ||
      data.email ||
      email ||
      "usuário";

    localStorage.setItem("user_name", baseName);

    if (data.org?.name) {
      localStorage.setItem("org_name", data.org.name);
    }
  };

  // usa /members pra descobrir org_name, role_in_org e nome final
  const hydrateFromMembers = async (data) => {
    try {
      const userId =
        data.user?.id || data.user_id || data.id || null;

      if (!userId) {
        console.warn("Não encontrei user_id no payload de login.");
        return;
      }

      const res = await api.get("/members");
      const { org_id, org_name, members } = res.data || {};

      if (org_id) {
        localStorage.setItem("org_id", org_id);
      }
      if (org_name) {
        localStorage.setItem("org_name", org_name);
      }

      if (Array.isArray(members)) {
        const me = members.find((m) => m.user_id === userId);
        if (me) {
          if (me.name) {
            localStorage.setItem("user_name", me.name);
          }
          if (me.role_in_org) {
            localStorage.setItem("role_in_org", me.role_in_org);
          }
        }
      }
    } catch (e) {
      console.warn("Não consegui enriquecer dados com /members", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // primeiro tenta login normal
      const res = await api.post("/auth/login", { email, password });
      console.log("LOGIN /auth/login:", res.data);

      saveBaseAuth(res.data);
      await hydrateFromMembers(res.data);

      // todo mundo (member ou org_admin) começa no chat
      navigate("/chat");
    } catch (errUser) {
      console.warn(
        "Falha em /auth/login, tentando /auth/admin-login…",
        errUser
      );

      try {
        const resAdmin = await api.post("/auth/admin-login", {
          email,
          password,
        });
        console.log("LOGIN /auth/admin-login:", resAdmin.data);

        saveBaseAuth(resAdmin.data);
        localStorage.setItem("role_in_org", "org_admin"); // trata como admin global

        navigate("/org"); // platform admin cai direto na página admin
      } catch (errAdmin) {
        console.error("Falha também em /auth/admin-login", errAdmin);

        const statusUser = errUser?.response?.status;
        const statusAdmin = errAdmin?.response?.status;

        if (statusUser === 401 || statusAdmin === 401) {
          setError("Login ou senha inválidos.");
        } else {
          setError("Erro ao tentar logar. Veja o console.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="login-title">QueryFlow</div>
        <div className="login-subtitle">
          Converse com sua base de dados e acelere seus fluxos.
        </div>

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >
          <div>
            <div className="login-label">Email</div>
            <input
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="voce@empresa.com"
            />
          </div>
          <div>
            <div className="login-label">Senha</div>
            <input
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer-link">
          Esqueceu a senha?
        </div>
      </div>
    </div>
  );
}
