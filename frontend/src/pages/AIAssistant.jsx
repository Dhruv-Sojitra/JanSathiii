import React, { useState, useEffect, useRef } from 'react'
import { Send, Trash2, Bot, Languages, Info, ShieldAlert, Sparkles } from 'lucide-react'
import { useSession } from '../App'
import { sendChat } from '../services/api'
import ChatBubble from '../components/ChatBubble'

export default function AIAssistant() {
  const { sessionId } = useSession()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! I am JanSathiii AI. Tell me about yourself (e.g., age, occupation, income, state) or ask me about government schemes, and I will help you discover what you qualify for.' }
  ])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('english')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (e, directText = null) => {
    e?.preventDefault()
    const userMessage = (directText || input).trim()
    if (!userMessage || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await sendChat({
        session_id: sessionId,
        message: userMessage,
        language: language
      })

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message,
        extractedProfile: response.data.extracted_profile,
        schemes: response.data.schemes || []
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, I encountered an error connecting to the server. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{ role: 'assistant', content: 'Chat history cleared. How can I help you today?' }])
    }
  }

  const starterMessages = [
    "I need education scholarship help",
    "Tell me about farmer schemes like PM Kisan",
    "I am a 22 year old student from Odisha",
    "Healthcare schemes under 5 lakh income"
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-saffron-500 to-amber-400 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <span>JanSathiii AI Assistant</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Talk to me in English, Hindi.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm">
            <Languages className="w-4 h-4 text-gray-500 dark:text-slate-400 mr-2" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="english" className="dark:bg-slate-800">English</option>
              <option value="hindi" className="dark:bg-slate-800">हिंदी (Hindi)</option>
            </select>
          </div>
          <button
            onClick={handleClear}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3 mb-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
        <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <p>I can extract your profile details from our conversation and match eligible government schemes & scholarships automatically!</p>
      </div>

      <div className="flex-grow bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden relative transition-colors">
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-gray-50/70 dark:bg-slate-950/70">
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg} />
          ))}
          {loading && <ChatBubble isTyping={true} />}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="absolute bottom-24 left-0 right-0 px-4 hidden sm:flex justify-center gap-2 flex-wrap">
            {starterMessages.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(null, msg)}
                className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-slate-750 text-xs px-3.5 py-1.5 rounded-full shadow-sm transition-all whitespace-nowrap cursor-pointer hover:shadow"
              >
                {msg}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about schemes, eligibility, or tell me your details..."
              className="w-full pl-5 pr-14 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5" /> AI can make mistakes. Verify important information with official portals.
          </div>
        </div>
      </div>
    </div>
  )
}
