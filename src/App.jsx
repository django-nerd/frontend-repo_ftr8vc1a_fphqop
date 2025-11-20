import { useEffect, useRef, useState } from 'react'

function Message({ role, content }) {
  return (
    <div className={`w-full flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`${role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100'} max-w-[80%] rounded-2xl px-4 py-3 shadow-sm whitespace-pre-wrap`}>
        {content}
      </div>
    </div>
  )
}

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your coding buddy. Describe what you want to build and I'll help you step-by-step." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, temperature: 0.7 }),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `I couldn't reach the AI service. ${e.message}. You can add an OpenAI API key to enable real responses.` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 bg-slate-900/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">AI</div>
            <h1 className="text-lg font-semibold">Chat Assistant</h1>
          </div>
          <a href="/test" className="text-xs text-blue-300 hover:text-blue-200">Check backend</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        <div className="pt-6 pb-32">
          {messages.map((m, i) => (
            <Message key={i} role={m.role} content={m.content} />
          ))}
          {loading && (
            <div className="w-full flex justify-start mb-4">
              <div className="bg-slate-800 text-slate-300 max-w-[80%] rounded-2xl px-4 py-3 shadow-sm animate-pulse">Thinking…</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message the assistant…"
              className="flex-1 resize-none rounded-xl bg-slate-800 text-slate-100 placeholder:text-slate-400 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600/50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Tip: Add an OpenAI API key to use real AI responses. Without a key, you'll see a helpful simulated reply.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
