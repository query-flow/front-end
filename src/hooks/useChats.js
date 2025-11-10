import { useEffect, useMemo, useState } from 'react'

const LS_KEY = 'qf_chats_v1'

/**
 * Estrutura:
 * chat = { id, title, messages: [{role, content, ts}], updatedAt }
 */
export default function useChats() {
  const [chats, setChats] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return []
      return JSON.parse(raw)
    } catch {
      return []
    }
  })
  const [activeId, setActiveId] = useState(() => chats[0]?.id ?? null)

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(chats))
  }, [chats])

  const sortedChats = useMemo(
    () => [...chats].sort((a, b) => b.updatedAt - a.updatedAt),
    [chats]
  )

  const activeChat = useMemo(
    () => sortedChats.find(c => c.id === activeId) ?? sortedChats[0] ?? null,
    [sortedChats, activeId]
  )

  function createChat() {
    const id = crypto.randomUUID()
    const nc = { id, title: 'Novo chat', messages: [], updatedAt: Date.now() }
    setChats(prev => [nc, ...prev])
    setActiveId(id)
  }

  function appendMessage(chatId, msg) {
    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c
      const title =
        c.title === 'Novo chat' && msg.role === 'user'
          ? msg.content.slice(0, 40)
          : c.title
      return {
        ...c,
        title: title || c.title,
        messages: [...c.messages, { ...msg, ts: Date.now() }],
        updatedAt: Date.now(),
      }
      function deleteChat(chatId) {
        setChats(prev => prev.filter(c => c.id !== chatId))
        // se deletar o ativo, seleciona o próximo disponível
        setActiveId(prev => (prev === chatId ? (chats.find(c => c.id !== chatId)?.id ?? null) : prev))
      }
    }
  
  ))
  }

  return { chats: sortedChats, activeChat, setActiveId, createChat, appendMessage }
}
