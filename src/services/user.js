// Mock simples guardado no localStorage — substitua por API real quando tiver.

const KEY = 'qf_user_profile_v1'
const PASS_KEY = 'qf_user_password_v1'

// cria um perfil default se não existir
function ensureSeed() {
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify({
      name: 'Usuário QueryFlow',
      email: 'voce@empresa.com',
      company: 'Minha Empresa',
    }))
  }
  if (!localStorage.getItem(PASS_KEY)) {
    localStorage.setItem(PASS_KEY, '12345678') // MOCK — troque ao integrar backend
  }
}

export function getUserProfile() {
  ensureSeed()
  return JSON.parse(localStorage.getItem(KEY))
}

export function updateUserProfile(patch) {
  const curr = getUserProfile()
  const next = { ...curr, ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function changePassword({ current, next, confirm }) {
  ensureSeed()
  const stored = localStorage.getItem(PASS_KEY)
  if (!current || stored !== current) {
    return { ok: false, error: 'Senha atual incorreta.' }
  }
  if (!next || next.length < 8) {
    return { ok: false, error: 'A nova senha deve ter pelo menos 8 caracteres.' }
  }
  if (next !== confirm) {
    return { ok: false, error: 'A confirmação não confere.' }
  }
  localStorage.setItem(PASS_KEY, next)
  return { ok: true }
}
