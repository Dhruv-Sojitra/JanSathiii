import React from 'react'
import { CheckCircle2, XCircle, Upload, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'

export default function DocumentChecklist({ checklist = [] }) {
  const total = checklist.length
  const ready = checklist.filter(d => d.available).length
  const progress = total > 0 ? Math.round((ready / total) * 100) : 0

  return (
    <div className="bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors">
      <div className="p-4 bg-gray-50/80 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Document Readiness</h3>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-600 dark:text-slate-300 font-medium">{ready} of {total} documents ready</span>
          <span className="font-bold text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <ProgressBar progress={progress} color={progress === 100 ? 'bg-emerald-500' : 'bg-primary-600'} />
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-slate-800">
        {checklist.map((doc, idx) => (
          <li key={idx} className="p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
            <div className="mt-0.5">
              {doc.available ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <div className="flex-grow">
              <p className={`font-semibold text-sm ${doc.available ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-slate-200'}`}>
                {doc.name}
              </p>
              {doc.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{doc.description}</p>}
            </div>
            {!doc.available && (
              <Link
                to="/documents"
                className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-900"
              >
                <Upload className="w-3.5 h-3.5" /> Upload
              </Link>
            )}
          </li>
        ))}
      </ul>
      
      {checklist.length === 0 && (
        <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">
          No documents specified for this scheme yet.
        </div>
      )}

      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-100 dark:border-amber-900/60 flex gap-2 items-start text-xs text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p>This checklist is AI-generated based on scheme guidelines. Official requirements may vary slightly.</p>
      </div>
    </div>
  )
}
