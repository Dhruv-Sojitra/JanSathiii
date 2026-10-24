import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function DarkModeToggle({ className = '', variant = 'compact' }) {
  const { isDark, toggleTheme } = useTheme()

  if (variant === 'full') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800'
            : 'bg-amber-50/70 border-amber-200 text-slate-800 hover:bg-amber-100/70'
        } ${className}`}
      >
        <span className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
          isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-indigo-100 text-indigo-700'
        }`}>
          {isDark ? 'ON' : 'OFF'}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDark
          ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700 hover:text-amber-300 focus:ring-amber-400 focus:ring-offset-slate-900 shadow-sm'
          : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-100 hover:text-slate-900 focus:ring-primary-500 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <Sun
          className={`w-5 h-5 transition-transform duration-300 absolute ${
            isDark ? 'transform rotate-0 scale-100 opacity-100 text-amber-400' : 'transform -rotate-90 scale-0 opacity-0'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-5 h-5 transition-transform duration-300 absolute ${
            isDark ? 'transform rotate-90 scale-0 opacity-0' : 'transform rotate-0 scale-100 opacity-100 text-slate-700'
          }`}
        />
      </div>
      <span className="sr-only">{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
    </button>
  )
}
