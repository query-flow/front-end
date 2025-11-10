import { useRef, useState, useEffect } from 'react'
import MessageBubble from './MessageBubble.jsx'
import { perguntarOrg } from '../services/api.js'
import '../styles/home.css'
import '../styles/chat.css'

export default function ChatWindow({ chat, onSend }) {
  const listRef = useRef(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [chat?.messages?.length])

  async function send() {
    const pergunta = text.trim()
    if (!pergunta) return

    setSending(true)
    setText('')
    // adiciona mensagem do usuário
    onSend({ role: 'user', type: 'text', content: pergunta })

    try {
      const resp = await perguntarOrg({ pergunta })
      // Quebramos a resposta em blocos: SQL, tabela, insights (resumo e gráfico)
      if (resp?.sql) {
        onSend({ role: 'assistant', type: 'code', lang: 'sql', content: resp.sql })
      }
      if (resp?.resultado?.colunas && resp?.resultado?.dados) {
        onSend({
          role: 'assistant',
          type: 'table',
          content: {
            columns: resp.resultado.colunas,
            rows: resp.resultado.dados
          }
        })
      }
      if (resp?.insights?.summary) {
        onSend({ role: 'assistant', type: 'text', content: resp.insights.summary })
      }
      if (resp?.insights?.chart) {
        onSend({ role: 'assistant', type: 'image_base64', content: resp.insights.chart })
      }
    } catch (e) {
      onSend({ role: 'assistant', type: 'text', content: `❌ ${e.message}` })
    } finally {
      setSending(false)
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!sending) send()
    }
  }

  if (!chat) return <div className="chat-empty" />

  return (
    <div className="chat-window">
      <div className="chat-messages" ref={listRef}>
        {chat.messages.map((m, idx) => (
          <MessageBubble key={idx} role={m.role} type={m.type} content={m.content} lang={m.lang} />
        ))}
        {chat.messages.length === 0 && (
          <div className="chat-empty">
            <h1>Por onde começamos?</h1>
            <p>Faça uma pergunta sobre seus dados.</p>
          </div>
        )}
      </div>

      <div className="chat-composer">
        <textarea
          rows={1}
          placeholder="Digite sua pergunta..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          disabled={sending}
        />
        <button disabled={sending} onClick={send}>
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
