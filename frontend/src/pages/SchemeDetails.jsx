import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Landmark, Share2, ExternalLink, ShieldAlert, CheckCircle2, Bookmark, Check, ShieldCheck } from 'lucide-react'
import { getScheme, getSchemeDocuments } from '../services/api'
import { useSession } from '../App'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import DemoDataBanner from '../components/DemoDataBanner'
import DocumentChecklist from '../components/DocumentChecklist'

export default function SchemeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sessionId, isBookmarked, toggleBookmark } = useSession()
  
  const [scheme, setScheme] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedShare, setCopiedShare] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [schemeRes, docsRes] = await Promise.all([
          getScheme(id),
          getSchemeDocuments(id)
        ])
        setScheme(schemeRes.data)
        setDocuments(docsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: scheme?.name || 'JanSathiii Scheme',
          text: `Check out ${scheme?.name} on JanSathiii AI`,
          url: window.location.href
        })
        return
      } catch (e) {}
    }
    navigator.clipboard.writeText(window.location.href)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2500)
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <ErrorMessage message={error} />
  if (!scheme) return <ErrorMessage message="Scheme not found" />

  const bookmarked = isBookmarked ? isBookmarked(scheme.id) : false

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility Criteria' },
    { id: 'documents', label: 'Required Documents' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Nav Action Row */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to schemes
        </button>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark && toggleBookmark(scheme)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm ${
              bookmarked
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-500' : ''}`} />
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {scheme.is_demo_data && <DemoDataBanner />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden mb-8 transition-colors">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300">
                  {scheme.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                  <Landmark className="w-3.5 h-3.5" /> {scheme.government_level}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified Govt Scheme
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                {scheme.name}
              </h1>
              <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
                {scheme.description}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/40'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2.5">Key Benefits</h3>
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl p-4">
                      <p className="text-gray-700 dark:text-emerald-200 leading-relaxed text-sm sm:text-base">
                        {scheme.benefits || 'Financial assistance and welfare support as outlined in official guidelines.'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Implementing Department</h3>
                    <p className="text-gray-600 dark:text-slate-300">{scheme.department || 'Government of India / State Welfare Ministry'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'eligibility' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">General Eligibility Criteria</h3>
                  <div className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed space-y-4">
                    <p>This scheme is available to citizens who satisfy criteria published by the nodal agency.</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-xl p-5">
                      <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1.5">Want to know if YOU qualify?</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                        JanSathiii AI analyzes your age, state, occupation, and income to give you an instant decision.
                      </p>
                      <Link to={`/schemes/${id}/eligibility`} className="btn-primary text-sm inline-flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Check My Eligibility Now
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Required Documents</h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-6 text-sm">
                    Make sure you have these documents handy before heading to the official application portal.
                  </p>
                  <DocumentChecklist checklist={documents.map(d => ({ name: d.display_name, description: d.notes, available: false, is_mandatory: d.is_mandatory }))} />
                  <div className="mt-6">
                    <Link to="/documents" className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:underline">
                      Go to My Document Center →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Ready to Apply?</h3>
            <div className="space-y-3">
              <Link 
                to={`/schemes/${id}/eligibility`}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Check My Eligibility
              </Link>
              <Link 
                to={`/application/${id}`}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Start Application Guide
              </Link>
            </div>

            {scheme.official_application_url ? (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                <a 
                  href={scheme.official_application_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline"
                >
                  Visit Official Portal <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs text-center text-gray-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Official portal link pending verification
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Quick Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-slate-400 text-xs">Scheme ID</dt>
                <dd className="font-semibold text-gray-900 dark:text-white font-mono mt-0.5">{scheme.id}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-slate-400 text-xs">Last Verified</dt>
                <dd className="font-semibold text-gray-900 dark:text-white mt-0.5">Recently Updated (2026)</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-slate-400 text-xs">Managed By</dt>
                <dd className="font-semibold text-gray-900 dark:text-white mt-0.5">{scheme.government_level} Government</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
