// src/pages/AcceptInvite.jsx
import { useState } from "react";
import api from "../services/api";
import "../css/acceptInvite.css";

export default function AcceptInvite() {
  const [form, setForm] = useState({
    invite_token: "",
    password: "",
  });
  const [msg, setMsg] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    try {
      const res = await api.post("/auth/accept-invite", {
        invite_token: form.invite_token,
        password: form.password,
      });

      // salva os tokens do membro
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("member_email", res.data.email);
      localStorage.setItem("org_id", res.data.org_id);

      setMsg("Convite aceito com sucesso! ✅ Você já pode usar o sistema.");
    } catch (err) {
      console.error(err);
      const backendMsg = err.response?.data?.detail;
      setMsg(backendMsg || "Erro ao aceitar convite.");
    }
  }

  return (
    <div className="accept-page">
      <div className="accept-card">
        <h2>Aceitar convite</h2>
        <p className="accept-hint">
          Cole aqui o <code>invite_token</code> que o admin gerou pra você.
        </p>
        <form onSubmit={handleSubmit} className="accept-form">
          <label>
            Invite token
            <input
              name="invite_token"
              value={form.invite_token}
              onChange={handleChange}
              placeholder="cole o token aqui"
              required
            />
          </label>
          <label>
            Defina sua senha
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </label>
          <button type="submit">Aceitar convite</button>
        </form>
        {msg && <p className="accept-msg">{msg}</p>}
      </div>
    </div>
  );
}
