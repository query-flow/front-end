import ChatSidebar from '../components/ChatSidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import useChats from '../hooks/useChats.js'
import { logout } from '../services/auth.js'
import '../styles/home.css'
import '../styles/sidebar.css'

export default function Home() {
  const { chats, activeChat, setActiveId, createChat, appendMessage } = useChats()

  function handleSend(msg) {
    if (!activeChat) return
    appendMessage(activeChat.id, msg)
  }

  return (
    <div className="layout">
      <ChatSidebar
        chats={chats}
        activeId={activeChat?.id}
        onSelect={setActiveId}
        onNew={createChat}
        onGoAdmin={() => (window.location.href = '/admin')}
        onLogout={() => { logout(); window.location.href = '/login' }}
      />
      <main className="main">
        <ChatWindow chat={activeChat} onSend={handleSend} />
      </main>
    </div>
  )
}
