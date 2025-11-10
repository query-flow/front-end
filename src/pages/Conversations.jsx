// src/pages/Conversations.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "../styles/conversations.css";

export default function Conversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/conversations?limit=50");
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Erro ao carregar conversações:", err);
      setError("Não foi possível carregar as conversações.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conversationId) => {
    if (!window.confirm("Deseja realmente deletar esta conversa?")) return;

    try {
      await api.delete(`/conversations/${conversationId}`);
      setConversations((prev) =>
        prev.filter((c) => c.id !== conversationId)
      );
    } catch (err) {
      console.error("Erro ao deletar conversa:", err);
      alert("Erro ao deletar conversa.");
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post("/conversations", {
        title: "Nova Conversa",
      });
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      console.error("Erro ao criar conversa:", err);
      alert("Erro ao criar nova conversa.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="conversations-page">
      <div className="conversations-container">
        <div className="conversations-header">
          <h1>Histórico de Conversações</h1>
          <div className="conversations-actions">
            <button
              onClick={handleNewConversation}
              className="btn btn-primary"
            >
              + Nova Conversa
            </button>
            <button onClick={() => navigate("/chat")} className="btn btn-secondary">
              Chat Rápido
            </button>
          </div>
        </div>

        {loading && (
          <div className="conversations-loading">Carregando conversações...</div>
        )}

        {error && <div className="conversations-error">{error}</div>}

        {!loading && !error && conversations.length === 0 && (
          <div className="conversations-empty">
            <p>Nenhuma conversa salva ainda.</p>
            <p>Clique em "Nova Conversa" para começar!</p>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="conversations-list">
            {conversations.map((conv) => (
              <div key={conv.id} className="conversation-card">
                <div className="conversation-card-header">
                  <h3>{conv.title || "Conversa sem título"}</h3>
                  <span className="conversation-badge">
                    {conv.message_count || 0} mensagens
                  </span>
                </div>

                <div className="conversation-card-meta">
                  <span>Criada: {formatDate(conv.created_at)}</span>
                  <span>Atualizada: {formatDate(conv.updated_at)}</span>
                </div>

                <div className="conversation-card-actions">
                  <button
                    onClick={() => navigate(`/chat/${conv.id}`)}
                    className="btn btn-small btn-primary"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => handleDelete(conv.id)}
                    className="btn btn-small btn-danger"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
