import React, { useState } from 'react'
import './SettingsModal.css'

export default function SettingsModal({
    isOpen,
    onClose,
    onClearHistory,
    userApiKey,
    onUpdateApiKey,
    isVoiceEnabled,
    onToggleVoice
}) {
    const [tempKey, setTempKey] = useState(userApiKey || '')

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Application Settings</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </header>

                <section className="modal-body">
                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Hugging Face API Key</h3>
                            <p>Override the default API key with your own for higher rate limits.</p>
                        </div>
                        <div className="setting-input-group">
                            <input
                                type="password"
                                placeholder="hf_..."
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                            />
                            <button
                                className="save-key-btn"
                                onClick={() => onUpdateApiKey(tempKey)}
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Voice Assistant</h3>
                            <p>Automatically read out AI responses using your system's voice.</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={isVoiceEnabled}
                                onChange={(e) => onToggleVoice(e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Clear All Chats</h3>
                            <p>Permanently delete all your conversation history from this device.</p>
                        </div>
                        <button className="danger-btn" onClick={onClearHistory}>Delete All</button>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>System Prompt</h3>
                            <p>Coming Soon: Set a custom personality for the AI.</p>
                        </div>
                        <div className="badge">SOON</div>
                    </div>
                </section>

                <footer className="modal-footer">
                    <p>Version 1.1 • Strictly Aligned Edition</p>
                    <button className="done-btn" onClick={onClose}>Done</button>
                </footer>
            </div>
        </div>
    )
}
