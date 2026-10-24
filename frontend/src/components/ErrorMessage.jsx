import React from 'react'
import { AlertOctagon, RefreshCw } from 'lucide-react'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 rounded-2xl p-6 text-center max-w-md mx-auto my-8 transition-colors">
      <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-rose-950 text-red-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
      <p className="text-gray-600 dark:text-slate-300 text-sm mb-5">{message || 'An unexpected error occurred. Please try again later.'}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold py-2 px-4 rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  )
}
