// src/pages/Chat.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import ChatLayout from "../components/ChatLayout.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import logo from "../assets/logo.png";

export default function Chat() {
  const navigate = useNavigate();

  const rawPayload = localStorage.getItem("auth_payload");
  const parsedPayload = rawPayload ? JSON.parse(rawPayload) : null;

  const storedName = localStorage.getItem("user_name");
  const storedOrgName = localStorage.getItem("org_name");
  const roleInOrg = localStorage.getItem("role_in_org") || "";

  const userName =
    storedName ||
    parsedPayload?.user?.name ||
    parsedPayload?.name ||
    parsedPayload?.full_name ||
    parsedPayload?.username ||
    parsedPayload?.email ||
    "usuário";

  const orgName =
    storedOrgName ||
    parsedPayload?.org?.name ||
    "Sua Organização";

  let initialOrgId = localStorage.getItem("org_id");
  if (!initialOrgId && parsedPayload) {
    if (parsedPayload.org_id) initialOrgId = parsedPayload.org_id;
    else if (parsedPayload.org && parsedPayload.org.id)
      initialOrgId = parsedPayload.org.id;
  }

  const [orgId] = useState(initialOrgId || "");

  const papelLegivel =
    roleInOrg === "org_admin" ? "Administrador" : "Usuário";

  const bemVindoNome = (userName || "usuário").toUpperCase();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `BEM VINDO, ${bemVindoNome}! Cada pergunta aqui é tratada de forma independente e não é armazenada.`,
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
          content: "Aqui estão os resultados desta pergunta:",
          table: {
            columns: resultado.colunas,
            rows: resultado.dados,
          },
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (insights) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Insights: ${JSON.stringify(insights)}`,
            },
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
    localStorage.removeItem("org_name");
    localStorage.removeItem("role_in_org");
    navigate("/login");
  };

  const handleGoAdmin = () => {
    if (roleInOrg === "org_admin") {
      navigate("/admin");
    } else {
      alert("Você não é administrador desta organização.");
    }
  };

  return (
    <ChatLayout
      sidebar={
        <>
          {/* Sidebar: logo + QueryFlow */}
          <div className="chat-sidebar-header">
            <div className="chat-sidebar-logo">
              <img src={logo} alt="QueryFlow" />
            </div>
            <div>
              <div className="chat-sidebar-title">QueryFlow</div>
              <div className="chat-sidebar-badge">
                consultas rápidas à sua base
              </div>
            </div>
          </div>

          <div className="chat-sidebar-info">
            <div className="chat-sidebar-info-title">Como funciona</div>
            <p style={{ margin: 0 }}>
              • As conversas não são salvas.
              <br />
              • Cada pergunta é independente (sem memória entre perguntas).
              <br />
              • As respostas são baseadas apenas na sua pergunta atual.
            </p>
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
                type="button"
                onClick={() => navigate("/arquivo")}
              >
                Adicionar arquivo
              </button>
            </div>

            <button
              type="button"
              className="chat-sidebar-footer-logout"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        </>
      }
      header={
        <>
          {/* Esquerda: nome da empresa + " - Chat" */}
          <div className="chat-header-title">
            {orgName} - Chat
          </div>

          {/* Direita: nome do usuário, cargo e botão Admin */}
          <div className="chat-header-right">
            <div className="chat-header-user">
              <span>
                {userName} - {papelLegivel}
              </span>
            </div>
            <button
              className="chat-header-logout"
              type="button"
              onClick={handleGoAdmin}
            >
              Admin
            </button>
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
