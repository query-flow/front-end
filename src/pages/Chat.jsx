// src/pages/Chat.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import ChatLayout from "../components/ChatLayout.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import logo from "../assets/logo.png";
import "../styles/chat.css";

/* ========= Bolha de carregamento enquanto a resposta é gerada ========= */
function LoadingBubble() {
  return (
    <div className="message-row message-row--assistant">
      <div className="message-bubble message-bubble--assistant message-bubble--loading">
        {/* linhas de texto "fantasma" */}
        <div className="loading-lines">
          <div className="loading-line loading-line--short" />
          <div className="loading-line" />
          <div className="loading-line loading-line--medium" />
        </div>

        {/* "tabela" embaçada */}
        <div className="loading-table">
          <div className="loading-table-header">
            <span className="loading-cell" />
            <span className="loading-cell" />
            <span className="loading-cell" />
          </div>
          <div className="loading-table-row" />
          <div className="loading-table-row" />
        </div>

        {/* barra de progresso animada */}
        <div className="loading-progress">
          <div className="loading-progress-inner" />
        </div>

        <div className="loading-caption">Gerando resposta…</div>
      </div>
    </div>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const { conversationId } = useParams(); // Get conversation ID from URL

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
    storedOrgName || parsedPayload?.org?.name || "Sua Organização";

  let initialOrgId = localStorage.getItem("org_id");
  if (!initialOrgId && parsedPayload) {
    if (parsedPayload.org_id) initialOrgId = parsedPayload.org_id;
    else if (parsedPayload.org && parsedPayload.org.id)
      initialOrgId = parsedPayload.org.id;
  }
  const [orgId] = useState(initialOrgId || "");

  const papelLegivel =
    roleInOrg === "admin" ? "Administrador" : "Usuário";

  const bemVindoNome = (userName || "usuário").toUpperCase();

  // Conversation state
  const [conversationTitle, setConversationTitle] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: conversationId
        ? "Carregando histórico da conversa..."
        : `BEM VINDO, ${bemVindoNome}! ${conversationId ? "Continue sua conversa" : "Cada pergunta aqui é tratada de forma independente"}.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [helpTopic, setHelpTopic] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load conversation history if conversationId exists
  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      const res = await api.get(`/conversations/${conversationId}`);
      const { conversation, messages: historyMessages } = res.data;

      setConversationTitle(conversation.title || "Conversa sem título");

      // Convert backend messages to frontend format
      const formattedMessages = historyMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        // If assistant message has SQL results, we could reconstruct table here
        metadata: {
          sql: msg.sql_executed,
          duration_ms: msg.duration_ms,
          row_count: msg.row_count,
        },
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error("Erro ao carregar conversa:", err);
      setMessages([
        {
          role: "assistant",
          content: "❌ Erro ao carregar histórico da conversa. Veja o console.",
        },
      ]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const pergunta = input.trim();

    // adiciona mensagem do usuário
    const userMsg = { role: "user", content: pergunta };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body = {
        pergunta,
        max_linhas: 5,
        enrich: false,
      };

      let res;
      if (conversationId) {
        // Use conversation-specific endpoint
        res = await api.post(`/conversations/${conversationId}/ask`, body);
        console.log(`RESPOSTA /conversations/${conversationId}/ask:`, res.data);
      } else {
        // Use regular endpoint
        res = await api.post("/perguntar_org", body);
        console.log("RESPOSTA /perguntar_org:", res.data);
      }

      // ===== TRATAMENTO ESPECIAL: schema_error =====
      if (res.data?.status === "schema_error") {
        const { message, missing_data, suggestions } = res.data;

        // 1) Mensagem principal
        const titulo =
          message ||
          "Desculpe, esses dados não estão disponíveis no sistema.";

        // 2) Motivo (missing_data)
        let blocoMotivo = "";
        if (Array.isArray(missing_data) && missing_data.length) {
          const listaMotivo = missing_data
            .map((item) => `• ${item}`)
            .join("\n");
          blocoMotivo = `\n\nMotivo:\n${listaMotivo}`;
        }

        // 3) Sugestões
        let blocoSugestoes = "";
        if (Array.isArray(suggestions) && suggestions.length) {
          const listaSugestoes = suggestions
            .map((s) => `• ${s}`)
            .join("\n");
          blocoSugestoes = `\n\nVocê pode tentar perguntas como:\n${listaSugestoes}`;
        }

        const textoFinal = `${titulo}${blocoMotivo}${blocoSugestoes}`;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: textoFinal,
          },
        ]);
      } else {
        // ===== FLUXO NORMAL: resultado da consulta =====
        const { status, columns, rows, insights, metadata } = res.data;

        if (status === "success" && columns && rows) {
          const assistantMsg = {
            role: "assistant",
            content: "Aqui estão os resultados desta pergunta:",
            table: {
              columns,
              rows,
            },
            metadata, // Incluir metadata para futura exibição (query time, etc)
          };

          setMessages((prev) => [...prev, assistantMsg]);

          // Exibir insights se disponível
          if (insights && insights.summary) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: insights.summary,
                chart: insights.chart, // Se houver gráfico
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
          {
            role: "assistant",
            content: "❌ Erro ao consultar. Veja o console.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    [
      "access_token",
      "refresh_token",
      "auth_payload",
      "user_name",
      "org_name",
      "role_in_org",
    ].forEach((k) => localStorage.removeItem(k));
    navigate("/login");
  };

  const handleGoAdmin = () => {
    if (roleInOrg === "admin") {
      navigate("/admin");
    } else {
      alert("Você não é administrador desta organização.");
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <ChatLayout
      /* ===== SIDEBAR ===== */
      sidebar={
        <div
          className={`chat-sidebar-inner ${
            sidebarCollapsed ? "chat-sidebar-inner--collapsed" : ""
          }`}
        >
          {sidebarCollapsed ? (
            // MODO FECHADO: só o botão de abrir
            <div className="chat-sidebar-collapsed">
              <button
                type="button"
                className="chat-sidebar-toggle"
                onClick={toggleSidebar}
                aria-label="Expandir menu lateral"
              >
                ☰
              </button>
            </div>
          ) : (
            // MODO ABERTO
            <>
              <div className="chat-sidebar-header">
                <div className="chat-sidebar-logo">
                  <img src={logo} alt="QueryFlow" />
                </div>
                <div className="chat-sidebar-header-text">
                  <div className="chat-sidebar-title">QueryFlow</div>
                  <div className="chat-sidebar-badge">
                    consultas rápidas à sua base
                  </div>
                </div>
                <button
                  type="button"
                  className="chat-sidebar-toggle chat-sidebar-toggle-right"
                  onClick={toggleSidebar}
                  aria-label="Recolher menu lateral"
                >
                  ☰
                </button>
              </div>

              <div className="chat-sidebar-help-list">
                {conversationId ? (
                  <>
                    <div className="chat-info-box" style={{
                      background: "#1e293b",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      marginBottom: "1rem",
                      border: "1px solid #3b82f6"
                    }}>
                      <div style={{ color: "#3b82f6", fontWeight: "600", marginBottom: "0.25rem" }}>
                        💬 Modo Conversa
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                        Suas perguntas têm contexto e são salvas automaticamente.
                      </div>
                    </div>
                    <button
                      type="button"
                      className="chat-help-item"
                      onClick={() => navigate("/chat")}
                    >
                      <span className="chat-help-text">Ir para Chat Rápido</span>
                      <span className="chat-help-icon-right">⚡</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="chat-info-box" style={{
                      background: "#1e293b",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      marginBottom: "1rem",
                      border: "1px solid #64748b"
                    }}>
                      <div style={{ color: "#94a3b8", fontWeight: "600", marginBottom: "0.25rem" }}>
                        ⚡ Chat Rápido
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        Perguntas independentes sem histórico.
                      </div>
                    </div>
                    <button
                      type="button"
                      className="chat-help-item"
                      onClick={() => navigate("/conversations")}
                    >
                      <span className="chat-help-text">Ir para Conversas Salvas</span>
                      <span className="chat-help-icon-right">📝</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="chat-help-item chat-help-main"
                  onClick={() => setHelpTopic("como")}
                >
                  <span className="chat-help-text">Como funciona</span>
                  <span className="chat-help-icon-right">⟳</span>
                </button>

                <button
                  type="button"
                  className="chat-help-item"
                  onClick={() => setHelpTopic("pergunta")}
                >
                  <span className="chat-help-text">Pergunta independente</span>
                  <span className="chat-help-icon-right">?</span>
                </button>

                <button
                  type="button"
                  className="chat-help-item"
                  onClick={() => setHelpTopic("respostas")}
                >
                  <span className="chat-help-text">
                    Respostas baseadas {conversationId ? "no contexto" : "apenas na pergunta atual"}
                  </span>
                  <span className="chat-help-icon-right">💬</span>
                </button>
              </div>

              <div className="chat-sidebar-footer">
                <div className="chat-sidebar-footer-row">
                  <span>Org atual:</span>
                  <span style={{ color: "#9ca3af" }}>
                    {orgId ? "conectada" : "nenhuma"}
                  </span>
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
          )}
        </div>
      }
      /* ===== HEADER ===== */
      header={
        <div className="chat-header-row">
          <div className="chat-header-left">
            {orgName}
            {conversationId && conversationTitle && (
              <span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#94a3b8" }}>
                → {conversationTitle}
              </span>
            )}
          </div>

          <div className="chat-header-center">Chat</div>

          <div className="chat-header-right">
            <button
              className="chat-header-logout"
              type="button"
              onClick={() => navigate("/conversations")}
              title="Ver histórico de conversas"
            >
              Histórico
            </button>
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
        </div>
      }
    >
      {/* ===== ÁREA PRINCIPAL ===== */}
      <div className="chat-main">
        {/* logo grande ao fundo */}
        <div className="chat-logo-floating">
          <img src={logo} alt="QueryFlow" />
        </div>

        {/* mensagens */}
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <MessageBubble
              key={idx}
              role={m.role}
              content={m.content}
              table={m.table}
            />
          ))}

          {loading && <LoadingBubble />}
        </div>

        {/* input + ícone de adicionar arquivo */}
        <div className="chat-input-bar">
          <form onSubmit={handleSend} className="chat-input-inner">
            <button
              type="button"
              className="chat-input-addfile"
              onClick={() => navigate("/arquivo")}
              aria-label="Adicionar arquivo"
              title="Adicionar arquivo"
            >
              📎
            </button>

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

        {/* modal de instruções */}
        {helpTopic && (
          <div
            className="chat-help-backdrop"
            onClick={() => setHelpTopic(null)}
          >
            <div
              className="chat-help-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="chat-help-close"
                onClick={() => setHelpTopic(null)}
              >
                ×
              </button>

              {helpTopic === "como" && (
                <>
                  <h3>Como funciona</h3>
                  <ul>
                    <li>Você faz uma pergunta sobre seus dados.</li>
                    <li>
                      Transformamos isso em uma consulta para a base conectada
                      (por exemplo, dashboards e tabelas).
                    </li>
                    <li>
                      A resposta volta em linguagem natural e, quando fizer
                      sentido, também em formato de tabela.
                    </li>
                  </ul>
                  <p className="chat-help-tip">
                    Comece com perguntas simples como “Quais foram as vendas
                    deste mês?”.
                  </p>
                </>
              )}

              {helpTopic === "conversas" && (
                <>
                  <h3>Conversas não salvas</h3>
                  <ul>
                    <li>
                      O histórico de mensagens não é armazenado pela plataforma.
                    </li>
                    <li>
                      Cada sessão é pensada para consultas rápidas, sem criar um
                      “chat infinito”.
                    </li>
                    <li>
                      Isso ajuda a manter o foco em perguntas objetivas.
                    </li>
                  </ul>
                </>
              )}

              {helpTopic === "pergunta" && (
                <>
                  <h3>Pergunta independente</h3>
                  <ul>
                    <li>
                      A resposta não depende do que você perguntou antes.
                    </li>
                    <li>
                      Se precisar de contexto, repita os detalhes na própria
                      pergunta.
                    </li>
                    <li>
                      Exemplo: “Comparando com o mês passado, como ficaram as
                      vendas deste mês?”.
                    </li>
                  </ul>
                </>
              )}

              {helpTopic === "respostas" && (
                <>
                  <h3>Respostas baseadas na pergunta atual</h3>
                  <ul>
                    <li>
                      A IA olha apenas para a pergunta atual e para os dados
                      conectados à sua organização.
                    </li>
                    <li>
                      Isso evita confusão com temas antigos da conversa.
                    </li>
                    <li>
                      Quanto mais específica a pergunta, mais precisa tende a
                      ser a resposta.
                    </li>
                  </ul>
                  <p className="chat-help-tip">
                    Tente citar o dashboard, tabela ou métrica que você quer
                    ver.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ChatLayout>
  );
}
