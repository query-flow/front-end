// src/components/ChatLayout.jsx
export default function ChatLayout({ sidebar, header, children }) {
  return (
    <div className="app-root">
      <aside className="chat-sidebar">{sidebar}</aside>
      <div className="chat-main">
        <header className="chat-header">{header}</header>
        {children}
      </div>
    </div>
  );
}
