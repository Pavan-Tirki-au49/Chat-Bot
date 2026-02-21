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

const CATEGORY_DATA = {
  All: [
    { icon: '📝', title: 'Content Creation', prompt: 'Write a blog post about the future of AI in 2025.' },
    { icon: '🖼️', title: 'Image Generation', prompt: 'Generate a futuristic city with flying cars in cyberpunk style.' },
    { icon: '📊', title: 'Data Analysis', prompt: 'Analyze this sample data: [10, 20, 30, 40] and give me the trend.' },
  ],
  Text: [
    { icon: '✍️', title: 'Creative Writing', prompt: 'Write a short sci-fi story about a robot discovering feelings.' },
    { icon: '📧', title: 'Email Templates', prompt: 'Draft a professional follow-up email after a job interview.' },
    { icon: '📚', title: 'Summarization', prompt: 'Summarize the concept of quantum entanglement for a 5-year-old.' },
  ],
  Image: [
    { icon: '🎨', title: 'Artistic Styles', prompt: 'Describe a landscape in the style of Van Gogh.' },
    { icon: '📸', title: 'Product Photography', prompt: 'Generate a high-end watch on a marble surface with soft lighting.' },
    { icon: '🎭', title: 'Character Design', prompt: 'Design a fantasy warrior with dragon-scaled armor.' },
  ],
  Video: [
    { icon: '🎬', title: 'Video Scripts', prompt: 'Write a 60-second script for a viral tech review video.' },
    { icon: '🎞️', title: 'Animation Ideas', prompt: 'Describe a 3D animation sequence for a magical forest transition.' },
    { icon: '📽️', title: 'Cinematic Prompts', prompt: 'Provide camera angles and lighting setups for a noir detective scene.' },
  ],
  Music: [
    { icon: '🎵', title: 'Lyric Writing', prompt: 'Write catch lyrics for a synth-wave song about nostalgia.' },
    { icon: '🎹', title: 'Melody Ideas', prompt: 'Describe a melancholic piano progression in C minor.' },
    { icon: '🎧', title: 'Production Advice', prompt: 'How do I achieve a "lo-fi" aesthetic in my music production?' },
  ],
  Analytics: [
    { icon: '📈', title: 'Market Trends', prompt: 'What are the current tech market trends for Q1 2026?' },
    { icon: '🔍', title: 'SEO Optimization', prompt: 'Give me 5 SEO keywords for a vegan recipe blog.' },
    { icon: '📐', title: 'Math Problem Solving', prompt: 'Explain and solve the Pythagorean theorem with examples.' },
  ]
}

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
  const [selectedModel, setSelectedModel] = useState('meta-llama/Llama-3.2-1B-Instruct')

  const MODELS = {
    Text: ['meta-llama/Llama-3.2-1B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3', 'google/gemma-2-2b-it'],
    Image: ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-3.5-large'],
    Analytics: ['meta-llama/Llama-3.2-3B-Instruct', 'Qwen/Qwen2.5-Coder-7B-Instruct']
  }

  const currentModels = useMemo(() => {
    if (selectedCategory === 'Image') return MODELS.Image
    if (selectedCategory === 'Analytics') return MODELS.Analytics
    return MODELS.Text
  }, [selectedCategory])

  // Update selected model when category changes
  useEffect(() => {
    setSelectedModel(currentModels[0])
  }, [currentModels])

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

  // Filtered feature cards based on selected category
  const filteredCards = useMemo(() => {
    return CATEGORY_DATA[selectedCategory] || CATEGORY_DATA['All']
  }, [selectedCategory])

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

      const { text: reply } = await sendChatMessage(text, null, selectedModel, history)
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
            <div className="model-selector-wrapper glass">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
              >
                {currentModels.map(m => (
                  <option key={m} value={m}>{m.split('/').pop()}</option>
                ))}
              </select>
            </div>
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
                <p className="welcome-desc">Currently in <strong>{activeFolder}</strong>. Choose a category below to explore specialized templates.</p>
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

              <div className="feature-grid">
                {filteredCards.map(card => (
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
