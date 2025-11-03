// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import logo from "../assets/logo.png";

export default function Login() {
  const [mode, setMode] = useState("user"); // "user" | "admin"
  const [email, setEmail] = useState("voce@empresa.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const route = mode === "admin" ? "/auth/admin-login" : "/auth/login";
      const res = await api.post(route, { email, password });

      console.log("LOGIN RES:", res.data);
      localStorage.setItem("auth_payload", JSON.stringify(res.data));

      const {
        access_token,
        refresh_token,
        org_id,
        name,
        full_name,
        username,
        email: emailFromAPI,
      } = res.data;

      if (access_token) {
        localStorage.setItem("access_token", access_token);
      } else {
        const tokenAlt =
          res.data.token ||
          res.data.accessToken ||
          res.data.jwt ||
          res.data.authorization;
        if (tokenAlt) localStorage.setItem("access_token", tokenAlt);
      }

      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
      if (org_id) localStorage.setItem("org_id", org_id);

      const bestName =
        name || full_name || username || emailFromAPI || email || "usuário";
      localStorage.setItem("user_name", bestName);

      navigate("/chat");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Login ou senha inválidos.");
      } else {
        setError("Erro ao tentar logar. Veja o console.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* logo foto em ../assets/logo.png */}
        <div className="login-logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="login-title">QueryFlow</div>
        <div className="login-subtitle">
          Converse com sua base de dados e acelere seus fluxos.
        </div>

        <div className="login-mode-toggle">
          <button
            type="button"
            onClick={() => setMode("user")}
            className={
              "login-mode-btn " +
              (mode === "user" ? "login-mode-btn--active" : "")
            }
          >
            Usuário
          </button>
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={
              "login-mode-btn " +
              (mode === "admin" ? "login-mode-btn--active" : "")
            }
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div
          style={{
            marginTop: 14,
            fontSize: 12,
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Esqueceu a senha?
        </div>
      </div>
    </div>
  );
}
