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

  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          setText(prev => prev + (prev.length > 0 ? ' ' : '') + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSend = () => {
    if (text.trim() && !disabled) {
      if (isListening) recognitionRef.current.stop()
      onSendMessage(text.trim())
      setText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  return (
    <div className={`message-input-bar ${disabled ? 'disabled' : ''} ${isListening ? 'listening' : ''}`}>
      <button className="tool-btn" title="Add Attachment">📎</button>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : placeholder}
        disabled={disabled}
        rows={1}
      />
      <div className="input-actions">
        <span className="char-count">{text.length}</span>
        <button
          className={`voice-btn ${isListening ? 'active' : ''}`}
          onClick={toggleListening}
          title={isListening ? "Stop Listening" : "Voice Input"}
          disabled={disabled}
        >
          {isListening ? '🛑' : '🎤'}
        </button>
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
