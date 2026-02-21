import ChatUI from './components/ChatUI/ChatUI'
import { ThemeProvider } from './theme/ThemeContext'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    console.log('App Mounted')
  }, [])

  return (
    <ThemeProvider>
      <main className="app">
        <ChatUI />
      </main>
    </ThemeProvider>
  )
}
