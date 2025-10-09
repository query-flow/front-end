import { useRef, useState, useEffect } from 'react'
import MessageBubble from './MessageBubble.jsx'
import { sendPrompt } from '../services/api.js'
import '../styles/home.css'
import '../styles/chat.css'

export default function ChatWindow({ chat, onSend }) {
  const listRef = useRef(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  // Scroll para o fim quando novas mensagens chegam
  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [chat?.messages?.length])

  async function submit() {
    const trimmed = text.trim()
    if (!trimmed || sending || !chat) return
    setSending(true)
    setText('')

    // adiciona msg do usuário
    onSend({ role: 'user', content: trimmed })

    try {
      const reply = await sendPrompt(trimmed) // chamada real da API
      onSend({ role: 'assistant', content: reply })
    } catch (e) {
      onSend({ role: 'assistant', content: 'Erro ao chamar API.' })
    } finally {
      setSending(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  if (!chat) {
    return (
      <section className="chat-empty">
        <h1>Por onde começamos?</h1>
        <p>Crie um novo chat na barra lateral.</p>
      </section>
    )
  }

  return (
    <section className="chat">
      <div className="chat-messages" ref={listRef}>
        {chat.messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}
        {chat.messages.length === 0 && (
          <div className="chat-empty">
            <h1>Por onde começamos?</h1>
            <p>Faça uma pergunta para a sua plataforma.</p>
          </div>
        )}
      </div>

      <div className="chat-composer">
        <textarea
          rows={1}
          placeholder="Digite sua pergunta..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="btn-primary" disabled={sending} onClick={submit}>Enviar</button>
      </div>
      <div className="hint">Enter para enviar • Shift+Enter para nova linha</div>
    </section>
  )
}
