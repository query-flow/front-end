// src/pages/UploadDocument.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "../styles/arquivo.css";

export default function UploadDocument() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: string }
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus({
        type: "error",
        message: "Selecione um arquivo para enviar.",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title || file.name);
      formData.append("file", file);

      // NÃO setar Content-Type manualmente, o axios faz isso com o boundary
      const res = await api.post("/documents/extract", formData);

      setStatus({
        type: "success",
        message: "Arquivo enviado e processado com sucesso.",
      });
      setResult(res.data || null);
    } catch (err) {
      console.error(err);
      let message = "Erro ao enviar arquivo.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        message +=
          " " + (typeof detail === "string" ? detail : JSON.stringify(detail));
      }
      setStatus({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arquivo-page">
      <div className="arquivo-card">
        <div className="arquivo-header">
          <h1>Adicionar arquivo</h1>
          <p>
            Envie PDFs, DOCX ou TXT para extração automática de texto e
            metadados.
          </p>
        </div>

        <form className="arquivo-form" onSubmit={handleSubmit}>
          <div className="arquivo-field">
            <label>Título do documento</label>
            <input
              type="text"
              placeholder="Manual de Processos, Dicionário de Dados..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="arquivo-help">
              Se você deixar em branco, usaremos o nome do arquivo.
            </span>
          </div>

          <div className="arquivo-field">
            <label>Arquivo</label>
            <div className="arquivo-file-row">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                }}
              />
            </div>
            <span className="arquivo-help">
              Formatos suportados: PDF, DOC, DOCX, TXT.
            </span>
          </div>

          {status && (
            <div
              className={
                "arquivo-status " +
                (status.type === "success"
                  ? "arquivo-status--success"
                  : "arquivo-status--error")
              }
            >
              {status.message}
            </div>
          )}

          <div className="arquivo-actions">
            <button
              type="button"
              className="arquivo-btn-secondary"
              onClick={() => navigate("/chat")}
            >
              Voltar ao chat
            </button>
            <button
              type="submit"
              className="arquivo-btn-primary"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar arquivo"}
            </button>
          </div>
        </form>

        {result && (
          <div className="arquivo-result">
            <h2>Resumo da extração</h2>
            <div className="arquivo-result-grid">
              {"doc_id" in result && (
                <div>
                  <span className="arquivo-result-label">ID do documento</span>
                  <div className="arquivo-result-value">{result.doc_id}</div>
                </div>
              )}
              {"title" in result && (
                <div>
                  <span className="arquivo-result-label">Título</span>
                  <div className="arquivo-result-value">{result.title}</div>
                </div>
              )}
              {"num_tokens" in result && (
                <div>
                  <span className="arquivo-result-label">Tokens</span>
                  <div className="arquivo-result-value">
                    {result.num_tokens}
                  </div>
                </div>
              )}
            </div>

            <details className="arquivo-json">
              <summary>Ver resposta completa (JSON)</summary>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
