import React from 'react'

export default function ProgressBar({ progress, color = 'bg-primary-500', height = 'h-2' }) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
      <div 
        className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${normalizedProgress}%` }}
      ></div>
    </div>
  )
}
