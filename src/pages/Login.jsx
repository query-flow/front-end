// src/pages/Login.jsx
import { useState } from 'react'
import { loginWithApiKey } from '../services/auth.js'
import '../styles/login.css'

export default function Login() {
  const [orgId, setOrgId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    const ok = await loginWithApiKey({ orgId, apiKey })
    if (ok.ok) {
      window.location.href = '/'
    } else {
      setError(ok.error || 'Falha ao salvar credenciais')
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={submit}>
        <h2>Entrar</h2>
        <label>org_id</label>
        <input value={orgId} onChange={e => setOrgId(e.target.value)} />

        <label>API Key</label>
        <input value={apiKey} onChange={e => setApiKey(e.target.value)} />

        {error && <div className="error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
