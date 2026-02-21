import React, { useState, useRef, useEffect } from 'react'
import './MessageInput.css'

function MessageInput({ onSendMessage, disabled, placeholder }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const handleInput = (e) => {
    setText(e.target.value)

    // Auto-resize
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text.trim())
      setText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  return (
    <div className={`message-input-bar ${disabled ? 'disabled' : ''}`}>
      <button className="tool-btn">📎</button>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
      />
      <div className="input-actions">
        <span className="char-count">{text.length}</span>
        <button
          className="send-btn transition-smooth"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          title="Send message"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default MessageInput
