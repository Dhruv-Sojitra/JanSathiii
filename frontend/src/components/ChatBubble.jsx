import React, { useState } from 'react'
import {
  Bot,
  User,
  Check,
  Landmark,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Award,
  GraduationCap,
  Sparkles,
  Copy,
  CheckCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'

const categoryColors = {
  'Education': 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 dark:border dark:border-blue-800/60',
  'Agriculture': 'bg-green-100 text-green-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-800/60',
  'Healthcare': 'bg-red-100 text-red-800 dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-800/60',
  'Health': 'bg-red-100 text-red-800 dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-800/60',
  'Housing': 'bg-yellow-100 text-yellow-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800/60',
  'Employment': 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 dark:border dark:border-purple-800/60',
  'Social Security': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border dark:border-indigo-800/60',
  'Women Empowerment': 'bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 dark:border dark:border-pink-800/60',
  'Business/Employment': 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 dark:border dark:border-purple-800/60',
  'Default': 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700'
}

function renderInline(str) {
  if (!str) return ''
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g
  const parts = []
  let lastIdx = 0
  let match

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(str.substring(lastIdx, match.index))
    }
    if (match[2] && match[3]) {
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 font-medium underline inline-flex items-center gap-0.5"
        >
          {match[2]}
          <ExternalLink className="w-3 h-3 inline ml-0.5" />
        </a>
      )
    } else if (match[4]) {
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-gray-900 dark:text-white">
          {match[4]}
        </strong>
      )
    }
    lastIdx = regex.lastIndex
  }

  if (lastIdx < str.length) {
    parts.push(str.substring(lastIdx))
  }

  return parts
}

function FormattedMessage({ content }) {
  if (!content) return null
  const lines = content.split('\n')
  const elements = []
  let currentList = []

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1 pl-4 list-disc text-sm text-gray-700 dark:text-slate-300">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      )
      currentList = []
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      return
    }

    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h4 key={`h3-${index}`} className="font-bold text-gray-900 dark:text-white text-sm mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h4>
      )
    } else if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h3 key={`h2-${index}`} className="font-bold text-gray-900 dark:text-white text-base mt-3 mb-1.5">
          {renderInline(trimmed.replace(/^##\s+/, ''))}
        </h3>
      )
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.replace(/^[-*]\s+/, ''))
    } else {
      flushList()
      elements.push(
        <p key={`p-${index}`} className="text-sm leading-relaxed mb-1.5 text-gray-800 dark:text-slate-200">
          {renderInline(trimmed)}
        </p>
      )
    }
  })

  flushList()
  return <div className="space-y-1">{elements}</div>
}

export default function ChatBubble({ message, isTyping = false }) {
  const isUser = message?.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (message?.content) {
      navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isTyping) {
    return (
      <div className="flex gap-3 mb-4 justify-start">
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
          <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    )
  }

  const schemes = message?.schemes || []

  return (
    <div className={`flex gap-3 mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/80 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-sm relative group transition-colors ${
        isUser
          ? 'bg-primary-600 text-white rounded-tr-sm'
          : 'bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-200 rounded-tl-sm'
      }`}>
        {/* Copy button for assistant responses */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy message"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}

        {isUser ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-white">
            {message.content}
          </div>
        ) : (
          <FormattedMessage content={message.content} />
        )}

        {!isUser && message.extractedProfile && Object.entries(message.extractedProfile).some(([_, val]) => val !== null && val !== undefined && val !== '') && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-emerald-950/60 border border-green-100 dark:border-emerald-900 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-800 dark:text-emerald-300 mb-2">
              <Check className="w-4 h-4" /> Profile Updated Automatically
            </div>
            <ul className="text-xs text-gray-700 dark:text-slate-300 space-y-1">
              {Object.entries(message.extractedProfile)
                .filter(([_, val]) => val !== null && val !== undefined && val !== '')
                .map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="font-medium capitalize w-24 flex-shrink-0">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{String(value)}</span>
                  </li>
                ))}
            </ul>
            <div className="mt-2 pt-2 border-t border-green-200 dark:border-emerald-800">
              <Link to="/profile" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                Review Full Profile →
              </Link>
            </div>
          </div>
        )}

        {!isUser && schemes.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">
                <GraduationCap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Matching Scheme & Scholarship Details ({schemes.length})
              </div>
            </div>
            <div className="space-y-3">
              {schemes.map((scheme) => {
                const catColor = categoryColors[scheme.category] || categoryColors['Default']
                const isScholarship = (scheme.category || '').toLowerCase() === 'education' || (scheme.name || '').toLowerCase().includes('scholarship')
                return (
                  <div
                    key={scheme.id}
                    className="p-3.5 bg-gray-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-all shadow-sm group/item"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${catColor}`}>
                          {scheme.category}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-600">
                          <Landmark className="w-3 h-3 text-gray-500" />
                          {scheme.state ? scheme.state : (scheme.government_level || 'Central')}
                        </span>
                        {isScholarship && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                            <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Scholarship
                          </span>
                        )}
                      </div>
                      {scheme.is_demo_data && (
                        <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          Demo
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5 group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors">
                      {scheme.name}
                    </h4>

                    {scheme.benefits && (
                      <div className="text-xs text-gray-700 dark:text-slate-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-lg p-2 mb-2 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Benefits:</strong> {scheme.benefits}</span>
                      </div>
                    )}

                    {scheme.eligibility_summary && (
                      <p className="text-xs text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">
                        <strong className="text-gray-700 dark:text-slate-300">Eligibility:</strong> {scheme.eligibility_summary}
                      </p>
                    )}

                    <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                      <Link
                        to={`/schemes/${scheme.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
                      >
                        View Details
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                      </Link>

                      <Link
                        to={`/schemes/${scheme.id}/eligibility`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Check Eligibility
                      </Link>

                      {scheme.official_application_url && (
                        <a
                          href={scheme.official_application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 ml-auto hover:underline"
                        >
                          Official Portal
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <User className="w-5 h-5 text-gray-600 dark:text-slate-300" />
        </div>
      )}
    </div>
  )
}
