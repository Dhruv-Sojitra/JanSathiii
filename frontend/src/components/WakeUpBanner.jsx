import React, { useState, useEffect, useRef } from 'react'
import { getHealth } from '../services/api'
import { Loader2, X, Sparkles, CheckCircle2 } from 'lucide-react'

export default function WakeUpBanner() {
  const [status, setStatus] = useState('checking') // 'checking' | 'waking' | 'connected' | 'hidden'
  const [progress, setProgress] = useState(10)
  const [attempt, setAttempt] = useState(1)
  const [dismissed, setDismissed] = useState(false)
  const startTime = useRef(Date.now())
  const intervalRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  const checkConnection = async () => {
    try {
      await getHealth()
      clearInterval(intervalRef.current)
      clearTimeout(retryTimeoutRef.current)
      setProgress(100)
      setStatus('connected')
      // Auto-hide the success toast after 3.5 seconds
      setTimeout(() => setStatus('hidden'), 3500)
    } catch {
      const elapsed = (Date.now() - startTime.current) / 1000
      if (elapsed > 2) {
        setStatus('waking')
      }
      setAttempt(a => a + 1)
      // Retry every 4 seconds
      retryTimeoutRef.current = setTimeout(checkConnection, 4000)
    }
  }

  useEffect(() => {
    // Progress animation that simulates a 35-40s cold start
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const elapsed = (Date.now() - startTime.current) / 1000
        return Math.min(95, Math.max(10, Math.floor((elapsed / 40) * 100)))
      })
    }, 500)

    // Initial check
    checkConnection()

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  if (dismissed || status === 'hidden' || status === 'checking') return null

  if (status === 'connected') {
    return (
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-md transition-all flex items-center justify-between z-30 relative">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span><strong>Cloud Connected:</strong> JanSathiii 24/7 cloud backend is live and ready!</span>
        </div>
        <button
          onClick={() => setStatus('hidden')}
          className="p-1 hover:bg-emerald-700 dark:hover:bg-emerald-600 rounded transition"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900 border-b border-amber-200 dark:border-amber-900/60 shadow-sm relative z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <div className="mt-0.5 sm:mt-0 p-1.5 bg-amber-100 dark:bg-amber-950/80 rounded-lg text-amber-700 dark:text-amber-400 flex-shrink-0 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                  ☁️ Cloud Service Waking Up
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  Attempt {attempt} • ~30s on first load
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300/80 mt-0.5">
                Our free cloud server was sleeping to save energy. It runs 24/7 without your PC. Your schemes will load automatically!
              </p>
              {/* Progress bar */}
              <div className="mt-1.5 h-1.5 bg-amber-200/70 dark:bg-slate-800 rounded-full overflow-hidden max-w-md">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 p-1 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-md transition self-start sm:self-center"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
