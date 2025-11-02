// src/pages/AdminLogin.jsx
import { useState } from "react";
import api from "../lib/api";
import "../css/adminLogin.css";

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [msg, setMsg] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/admin-login", {
        email,
        password,
      });

      const { access_token, user_id } = res.data;

      localStorage.setItem("access_token", access_token);
      if (user_id) localStorage.setItem("user_id", user_id);
      // admin pode não ter org, tudo bem

      if (onLoggedIn) onLoggedIn();
    } catch (err) {
      console.error(err);
      setError("Não foi possível logar como admin.");
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2>Login (Platform Admin)</h2>
        <p className="hint">
          Esse login usa <code>/auth/admin-login</code> do seu back.
        </p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@plataforma.com"
              required
            />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </label>
          <button type="submit">Entrar</button>
        </form>
        {msg && <p className="admin-login-msg">{msg}</p>}
      </div>
    </div>
  );
}
