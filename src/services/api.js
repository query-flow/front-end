// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// Helpers de storage
const LS_API_KEY = 'qf_api_key'
const LS_ORG_ID  = 'qf_org_id'

export function getApiKey() {
  return localStorage.getItem(LS_API_KEY) || ''
}
export function setApiKey(v) {
  localStorage.setItem(LS_API_KEY, v || '')
}
export function getOrgId() {
  return localStorage.getItem(LS_ORG_ID) || (import.meta.env.VITE_DEFAULT_ORG_ID || '')
}
export function setOrgId(v) {
  localStorage.setItem(LS_ORG_ID, v || '')
}

// === Chat principal: /perguntar_org ===
export async function perguntarOrg({ pergunta, max_linhas = 100, enrich = true }) {
  const apiKey = getApiKey()
  const orgId  = getOrgId()
  if (!apiKey) throw new Error('API Key não configurada.')
  if (!orgId)  throw new Error('org_id não configurado.')

  const res = await fetch(`${BASE_URL}/perguntar_org`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({
      org_id: orgId,
      pergunta,
      max_linhas,
      enrich
    })
  })
  if (!res.ok) {
    const err = await safeJson(res)
    throw new Error(err?.detail || `Erro ${res.status}`)
  }
  // formato: { schema_usado, sql, resultado: { colunas, dados }, insights?: { summary, chart } }
  return await res.json()
}

async function safeJson(r) { try { return await r.json() } catch { return null } }

// === Endpoints de bootstrap/admin (opcionais) ===
export async function publicBootstrapOrg(payload) {
  // payload: { org_name, database_url, allowed_schemas:[], admin_name, admin_email, admin_api_key }
  const res = await fetch(`${BASE_URL}/public/bootstrap_org`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await safeJson(res)
    throw new Error(err?.detail || `Erro ${res.status}`)
  }
  return await res.json() // { org_id, admin_user_id }
}
