import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin mb-3" />
      <p className="text-gray-600 dark:text-slate-300 font-medium animate-pulse text-sm">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors">
        {content}
      </div>
    )
  }

  return content
}
