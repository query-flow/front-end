// src/pages/Chat.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import ChatLayout from "../components/ChatLayout.jsx";
import MessageBubble from "../components/MessageBubble.jsx";

export default function Chat() {
  const navigate = useNavigate();

  const rawPayload = localStorage.getItem("auth_payload");
  const parsedPayload = rawPayload ? JSON.parse(rawPayload) : null;

  const storedName = localStorage.getItem("user_name");
  const userName =
    storedName ||
    (parsedPayload &&
      (parsedPayload.name ||
        parsedPayload.full_name ||
        parsedPayload.username ||
        parsedPayload.email)) ||
    "usuário";

  let initialOrgId = localStorage.getItem("org_id");
  if (!initialOrgId && parsedPayload) {
    if (parsedPayload.org_id) initialOrgId = parsedPayload.org_id;
    else if (parsedPayload.org && parsedPayload.org.id)
      initialOrgId = parsedPayload.org.id;
    else if (Array.isArray(parsedPayload.orgs) && parsedPayload.orgs.length > 0)
      initialOrgId = parsedPayload.orgs[0].id;
    if (initialOrgId) localStorage.setItem("org_id", initialOrgId);
  }

  const [orgId] = useState(initialOrgId || "");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Olá, ${userName}! Faça uma pergunta sobre o seu banco (ex: Sakila).`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body = {
        pergunta: input,
        max_linhas: 5,
        enrich: false,
      };

      const res = await api.post("/perguntar_org", body);
      console.log("RESPOSTA /perguntar_org:", res.data);

      const { resultado, insights } = res.data;

      if (resultado && resultado.colunas && resultado.dados) {
        const assistantMsg = {
          role: "assistant",
          content: "Aqui estão os resultados:",
          table: {
            columns: resultado.colunas,
            rows: resultado.dados,
          },
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (insights) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Insights: ${insights}` },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Não consegui interpretar o resultado no formato esperado. Veja o console.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "❌ Token inválido/expirado. Faça login novamente.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "❌ Erro ao consultar. Veja o console." },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_payload");
    localStorage.removeItem("user_name");
    navigate("/login");
  };

  return (
    <ChatLayout
      sidebar={
        <>
          <div className="chat-sidebar-header">
            <div>
              <div className="chat-sidebar-title">QueryFlow</div>
              <div className="chat-sidebar-badge">
                assistente da sua plataforma
              </div>
            </div>
          </div>

          <button
            className="chat-sidebar-new-btn"
            onClick={() =>
              setMessages([
                {
                  role: "assistant",
                  content: `Olá, ${userName}! Nova conversa.`,
                },
              ])
            }
          >
            + Novo chat
          </button>

          <div className="chat-sidebar-section-title">Conversas</div>
          <div className="chat-sidebar-list">
            {/* aqui pode futuramente listar conversas reais;
                por enquanto deixo só o “chat atual” */}
            <div className="chat-sidebar-item chat-sidebar-item--active">
              <div className="chat-sidebar-item-title">
                Chat atual
              </div>
              <div className="chat-sidebar-item-meta">
                {messages.length - 1} mensagens
              </div>
            </div>
          </div>

          <div className="chat-sidebar-footer">
            <div className="chat-sidebar-footer-row">
              <span>Org atual:</span>
              <span style={{ color: "#9ca3af" }}>
                {orgId ? "conectada" : "nenhuma"}
              </span>
            </div>
            <div className="chat-sidebar-footer-row">
              <button
                className="chat-sidebar-footer-button"
                onClick={() => navigate("/org")}
              >
                Administração
              </button>
              <button
                className="chat-sidebar-footer-button"
                onClick={handleLogout}
              >
                Sair
              </button>
            </div>
          </div>
        </>
      }
      header={
        <>
          <div className="chat-header-title">QueryFlow · Chat</div>
          <div className="chat-header-right">
            <div className="chat-header-pill">Logado como {userName}</div>
          </div>
        </>
      }
    >
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <MessageBubble
            key={idx}
            role={m.role}
            content={m.content}
            table={m.table}
          />
        ))}
        {loading && (
          <p style={{ fontSize: 12, paddingLeft: 24, color: "#9ca3af" }}>
            Gerando resposta...
          </p>
        )}
      </div>

      <div className="chat-input-bar">
        <form onSubmit={handleSend} className="chat-input-inner">
          <input
            className="chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Digite sua pergunta, ${userName}...`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="chat-input-button"
          >
            Enviar
          </button>
        </form>
      </div>
    </ChatLayout>
  );
}
