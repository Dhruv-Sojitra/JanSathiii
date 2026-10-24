import React from 'react'
import { Link } from 'react-router-dom'
import { Landmark, ArrowRight, ShieldAlert, CheckCircle2, Bookmark } from 'lucide-react'
import EligibilityBadge from './EligibilityBadge'
import ProgressBar from './ProgressBar'
import { useSession } from '../App'

export default function SchemeCard({ scheme, matchScore, eligibilityStatus }) {
  const { id, name, description, category, government_level, is_demo } = scheme
  const { isBookmarked, toggleBookmark } = useSession()
  const bookmarked = isBookmarked ? isBookmarked(id) : false

  const categoryColors = {
    'Education': 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 dark:border dark:border-blue-800/60',
    'Agriculture': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-800/60',
    'Health': 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-800/60',
    'Healthcare': 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-800/60',
    'Housing': 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800/60',
    'Employment': 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 dark:border dark:border-purple-800/60',
    'Social Security': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border dark:border-indigo-800/60',
    'Women Empowerment': 'bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 dark:border dark:border-pink-800/60',
    'Default': 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700'
  }

  const catColor = categoryColors[category] || categoryColors['Default']

  return (
    <div className="card flex flex-col h-full hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-850 relative group">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${catColor}`}>
            {category}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
            <Landmark className="w-3 h-3" />
            {government_level}
          </span>
          {is_demo && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-700 bg-yellow-50 dark:bg-yellow-950/60 dark:text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">
              <ShieldAlert className="w-3 h-3" /> Demo
            </span>
          )}
        </div>

        {/* Bookmark Action */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleBookmark && toggleBookmark(scheme)
          }}
          type="button"
          aria-label={bookmarked ? "Remove from saved schemes" : "Save scheme"}
          title={bookmarked ? "Remove from saved schemes" : "Save scheme"}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
            bookmarked
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
              : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
        </button>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" title={name}>
        {name}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-slate-300 mb-4 line-clamp-2 flex-grow">
        {description}
      </p>

      {matchScore !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700 dark:text-slate-300">Match Score</span>
            <span className="font-bold text-primary-600 dark:text-primary-400">{matchScore}%</span>
          </div>
          <ProgressBar progress={matchScore} />
        </div>
      )}

      {eligibilityStatus && (
        <div className="mb-4">
          <EligibilityBadge status={eligibilityStatus} />
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex gap-2.5">
        <Link 
          to={`/schemes/${id}`}
          className="flex-1 btn-secondary text-center text-sm py-2 px-3"
        >
          View Details
        </Link>
        <Link 
          to={`/schemes/${id}/eligibility`}
          className="flex-1 btn-primary text-center text-sm py-2 px-3 flex items-center justify-center gap-1"
        >
          <CheckCircle2 className="w-4 h-4" /> Check
        </Link>
      </div>
    </div>
  )
}
