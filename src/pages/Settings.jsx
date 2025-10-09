// src/pages/Settings.jsx
import { useEffect, useState } from 'react'
import { getUserProfile, updateUserProfile, changePassword } from '../services/user.js'
import '../styles/settings.css' // estilos específicos da página de Configurações

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', company: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  // senha
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')

  useEffect(() => {
    setProfile(getUserProfile())
  }, [])

  function saveProfile(e) {
    e.preventDefault()
    setMsg(''); setErr('')
    try {
      const updated = updateUserProfile(profile)
      setProfile(updated)
      setMsg('Perfil atualizado com sucesso.')
    } catch {
      setErr('Não foi possível salvar agora.')
    }
  }

  function savePassword(e) {
    e.preventDefault()
    setPwdMsg(''); setPwdErr('')
    const res = changePassword({ current, next, confirm })
    if (res.ok) {
      setCurrent(''); setNext(''); setConfirm('')
      setPwdMsg('Senha alterada com sucesso.')
    } else {
      setPwdErr(res.error || 'Erro ao alterar senha.')
    }
  }

  return (
    <div className="settings-wrap">
      {/* Perfil */}
      <form className="settings-panel" onSubmit={saveProfile}>
        <h3>Configurações do perfil</h3>

        <div className="settings-grid-2">
          <div>
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              className=""
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className=""
              type="email"
              value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="company">Empresa</label>
            <input
              id="company"
              className=""
              value={profile.company}
              onChange={e => setProfile(p => ({ ...p, company: e.target.value }))}
            />
          </div>
        </div>

        {msg && <div className="settings-msg">{msg}</div>}
        {err && <div className="settings-err">{err}</div>}

        <button className="btn-primary" type="submit">Salvar perfil</button>
      </form>

      {/* Senha */}
      <form className="settings-panel" onSubmit={savePassword}>
        <h3>Alterar senha</h3>

        <div className="settings-grid-2">
          <div>
            <label htmlFor="current">Senha atual</label>
            <input
              id="current"
              type="password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div>
            <label htmlFor="next">Nova senha</label>
            <input
              id="next"
              type="password"
              value={next}
              onChange={e => setNext(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirm">Confirmar nova senha</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {pwdMsg && <div className="settings-msg">{pwdMsg}</div>}
        {pwdErr && <div className="settings-err">{pwdErr}</div>}

        <button className="btn-secondary" type="submit">Salvar nova senha</button>
      </form>
    </div>
  )
}
