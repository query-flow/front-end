import { useState } from "react";
import api from "../services/api";
import "../css/register.css";

export default function AdminRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    org_name: ""
  });

  const [feedback, setFeedback] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", form);
      localStorage.setItem("access_token", res.data.access_token);
      setFeedback({ success: "Admin criado com sucesso!" });
    } catch (err) {
      setFeedback({ error: err.response?.data?.detail || "Erro ao registrar." });
    }
  }

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Criar Admin</h2>
        <input type="text" name="name" placeholder="Nome" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Senha" onChange={handleChange} required />
        <input type="text" name="org_name" placeholder="Organização" onChange={handleChange} required />
        <button type="submit">Cadastrar</button>
        {feedback?.success && <p className="success">{feedback.success}</p>}
        {feedback?.error && <p className="error">{feedback.error}</p>}
      </form>
    </div>
  );
}
