// Ponto único para chamar sua API.
// Troque BASE_URL e os fetch conforme seu backend.
const BASE_URL = 'http://localhost:3000'

export async function sendPrompt(prompt) {
  // Exemplo: POST /chat
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error('Erro ao chamar API')
  const data = await res.json()
  // Assumindo que sua API devolve { reply: 'texto...' }
  return data.reply
}
