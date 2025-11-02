// src/pages/MemberLogin.jsx (ou onde estiver)
import { useState } from "react";
import api from "../lib/api";

export default function MemberLogin({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // a API do Postman devolve: access_token, user_id, org_id
      const { access_token, org_id, user_id, refresh_token } = res.data;

      // salva igual ao Postman
      localStorage.setItem("access_token", access_token);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
      if (org_id) localStorage.setItem("org_id", org_id);
      if (user_id) localStorage.setItem("user_id", user_id);

      // avisa o app que logou
      if (onLoggedIn) onLoggedIn();
    } catch (err) {
      console.error(err);
      setError("Credenciais inválidas ou servidor indisponível.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Login (Membro)</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
