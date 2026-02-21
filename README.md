# AI Chat Bot

A React chatbot with Hugging Face integration. Clean, component-based architecture with dark mode.

## Features

- **Conversational AI** – Powered by Hugging Face DialoGPT
- **Session-based chat** – History persists until "New chat" or page reload
- **Dark theme** – Professional dark mode with readable contrast
- **Error handling** – User-friendly messages for API failures
- **Responsive UI** – Typing indicator, disabled states, auto-scroll

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root component
├── index.css             # Base styles, theme import
├── components/
│   ├── ChatUI/           # Main chat interface
│   ├── ChatMessage/      # Message bubble
│   └── MessageInput/     # Input + Send button
├── services/
│   └── api.js            # Hugging Face API client
├── utils/
│   └── errorMessages.js  # Error-to-message mapping
└── theme/
    └── theme.css         # CSS variables (dark mode)
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure API key**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your Hugging Face token:
   ```
   VITE_HUGGINGFACE_API_KEY=your_token_here
   ```
   Get a token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## API

- `sendChatMessage(message, apiKey?, model?, history?)` – Conversational chat
- `generateText(prompt, apiKey?, model?)` – Simple text generation

## Tech Stack

- React 18
- Vite 5
- Hugging Face Inference API
