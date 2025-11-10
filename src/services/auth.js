// src/services/auth.js
import { setApiKey, setOrgId } from './api.js'

// “login” aqui significa apenas registrar API Key e org_id localmente.
export async function loginWithApiKey({ apiKey, orgId }) {
  if (!apiKey || apiKey.length < 16) {
    return { ok: false, error: 'API Key deve ter pelo menos 16 caracteres.' }
  }
  if (!orgId) {
    return { ok: false, error: 'org_id é obrigatório.' }
  }
  setApiKey(apiKey)
  setOrgId(orgId)
  return { ok: true }
}

export function logout() {
  setApiKey('')
  setOrgId('')
}
