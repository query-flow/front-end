// src/pages/Settings.jsx
import { useEffect, useState } from 'react'
import { getApiKey, setApiKey, getOrgId, setOrgId } from '../services/api.js'
import '../styles/login.css'

export default function Settings() {
  const [orgId, setOrg] = useState('')
  const [apiKey, setKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setOrg(getOrgId())
    setKey(getApiKey())
  }, [])

  function save(e) {
    e.preventDefault()
    setOrgId(orgId.trim())
    setApiKey(apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={save}>
        <h2>Configurações da API</h2>
        <label htmlFor="org">org_id</label>
        <input id="org" value={orgId} onChange={e => setOrg(e.target.value)} placeholder="ex: 3fa85f64ab12" />

        <label htmlFor="key">API Key (X-API-Key)</label>
        <input id="key" value={apiKey} onChange={e => setKey(e.target.value)} placeholder="min. 16 caracteres" />

        <button type="submit">Salvar</button>
        {saved && <p style={{marginTop:8}}>Salvo!</p>}
      </form>
    </div>
  )
}
