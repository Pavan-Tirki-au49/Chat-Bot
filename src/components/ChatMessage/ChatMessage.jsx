import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './ChatMessage.css'

export default function ChatMessage({ message }) {
  const { sender, content, isError } = message
  const isFromUser = sender === 'user'
  const variant = isFromUser ? 'user' : 'ai'
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const handleSpeak = () => {
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(content)
    // Filter out markdown characters for cleaner speech if needed, 
    // but usually simple is best for now
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className={`chat-message chat-message--${variant} ${isError ? 'chat-message--error' : ''} transition-smooth`}>
      <div className="chat-message__bubble">
        {isFromUser ? (
          <span className="chat-message__content">{content}</span>
        ) : (
          <div className="chat-message__markdown">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <div className="chat-message__info">
        <div className="info-meta">
          <span>{isFromUser ? 'You' : 'AI'}</span>
          <span>{time}</span>
        </div>
        <button
          className="speak-btn transition-smooth"
          onClick={handleSpeak}
          title="Listen to message"
        >
          🔊
        </button>
      </div>
    </div>
  )
}
