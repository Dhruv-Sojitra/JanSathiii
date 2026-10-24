import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Upload, ShieldAlert } from 'lucide-react'
import { getScheme, checkEligibility } from '../services/api'
import { useSession } from '../App'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EligibilityBadge from '../components/EligibilityBadge'

export default function EligibilityExplanation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sessionId, hasProfile } = useSession()
  
  const [scheme, setScheme] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAndCheck = async () => {
      setLoading(true)
      try {
        const [schemeRes, checkRes] = await Promise.all([
          getScheme(id),
          checkEligibility({ profile_session_id: sessionId, scheme_id: parseInt(id, 10) })
        ])
        setScheme(schemeRes.data)
        setResult(checkRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (hasProfile) {
      fetchAndCheck()
    } else {
      setLoading(false)
    }
  }, [id, sessionId, hasProfile])

  if (!hasProfile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Required</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-8">We need to know a bit about you to check if you qualify for this scheme.</p>
        <Link to="/profile" className="btn-primary">Complete Your Profile</Link>
      </div>
    )
  }

  if (loading) return <LoadingSpinner message="JanSathiii AI is analyzing your profile against scheme rules..." fullScreen />
  if (error) return <ErrorMessage message={error} />
  if (!scheme || !result) return <ErrorMessage message="Data not found" />

  const { status: overall_status, passed = [], failed = [], unknown = [], missing_documents = [], match_score } = result
  const matchPct = Math.round((match_score || 0) * 100)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(`/schemes/${id}`)} 
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to scheme details
      </button>

      {scheme.beneficiary_type === 'child' && (
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-semibold">Dependent / Child Beneficiary Scheme</p>
            <p className="mt-0.5 text-blue-800 dark:text-blue-300">
              This scheme (such as Sukanya Samriddhi under Beti Bachao Beti Padhao) is intended for a girl child applied through a parent or guardian. The criteria below evaluate details for the child rather than your own personal profile.
            </p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden mb-8 transition-colors">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Eligibility Analysis</h1>
            <p className="text-gray-600 dark:text-slate-300 font-medium mb-3">{scheme.name}</p>
            <div className="mb-4">
              <EligibilityBadge status={overall_status} />
            </div>
            {result.summary && (
              <p className="text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 rounded-xl p-3.5 border border-gray-100 dark:border-slate-700 leading-relaxed">
                {result.summary}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-32 h-32 rounded-full border-8 border-gray-50 dark:border-slate-800 relative">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-slate-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  matchPct >= 80 ? 'text-emerald-500' : matchPct >= 50 ? 'text-amber-500' : 'text-rose-500'
                }`}
                strokeDasharray={`${matchPct}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{matchPct}%</span>
              <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold">Match</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${unknown.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        {/* Passed Criteria */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/50 p-6 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> What Matches
          </h3>
          {passed.length > 0 ? (
            <ul className="space-y-3">
              {passed.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 dark:text-slate-300">{item.explanation || item.display_label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic">No specific criteria evaluated as matching yet.</p>
          )}
        </div>

        {/* Unknown / Needs Info Criteria */}
        {unknown.length > 0 && (
          <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/50 p-6 relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Needs Details
            </h3>
            <ul className="space-y-3">
              {unknown.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                  <span className="text-gray-700 dark:text-slate-300">{item.explanation || item.display_label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Failed Criteria */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-900/50 p-6 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500" /> What Doesn't Match
          </h3>
          {failed.length > 0 ? (
            <ul className="space-y-3">
              {failed.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <span className="text-gray-700 dark:text-slate-300">{item.explanation || item.display_label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic">
              {unknown.length > 0 ? 'No conflicting personal criteria identified.' : 'You meet all known criteria we checked!'}
            </p>
          )}
        </div>
      </div>

      {/* Missing Documents */}
      {missing_documents.length > 0 && (
        <div className="mt-8 bg-amber-50 dark:bg-amber-950/40 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/60 p-6 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Missing Information
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">We couldn't fully determine your eligibility because we need more details about:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {missing_documents.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-3 py-2 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/profile" className="btn-secondary text-sm bg-white dark:bg-slate-800">
            Update Profile to Check Again
          </Link>
        </div>
      )}

      {/* Action Area */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-slate-800 transition-colors">
        <p className="text-xs text-gray-500 dark:text-slate-400 flex items-start gap-2 max-w-lg">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-500" />
          This is an AI-assisted assessment based on published criteria. It does not constitute an official government eligibility determination.
        </p>
        <Link to={`/application/${id}`} className="btn-primary whitespace-nowrap w-full sm:w-auto text-center shadow-md">
          Start Application Guide
        </Link>
      </div>
    </div>
  )
}
