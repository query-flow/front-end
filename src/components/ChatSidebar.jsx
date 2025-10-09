import '../styles/sidebar.css'
import logo from '../assets/logo.png'

export default function ChatSidebar({ chats, activeId, onSelect, onNew, onGoAdmin, onLogout, onDelete }) {
  return (
    <aside className="sb">
      {/* BRAND */}
      <div className="sb-header">
        <div className="sb-brand">
          <img src={logo} alt="Query-Flow" className="sb-logo" />
          <div className="sb-brand-text">
            <div className="sb-brand-name">Query-Flow</div>
            <div className="sb-brand-sub">assistente da sua plataforma</div>
          </div>
        </div>
        <button className="btn-secondary sb-new" onClick={onNew}>+ Novo chat</button>
      </div>

      {/* LISTA DE CHATS */}
      <div className="sb-list">
        {chats.length === 0 && <div className="sb-empty">Sem conversas ainda.</div>}
        {chats.map((c) => {
          const last = c.messages[c.messages.length - 1]
          return (
            <div
              key={c.id}
              className={`sb-item ${c.id === activeId ? 'active' : ''}`}
            >
              <button className="sb-item-main" onClick={() => onSelect(c.id)}>
                <div className="sb-item-title">{c.title || 'Sem título'}</div>
                <div className="sb-item-preview">{last?.content?.slice(0, 40) || 'Sem mensagens'}</div>
                <div className="sb-item-date">{new Date(c.updatedAt).toLocaleString()}</div>
              </button>
              <button
                className="sb-item-delete"
                title="Excluir chat"
                onClick={() => onDelete(c.id)}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* FOOTER */}
      <div className="sb-footer">
        <button className="btn-tertiary" onClick={() => (window.location.href = '/settings')}>
          ⚙️ Configurações
        </button>
        <button className="btn-tertiary" onClick={onLogout}>Sair</button>
      </div>
    </aside>
  )
}
