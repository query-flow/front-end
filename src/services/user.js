// src/services/user.js
const PROFILE_KEY = 'qf_user_profile_v1';
const PASS_KEY = 'qf_user_password_v1';
const DBCONF_KEY = 'qf_db_config_v1';

function ensureSeed() {
  if (!localStorage.getItem(PROFILE_KEY)) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      name: 'Usuário QueryFlow',
      email: 'voce@empresa.com',
      company: 'Minha Empresa',
    }));
  }
  if (!localStorage.getItem(PASS_KEY)) {
    localStorage.setItem(PASS_KEY, '12345678');
  }
  if (!localStorage.getItem(DBCONF_KEY)) {
    localStorage.setItem(DBCONF_KEY, JSON.stringify({
      database_url: '',
      max_linhas: 100,
    }));
  }
}

export function getUserProfile() {
  ensureSeed();
  return JSON.parse(localStorage.getItem(PROFILE_KEY));
}
export function updateUserProfile(patch) {
  const curr = getUserProfile();
  const next = { ...curr, ...patch };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function changePassword({ current, next, confirm }) {
  ensureSeed();
  const stored = localStorage.getItem(PASS_KEY);
  if (!current || stored !== current) return { ok: false, error: 'Senha atual incorreta.' };
  if (!next || next.length < 8) return { ok: false, error: 'A nova senha deve ter pelo menos 8 caracteres.' };
  if (next !== confirm) return { ok: false, error: 'A confirmação não confere.' };
  localStorage.setItem(PASS_KEY, next);
  return { ok: true };
}

// === Config do DB ===
export function getDbConfig() {
  ensureSeed();
  return JSON.parse(localStorage.getItem(DBCONF_KEY));
}
export function updateDbConfig(patch) {
  const curr = getDbConfig();
  const next = { ...curr, ...patch };
  localStorage.setItem(DBCONF_KEY, JSON.stringify(next));
  return next;
}
