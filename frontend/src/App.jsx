import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'
import AIAssistant from './pages/AIAssistant'
import SchemeRecommendations from './pages/SchemeRecommendations'
import SchemeDetails from './pages/SchemeDetails'
import EligibilityExplanation from './pages/EligibilityExplanation'
import DocumentCenter from './pages/DocumentCenter'
import ApplicationGuide from './pages/ApplicationGuide'
import Dashboard from './pages/Dashboard'
import WakeUpBanner from './components/WakeUpBanner'
import { getProfile } from './services/api'

// Global session context
export const SessionContext = createContext(null)

export function useSession() {
  return useContext(SessionContext)
}

function generateSessionId() {
  return 'js_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/60 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="btn-primary text-sm px-4 py-2"
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('js_session_id') || localStorage.getItem('ss_session_id') || generateSessionId()
  })
  const [profile, setProfile] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  
  // Bookmarked schemes storage
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('jansathiii_bookmarks')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const toggleBookmark = (scheme) => {
    setBookmarks(prev => {
      const exists = prev.some(item => item.id === scheme.id)
      let next
      if (exists) {
        next = prev.filter(item => item.id !== scheme.id)
      } else {
        next = [...prev, scheme]
      }
      try {
        localStorage.setItem('jansathiii_bookmarks', JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }

  const isBookmarked = (schemeId) => {
    return bookmarks.some(item => item.id === schemeId)
  }

  useEffect(() => {
    localStorage.setItem('js_session_id', sessionId)
    if (sessionId) {
      getProfile(sessionId)
        .then(res => {
          if (res.data) {
            setProfile(res.data)
            setHasProfile(true)
          }
        })
        .catch(() => {})
    }
  }, [sessionId])

  return (
    <ThemeProvider>
      <SessionContext.Provider value={{
        sessionId,
        profile,
        setProfile,
        hasProfile,
        setHasProfile,
        bookmarks,
        toggleBookmark,
        isBookmarked
      }}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
            <Navbar />
            <WakeUpBanner />
            <main className="flex-grow">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/assistant" element={<AIAssistant />} />
                  <Route path="/schemes" element={<SchemeRecommendations />} />
                  <Route path="/schemes/:id" element={<SchemeDetails />} />
                  <Route path="/schemes/:id/eligibility" element={<EligibilityExplanation />} />
                  <Route path="/documents" element={<DocumentCenter />} />
                  <Route path="/application/:id" element={<ApplicationGuide />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </main>
          </div>
        </BrowserRouter>
      </SessionContext.Provider>
    </ThemeProvider>
  )
}
