/**
 * ChatMessage – Renders a single message bubble
 * @param {{ message: { sender: 'user' | 'ai', content: string, isError?: boolean } }}
 */

import './ChatMessage.css'

export default function ChatMessage({ message }) {
  const { sender, content, isError } = message
  const isFromUser = sender === 'user'
  const variant = isFromUser ? 'user' : 'ai'
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`chat-message chat-message--${variant} ${isError ? 'chat-message--error' : ''} transition-smooth`}>
      <div className="chat-message__bubble">
        <span className="chat-message__content">{content}</span>
      </div>
      <div className="chat-message__info">
        <span>{isFromUser ? 'You' : 'AI'}</span>
        <span>{time}</span>
      </div>
    </div>
  )
}
