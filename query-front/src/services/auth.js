// src/services/auth.js
export async function login(email, password) {
  // mock simples só pra dev
  if (email && password) {
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user'
    localStorage.setItem('demo_token', 'token_exemplo')
    localStorage.setItem('demo_role', role)
    return { ok: true, role }
  }
  return { ok: false }
}

export function logout() {
  localStorage.removeItem('demo_token')
  localStorage.removeItem('demo_role')
}
