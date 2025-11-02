// src/pages/Ask.jsx
import { useState } from "react";
import api from "../lib/api";

export default function Ask() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // impede reload
    setError("");
    setResposta(null);

    try {
      const res = await api.post("/perguntar_org", {
        pergunta,
        max_linhas: 5,
        enrich: true,
      });

      setResposta(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Token inválido ou expirado. Faça login novamente.");
      } else {
        setError("Erro ao fazer pergunta.");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Fazer pergunta</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Ex: Quais são os 5 atores que aparecem em mais filmes?"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Perguntar
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {resposta && (
        <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(resposta, null, 2)}
        </pre>
      )}
    </div>
  );
}
