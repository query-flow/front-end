// src/components/AdminSidebar.jsx
import '../styles/adminSidebar.css'
import { logout } from '../services/auth.js'

const items = [
  { key: 'home',         label: 'Home',                 icon: '🏠' },
  { key: 'config',       label: 'Configurações',        icon: '⚙️' },
  { key: 'dependentes',  label: 'Usuários dependentes', icon: '👥' },
  { key: 'cadastrar',    label: 'Cadastrar usuário',    icon: '➕' },
  { key: 'plano',        label: 'Gerenciar Plano',      icon: '💳' },
  { key: 'usuarios',     label: 'Gerenciar usuários',   icon: '🧑‍💻' },
]

export default function AdminSidebar({ active, onNavigate }) {
  return (
    <aside className="asb">
      <div className="asb__header">
        <div className="asb__brand">
          <div className="asb__logo">A</div>
          <div className="asb__brandText">
            <div className="asb__brandName">Admin</div>
            <div className="asb__brandSub">Query-Flow</div>
          </div>
        </div>
      </div>

      <nav className="asb__list">
        {items.map((it) => (
          <button
            key={it.key}
            className={`asb__item ${active === it.key ? 'is-active' : ''}`}
            onClick={() => onNavigate(it.key)}
          >
            <span className="asb__icon" aria-hidden>{it.icon}</span>
            <span className="asb__label">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="asb__footer">
        <button
          className="asb__back"
          onClick={() => { logout(); window.location.href = '/login' }}
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
