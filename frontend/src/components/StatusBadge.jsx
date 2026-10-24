import React from 'react'
import { Clock, AlertCircle, CheckCircle, FileText, Send } from 'lucide-react'

export default function StatusBadge({ status }) {
  const map = {
    'not_started': { color: 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 border border-gray-200 dark:border-slate-700', label: 'Not Started', icon: Clock },
    'documents_missing': { color: 'bg-yellow-100 dark:bg-amber-950/70 text-yellow-800 dark:text-amber-300 border border-yellow-200 dark:border-amber-800/60', label: 'Documents Missing', icon: AlertCircle },
    'ready_to_apply': { color: 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60', label: 'Ready to Apply', icon: CheckCircle },
    'application_started': { color: 'bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60', label: 'Application Started', icon: FileText },
    'submitted': { color: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60', label: 'Submitted', icon: Send }
  }

  const current = map[status] || map['not_started']
  const Icon = current.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${current.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </span>
  )
}
