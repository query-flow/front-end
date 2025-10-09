import '../styles/chat.css'

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`msg-row ${isUser ? 'end' : 'start'}`}>
      <div className={`msg-bubble ${isUser ? 'user' : 'bot'}`}>
        {content}
      </div>
    </div>
  )
}
