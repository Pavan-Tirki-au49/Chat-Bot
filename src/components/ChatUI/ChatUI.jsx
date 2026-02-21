import React, { useState, useEffect, useRef, useMemo } from 'react'
import { toFriendlyErrorMessage } from '../../utils/errorMessages'
import { isApiKeyConfigured, sendChatMessage } from '../../services/api'
import { useTheme } from '../../theme/ThemeContext'
import ChatMessage from '../ChatMessage/ChatMessage'
import MessageInput from '../MessageInput/MessageInput'
import './ChatUI.css'

const CATEGORIES = ['All', 'Text', 'Image', 'Video', 'Music', 'Analytics']
const FOLDERS = [
  { name: 'Work chats', color: '#a3e635' },
  { name: 'Life chats', color: '#38bdf8' },
  { name: 'Projects chats', color: '#fb923c' },
  { name: 'Creative chats', color: '#818cf8' },
]

const FEATURE_CARDS = [
  { icon: '📝', title: 'Saved Prompt Templates', prompt: 'Give me 5 professional email templates for status updates.' },
  { icon: '📁', title: 'Media Type Selection', prompt: 'How can I organize my digital media files effectively?' },
  { icon: '🌐', title: 'Multilingual Support', prompt: 'Translate "Welcome to our AI terminal" into French, Spanish, and Japanese.' },
]

function ChatUI() {
  // Persistence
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('ai_chats')
    return saved ? JSON.parse(saved) : []
  })

  const [activeChatId, setActiveChatId] = useState(null)
  const [activeFolder, setActiveFolder] = useState('Work chats')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { theme, toggleTheme } = useTheme()
  const messagesEndRef = useRef(null)
  const isApiKeyMissing = !isApiKeyConfigured()

  // Save chats on change
  useEffect(() => {
    localStorage.setItem('ai_chats', JSON.stringify(chats))
  }, [chats])

  // Get active chat
  const activeChat = useMemo(() =>
    chats.find(c => c.id === activeChatId) || null
    , [chats, activeChatId])

  // Filtered chats for sidebar
  const filteredSidebarChats = useMemo(() => {
    return chats
      .filter(c => c.folder === activeFolder)
      .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [chats, activeFolder, searchQuery])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeChat?.messages, isLoading])

  const createId = () => Date.now().toString()

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return

    let currentId = activeChatId
    let updatedChats = [...chats]

    // Create new chat if none active
    if (!currentId) {
      currentId = createId()
      const newChat = {
        id: currentId,
        title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
        folder: activeFolder,
        messages: [],
        timestamp: Date.now()
      }
      updatedChats.push(newChat)
      setChats(updatedChats)
      setActiveChatId(currentId)
    }

    const userMsg = { id: createId(), sender: 'user', content: text, timestamp: Date.now() }

    // Update local state for immediate feedback
    setChats(prev => prev.map(c =>
      c.id === currentId
        ? { ...c, messages: [...c.messages, userMsg], timestamp: Date.now() }
        : c
    ))

    setIsLoading(true)
    setError(null)

    try {
      const history = {
        pastUserInputs: activeChat ? activeChat.messages.filter(m => m.sender === 'user').map(m => m.content) : [],
        generatedResponses: activeChat ? activeChat.messages.filter(m => m.sender === 'ai').map(m => m.content) : []
      }

      const { text: reply } = await sendChatMessage(text, null, undefined, history)
      const aiMsg = { id: createId(), sender: 'ai', content: reply, timestamp: Date.now() }

      setChats(prev => prev.map(c =>
        c.id === currentId
          ? { ...c, messages: [...c.messages, aiMsg] }
          : c
      ))
    } catch (err) {
      console.error('Chat API Error:', err)
      const friendlyMessage = toFriendlyErrorMessage(err)
      setError(friendlyMessage)
      const errorMsg = { id: createId(), sender: 'ai', content: friendlyMessage, isError: true, timestamp: Date.now() }
      setChats(prev => prev.map(c =>
        c.id === currentId ? { ...c, messages: [...c.messages, errorMsg] } : c
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const exportChat = () => {
    if (!activeChat) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeChat, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `${activeChat.title.replace(/\s+/g, '_')}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const startNewChat = () => {
    setActiveChatId(null)
    setError(null)
  }

  const deleteChat = (e, id) => {
    e.stopPropagation()
    setChats(prev => prev.filter(c => c.id !== id))
    if (activeChatId === id) setActiveChatId(null)
  }

  return (
    <div className="chat-layout transition-smooth">
      {/* Sidebar */}
      <aside className="chat-sidebar transition-smooth">
        <div className="sidebar-header">
          <div className="brand" onClick={startNewChat} style={{ cursor: 'pointer' }}>
            <div className="brand-logo">🟢</div>
            <span>Chat AI</span>
          </div>
          <button className="icon-btn" onClick={clearSearch} title="Clear Search">🔄</button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sidebar-section">
          <header className="section-header">
            <span>Folders</span>
            <button className="add-btn">+</button>
          </header>
          <div className="folder-list">
            {FOLDERS.map(f => (
              <div
                key={f.name}
                className={`folder-item transition-smooth ${activeFolder === f.name ? 'active' : ''}`}
                onClick={() => {
                  setActiveFolder(f.name)
                  setActiveChatId(null) // Switch folder resets view
                }}
              >
                <span className="dot" style={{ backgroundColor: f.color }}></span>
                {f.name}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-section chats">
          <header className="section-header">
            <span>{activeFolder}</span>
          </header>
          <div className="chat-list">
            {filteredSidebarChats.length === 0 ? (
              <div className="no-chats">No chats in this folder</div>
            ) : (
              filteredSidebarChats.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-item transition-smooth ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <span className="chat-title">{chat.title}</span>
                  <button className="delete-chat" onClick={(e) => deleteChat(e, chat.id)}>×</button>
                </div>
              ))
            )}
          </div>
        </div>

        <button className="new-chat-btn transition-smooth" onClick={startNewChat}>
          <span>New Chat</span>
          <span className="plus">+</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="chat-main">
        <header className="chat-header glass">
          <div className="header-info">
            <div className="header-breadcrumbs">
              <button className="icon-btn" onClick={() => setActiveChatId(null)}>◀</button>
              <span>{activeChat ? activeChat.title : 'New Session'}</span>
              <span className="badge-online">{activeFolder}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="icon-btn" title="Export Chat" onClick={exportChat}>📤</button>
            <button className="icon-btn" title="Settings">⚙️</button>
          </div>
        </header>

        <section className="chat-body">
          {!activeChat ? (
            <div className="empty-state">
              <div className="welcome-section">
                <div className="welcome-logo">🟢</div>
                <h2>How can i help you today?</h2>
                <p className="welcome-desc">Currently in <strong>{activeFolder}</strong>. Choose a template below or start typing to begin.</p>
              </div>

              <div className="feature-grid">
                {FEATURE_CARDS.map(card => (
                  <div
                    key={card.title}
                    className="feature-card glass transition-smooth"
                    onClick={() => handleSendMessage(card.prompt)}
                  >
                    <span className="card-icon">{card.icon}</span>
                    <h3>{card.title}</h3>
                    <p>Click to try: "{card.prompt.slice(0, 40)}..."</p>
                  </div>
                ))}
              </div>

              <div className="category-tabs">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`tab-btn transition-smooth ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {activeChat.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="ai-loading">
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {error && (
            <div className="error-bar glass transition-smooth">
              <i className="error-icon">⚠️</i>
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}
        </section>

        <footer className="chat-footer">
          <div className="input-wrapper glass transition-smooth">
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || isApiKeyMissing}
              placeholder={isApiKeyMissing ? "Configure API key..." : `Message in ${activeFolder}...`}
            />
          </div>
          <p className="footer-disclaimer">Llama 3.2 • Powered by Hugging Face • Version 1.0</p>
        </footer>
      </main>
    </div>
  )
}

export default ChatUI
