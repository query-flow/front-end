// src/pages/InviteMember.jsx
import { useState, useEffect } from "react";
import api from "../services/api";
import "../css/inviteMember.css";

export default function InviteMember() {
  const [form, setForm] = useState({
    email: "",
    org_id: "",
    role_in_org: "member",
  });
  const [msg, setMsg] = useState("");

  // tenta pegar org_id do localStorage pra facilitar a vida
  useEffect(() => {
    const storedOrg = localStorage.getItem("org_id");
    if (storedOrg) {
      setForm((prev) => ({ ...prev, org_id: storedOrg }));
    }
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setMsg("⚠️ Você precisa estar logado como Org Admin ou Platform Admin.");
      return;
    }

    try {
      const res = await api.post(
        "/members/invite",
        {
          email: form.email,
          org_id: form.org_id,
          role_in_org: form.role_in_org,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMsg("Convite enviado com sucesso ✅");
      setForm((prev) => ({ ...prev, email: "" }));
      console.log(res.data);
    } catch (err) {
      console.error(err);
      const backendMsg = err.response?.data?.detail;
      setMsg(backendMsg || "Erro ao convidar membro.");
    }
  }

  return (
    <div className="invite-page">
      <div className="invite-card">
        <h2>Convidar membro para a organização</h2>
        <p className="invite-hint">
          Essa rota chama <code>/members/invite</code>. Precisa de token.
        </p>

        <form onSubmit={handleSubmit} className="invite-form">
          <label>
            Email do membro
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="pessoa@empresa.com"
              required
            />
          </label>

          <label>
            ID da organização
            <input
              name="org_id"
              value={form.org_id}
              onChange={handleChange}
              placeholder="cole aqui o org_id"
              required
            />
          </label>

          <label>
            Papel na org
            <select
              name="role_in_org"
              value={form.role_in_org}
              onChange={handleChange}
            >
              <option value="member">member</option>
              <option value="org_admin">org_admin</option>
            </select>
          </label>

          <button type="submit">Enviar convite</button>
        </form>

        {msg && <p className="invite-msg">{msg}</p>}
      </div>
    </div>
  );
}
