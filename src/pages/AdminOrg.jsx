// src/pages/AdminOrg.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "../styles/admin.css";

export default function AdminOrg() {
  const navigate = useNavigate();

  const rawPayload = localStorage.getItem("auth_payload");
  const parsedPayload = rawPayload ? JSON.parse(rawPayload) : null;

  let initialOrgId = localStorage.getItem("org_id") || "";
  let initialOrgName =
    localStorage.getItem("org_name") ||
    (parsedPayload?.org && parsedPayload.org.name) ||
    "";

  const [orgId, setOrgId] = useState(initialOrgId);
  const [orgName, setOrgName] = useState(initialOrgName);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteStatus, setInviteStatus] = useState(null); // {type, message}
  const [actionStatus, setActionStatus] = useState(null); // mensagens de update/remove

  // ======= NOVO: ESTADO PARA ARQUIVOS =======
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsStatus, setDocsStatus] = useState(null); // {type, message}

  const userName = localStorage.getItem("user_name") || "admin";

  const fetchMembers = async () => {
    setLoadingMembers(true);
    setActionStatus(null);

    try {
      // ✅ GET /members (sem /{org_id})
      const res = await api.get("/members");
      const data = res.data || {};

      // estrutura que você mostrou:
      // { org_id, org_name, members: [...] }
      if (data.org_id) {
        setOrgId(data.org_id);
        localStorage.setItem("org_id", data.org_id);
      }
      if (data.org_name) {
        setOrgName(data.org_name);
        localStorage.setItem("org_name", data.org_name);
      }

      let list = [];
      if (Array.isArray(data.members)) {
        list = data.members;
      } else if (Array.isArray(data)) {
        // fallback caso o back mude o formato pra um array puro
        list = data;
      }

      setMembers(list);
    } catch (err) {
      console.error(err);
      setActionStatus({
        type: "error",
        message: "Erro ao listar membros. Veja o console.",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  // ======= NOVO: BUSCAR DOCUMENTOS =======
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    setDocsStatus(null);

    try {
      // GET /documents  (ajuste se seu backend usar outro path)
      const res = await api.get("/documents");
      const data = res.data || {};

      // tenta pegar por data.documents ou array direto
      let list = [];
      if (Array.isArray(data.documents)) {
        list = data.documents;
      } else if (Array.isArray(data)) {
        list = data;
      } else {
        list = [];
      }

      setDocuments(list);
    } catch (err) {
      console.error(err);
      setDocsStatus({
        type: "error",
        message: "Erro ao listar arquivos. Veja o console.",
      });
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteStatus(null);
    setActionStatus(null);

    if (!inviteEmail || !inviteName) {
      setInviteStatus({
        type: "error",
        message: "Preencha nome e e-mail.",
      });
      return;
    }

    try {
      // POST /members/invite
      const body = {
        email: inviteEmail,
        name: inviteName,
      };
      if (orgId) body.org_id = orgId;
      if (inviteRole) body.role_in_org = inviteRole;

      const res = await api.post("/members/invite", body);
      console.log("INVITE RES:", res.data);

      setInviteStatus({
        type: "success",
        message: "Convite enviado com sucesso.",
      });
      setInviteEmail("");
      setInviteName("");
      setInviteRole("member");

      // atualiza lista depois de convidar
      fetchMembers();
    } catch (err) {
      console.error(err);
      let message = "Erro ao enviar convite.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        message +=
          " " + (typeof detail === "string" ? detail : JSON.stringify(detail));
      }
      setInviteStatus({ type: "error", message });
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setActionStatus(null);
    try {
      // PUT /members/{user_id}
      await api.put(`/members/${userId}`, {
        role_in_org: newRole,
      });

      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === userId ? { ...m, role_in_org: newRole } : m
        )
      );
      setActionStatus({
        type: "success",
        message: "Papel atualizado.",
      });
    } catch (err) {
      console.error(err);
      setActionStatus({
        type: "error",
        message: "Erro ao atualizar papel do membro.",
      });
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remover este membro da organização?")) return;

    setActionStatus(null);
    try {
      // DELETE /members/{user_id}
      await api.delete(`/members/${userId}`);

      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setActionStatus({
        type: "success",
        message: "Membro removido da organização.",
      });
    } catch (err) {
      console.error(err);
      setActionStatus({
        type: "error",
        message: "Erro ao remover membro.",
      });
    }
  };

  // ======= NOVO: REMOVER DOCUMENTO =======
  const handleDeleteDocument = async (doc) => {
    const docId = doc.id || doc.doc_id || doc.document_id;
    if (!docId) return;

    const ok = window.confirm(
      "Remover este arquivo da base? Essa ação não pode ser desfeita."
    );
    if (!ok) return;

    setDocsStatus(null);
    try {
      // DELETE /documents/{id}  (ajuste se o path for diferente)
      await api.delete(`/documents/${docId}`);

      setDocuments((prev) =>
        prev.filter(
          (d) =>
            (d.id || d.doc_id || d.document_id) !== docId
        )
      );

      setDocsStatus({
        type: "success",
        message: "Arquivo removido com sucesso.",
      });
    } catch (err) {
      console.error(err);
      let message = "Erro ao remover arquivo.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        message +=
          " " + (typeof detail === "string" ? detail : JSON.stringify(detail));
      }
      setDocsStatus({ type: "error", message });
    }
  };

  const handleGoToChat = () => {
    navigate("/chat");
  };

  const handleGoToUpload = () => {
    navigate("/arquivo");
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <h1>Administração da Organização</h1>
            <p>
              Gerencie membros da sua organização, arquivos da base e acesse o
              chat para fazer consultas.
            </p>
          </div>
          <div className="admin-header-right">
            <span className="admin-pill">
              Logado como <strong>{userName}</strong>
            </span>
            <span className="admin-pill">
              Org: <strong>{orgName || orgId || "—"}</strong>
            </span>
          </div>
        </div>

        {!orgId && (
          <div className="admin-alert">
            Nenhuma organização associada ao seu usuário. Confirme o fluxo de
            criação de org ou faça login novamente.
          </div>
        )}

        <div className="admin-sections">
          {/* coluna esquerda: convite + membros */}
          <div className="admin-column">
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>Convidar novo membro</h2>
                <p>
                  Envie convites para novos usuários entrarem nesta organização.
                </p>
              </div>

              <form className="admin-form" onSubmit={handleInvite}>
                <div className="admin-form-row">
                  <label>Nome</label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="Nome Completo"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>

                <div className="admin-form-row">
                  <label>Email</label>
                  <input
                    className="admin-input"
                    type="email"
                    placeholder="pessoa@empresa.com.br"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="admin-form-row">
                  <label>Papel na organização</label>
                  <select
                    className="admin-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="member">Membro</option>
                    <option value="admin">Admin da organização</option>
                  </select>
                </div>

                {inviteStatus && (
                  <div
                    className={
                      "admin-status " +
                      (inviteStatus.type === "success"
                        ? "admin-status--success"
                        : "admin-status--error")
                    }
                  >
                    {inviteStatus.message}
                  </div>
                )}

                <div className="admin-actions">
                  <button
                    type="submit"
                    className="admin-btn-primary"
                    disabled={!orgId}
                  >
                    Enviar convite
                  </button>
                </div>
              </form>
            </section>

            <section className="admin-section">
              <div className="admin-section-header">
                <h2>Membros da organização</h2>
                <p>Veja quem faz parte da sua organização e gerencie papéis.</p>
              </div>

              <div className="admin-members-header">
                <button
                  type="button"
                  className="admin-btn-ghost"
                  onClick={fetchMembers}
                  disabled={loadingMembers}
                >
                  {loadingMembers ? "Atualizando..." : "Atualizar lista"}
                </button>
              </div>

              {actionStatus && (
                <div
                  className={
                    "admin-status " +
                    (actionStatus.type === "success"
                      ? "admin-status--success"
                      : "admin-status--error")
                  }
                >
                  {actionStatus.message}
                </div>
              )}

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Papel</th>
                      <th style={{ width: 160 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={4} className="admin-table-empty">
                          Nenhum membro encontrado para esta organização.
                        </td>
                      </tr>
                    )}

                    {members.map((m) => (
                      <tr key={m.user_id}>
                        <td>{m.name || "-"}</td>
                        <td>{m.email || "-"}</td>
                        <td>
                          <span
                            className={
                              "admin-badge " +
                              (m.role_in_org === "admin"
                                ? "admin-badge--admin"
                                : "admin-badge--member")
                            }
                          >
                            {m.role_in_org === "admin"
                              ? "Admin"
                              : "Membro"}
                          </span>
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            {m.role_in_org === "admin" ? (
                              <button
                                type="button"
                                className="admin-btn-small"
                                onClick={() =>
                                  handleChangeRole(m.user_id, "member")
                                }
                              >
                                Tornar membro
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="admin-btn-small"
                                onClick={() =>
                                  handleChangeRole(m.user_id, "admin")
                                }
                              >
                                Tornar admin
                              </button>
                            )}
                            <button
                              type="button"
                              className="admin-btn-small admin-btn-danger"
                              onClick={() => handleRemove(m.user_id)}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* coluna direita: atalhos + arquivos */}
          <div className="admin-column admin-column--side">
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>Atalhos</h2>
                <p>Acesse rapidamente o chat e os documentos.</p>
              </div>

              <div className="admin-shortcuts">
                <button
                  type="button"
                  className="admin-btn-primary admin-btn-full"
                  onClick={handleGoToChat}
                >
                  Abrir chat
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary admin-btn-full"
                  onClick={handleGoToUpload}
                >
                  Adicionar arquivo
                </button>
              </div>

              <p className="admin-hint">
                O chat não guarda histórico: cada pergunta é independente e
                baseada nos dados configurados para esta organização.
              </p>
            </section>

            {/* ======= NOVA SEÇÃO: ARQUIVOS ======= */}
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>Arquivos na base</h2>
                <p>
                  Veja os arquivos já enviados e apague o que não precisar mais.
                </p>
              </div>

              <div className="admin-members-header">
                <button
                  type="button"
                  className="admin-btn-ghost"
                  onClick={fetchDocuments}
                  disabled={loadingDocs}
                >
                  {loadingDocs ? "Carregando..." : "Atualizar arquivos"}
                </button>
              </div>

              {docsStatus && (
                <div
                  className={
                    "admin-status " +
                    (docsStatus.type === "success"
                      ? "admin-status--success"
                      : "admin-status--error")
                  }
                >
                  {docsStatus.message}
                </div>
              )}

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>ID</th>
                      <th>Criado em</th>
                      <th style={{ width: 120 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="admin-table-empty">
                          Nenhum arquivo encontrado.
                        </td>
                      </tr>
                    )}

                    {documents.map((doc, idx) => {
                      const id =
                        doc.id || doc.doc_id || doc.document_id || `#${idx + 1}`;
                      const title =
                        doc.title ||
                        doc.doc_title ||
                        doc.name ||
                        "(sem título)";
                      const createdRaw =
                        doc.created_at ||
                        doc.ingested_at ||
                        doc.created ||
                        "";
                      const created =
                        createdRaw && !isNaN(Date.parse(createdRaw))
                          ? new Date(createdRaw).toLocaleString()
                          : createdRaw || "—";

                      return (
                        <tr key={id}>
                          <td>{title}</td>
                          <td style={{ fontSize: 12, color: "#9ca3af" }}>
                            {id}
                          </td>
                          <td>{created}</td>
                          <td>
                            <div className="admin-table-actions">
                              <button
                                type="button"
                                className="admin-btn-small admin-btn-danger"
                                onClick={() => handleDeleteDocument(doc)}
                              >
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
