# Premium AI Chatbot - Full Project Blueprint 🚀

This document contains the complete step-by-step prompts and technical architecture to recreate the **Lime Green AI Chatbot** exactly as we built it.

## 📁 Environment Setup (`.env`)
The project requires a Hugging Face API key with "Inference Provider" permissions.
```env
VITE_HUGGINGFACE_API_KEY=hf_your_actual_token_here
```

---

## 🛠️ Phase 1: The Unified API Service (`api.js`)
**Prompt:**
> Create a React-compatible API service file. Use the Hugging Face router: `https://router.huggingface.co/v1/chat/completions`. Implement a `sendChatMessage` function that supports conversation history (OpenAI-compatible message array). Default to `meta-llama/Llama-3.2-1B-Instruct`. Include a connectivity test function that checks if the browser can reach global services (to diagnose firewall/VPN issues).

---

## 🎨 Phase 2: Design System & Themes (`theme.css`)
**Prompt:**
> Build a dual-theme CSS system.
> - **Primary Accent**: Lime Green `#a3e635`.
> - **Dark Mode**: Background `#0a0a0a`, Sidebar `#111111`, Cards `#1a1a1a`.
> - **Features**: Glassmorphism (`backdrop-filter: blur(12px)`), smooth transitions, and organic bubble shapes.
> - **Typography**: Modern sans-serif (Inter/Segoe UI).

---

## 📂 Phase 3: Sidebar & Persistence Logic
**Prompt:**
> Build a Chat UI with a 300px sidebar.
> - **Folders**: Implement Work, Life, Projects, and Creative categories.
> - **Persistence**: Use `localStorage` to save all chats. Chats must be filtered by the active folder.
> - **Title Logic**: Automatically derive the chat title from the first message sent.
> - **Management**: Add functionality to delete individual chats and a search bar to filter history.

---

## 🖥️ Phase 4: Premium Landing Page
**Prompt:**
> Design an 'Empty State' dashboard for the chatbot.
> 1.  **Header**: Large central hero section: 'How can I help you today?'.
> 2.  **Feature Cards**: A grid of 3 premium cards with icons. Each card should contain a sample prompt (e.g., Email Templates, Language Translation).
> 3.  **Click-to-Send**: Clicking a card should instantly send its prompt to the AI.
> 4.  **Tabs**: Visual category tabs (Text, Image, analytics) to enhance the dashboard feel.

---

## ⌨️ Phase 5: Smart Input & Message UI
**Prompt:**
> Build modular `MessageInput` and `ChatMessage` components.
> - **Input**: Floating glass container with auto-resizing textarea, character count, and a lime green circular send button.
> - **Messages**: 
>   - User: Lime green bubble, right-aligned, dark text.
>   - AI: Dark gray bubble, left-aligned, white text.
>   - Include timestamps and 'AI'/'You' indicators.
>   - Add a 'thinking' animation (jumping dots) for when the model is processing.

---

## 📤 Phase 6: Export & Final Polish
**Prompt:**
> Add advanced utility features:
> 1.  **Export**: A button in the header that takes the active chat, converts it to JSON, and triggers a file download in the browser.
> 2.  **Theme Toggle**: Smoothly switch between light and dark variants of the Lime theme.
> 3.  **Error Handling**: Create a friendly error boundary that translates technical status codes (401, 404, 503) into human-readable advice (e.g., 'Model Warming Up', 'Check API Key').
