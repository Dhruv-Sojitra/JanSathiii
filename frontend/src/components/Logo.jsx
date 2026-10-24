import React from 'react'
import { Link } from 'react-router-dom'

export default function Logo({ size = 'md', showText = true, to = '/', className = '' }) {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm' }
  }

  const currentSize = sizeMap[size] || sizeMap.md

  const content = (
    <div className={`flex items-center gap-2.5 group transition-transform duration-200 ${className}`}>
      {/* Emblem SVG */}
      <div className={`relative flex-shrink-0 ${currentSize.icon} rounded-xl overflow-hidden shadow-sm ring-1 ring-amber-400/30 group-hover:shadow-md group-hover:scale-105 transition-all`}>
        <svg viewBox="0 0 128 128" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="logo-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B00"/>
              <stop offset="50%" stopColor="#FFA826"/>
              <stop offset="100%" stopColor="#0A8F3D"/>
            </linearGradient>
            <linearGradient id="logo-shield" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B132B"/>
              <stop offset="100%" stopColor="#1C2541"/>
            </linearGradient>
            <linearGradient id="saff-wing" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF7A00"/>
              <stop offset="100%" stopColor="#FFB347"/>
            </linearGradient>
            <linearGradient id="green-wing" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981"/>
              <stop offset="100%" stopColor="#059669"/>
            </linearGradient>
          </defs>

          {/* Outer Ring */}
          <rect width="128" height="128" rx="28" fill="url(#logo-border-grad)"/>
          <rect x="6" y="6" width="116" height="116" rx="22" fill="url(#logo-shield)"/>

          {/* Left Wing */}
          <path d="M 34 76 C 34 60 46 47 62 45 C 57 52 55 60 56 69 C 52 70 48 72 45 76 C 41 81 39 86 38 91 C 35 86 34 81 34 76 Z" fill="url(#saff-wing)"/>

          {/* Right Wing */}
          <path d="M 94 76 C 94 60 82 47 66 45 C 71 52 73 60 72 69 C 76 70 80 72 83 76 C 87 81 89 86 90 91 C 93 86 94 81 94 76 Z" fill="url(#green-wing)"/>

          {/* Citizen Figure */}
          <circle cx="64" cy="56" r="8.5" fill="#FFFFFF"/>
          <path d="M 51 84 C 51 74 57 70 64 70 C 71 70 77 74 77 84 C 77 88 74 91 64 91 C 54 91 51 88 51 84 Z" fill="#FFFFFF"/>

          {/* Crown Light Sparkle */}
          <circle cx="64" cy="38" r="2.8" fill="#FDE047"/>
          <path d="M 64 32 L 64 35 M 64 41 L 64 44 M 58 38 L 61 38 M 67 38 L 70 38" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 leading-tight">
            <span className={`font-black tracking-tight text-gray-900 dark:text-white ${currentSize.text}`}>
              JanSathiii
            </span>
            <span className="font-extrabold text-saffron-500 bg-saffron-50 dark:bg-saffron-950/60 px-1.5 py-0.5 rounded text-xs border border-saffron-300 dark:border-saffron-800">
              AI
            </span>
          </div>
          <span className={`font-semibold tracking-wide text-gray-500 dark:text-slate-400 ${currentSize.sub}`}>
            Govt Welfare Partner 🇮🇳
          </span>
        </div>
      )}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
