import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, FileText, Search, MessageSquare, ChevronRight, User, Bookmark, ExternalLink, Trash2 } from 'lucide-react'
import { useSession } from '../App'
import { getApplications, getSchemes } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const { sessionId, profile, hasProfile, bookmarks = [], toggleBookmark } = useSession()
  const [applications, setApplications] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsRes, schemesRes] = await Promise.all([
          getApplications(sessionId),
          getSchemes({ session_id: sessionId, limit: 3 })
        ])
        setApplications(appsRes.data || [])
        setRecommendations((schemesRes.data?.schemes || []).slice(0, 3))
      } catch (err) {
        console.error("Dashboard error", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [sessionId])

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {profile?.name ? profile.name.split(' ')[0] : 'Citizen'}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Here is your JanSathiii government scheme dashboard.</p>
        </div>
        {!hasProfile ? (
          <Link to="/profile" className="btn-primary text-sm flex items-center gap-2">
            <User className="w-4 h-4" /> Complete Profile
          </Link>
        ) : (
          <Link to="/profile" className="btn-secondary text-sm flex items-center gap-2">
            <User className="w-4 h-4" /> Edit Profile
          </Link>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">Matches Found</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{hasProfile ? recommendations.length * 3 : 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">Apps Started</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
            <Bookmark className="w-6 h-6 fill-amber-500/20" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">Saved Schemes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookmarks.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">Docs Ready</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Applications Tracker & Saved Schemes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Applications Tracker */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">My Applications Tracker</h2>
              <span className="text-xs text-gray-500 dark:text-slate-400">{applications.length} Active</span>
            </div>
            
            {applications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                <p>You haven't started any applications yet.</p>
                <Link to="/schemes" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline mt-2 inline-block">
                  Find schemes to apply for →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                {applications.map((app) => (
                  <li key={app.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Scheme #{app.scheme_id}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Updated: {new Date(app.updated_at).toLocaleDateString()}</p>
                        {app.reference_number && (
                          <p className="text-xs font-mono bg-gray-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded inline-block mt-2">
                            Ref: {app.reference_number}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:items-end gap-3">
                        <StatusBadge status={app.status} />
                        <Link to={`/application/${app.scheme_id}`} className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center hover:underline">
                          View Guide <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bookmarked Schemes Section */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">My Bookmarked Schemes</h2>
              </div>
              <span className="text-xs text-gray-500 dark:text-slate-400">{bookmarks.length} Saved</span>
            </div>

            {bookmarks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                <p>No saved schemes yet. Click the bookmark icon on any scheme card to save it here!</p>
                <Link to="/schemes" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline mt-2 inline-block">
                  Browse schemes to bookmark →
                </Link>
              </div>
            ) : (
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                {bookmarks.map((scheme) => (
                  <div key={scheme.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                          {scheme.category || 'General'}
                        </span>
                        <button
                          onClick={() => toggleBookmark(scheme)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {scheme.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {scheme.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                      <Link to={`/schemes/${scheme.id}`} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                        Details →
                      </Link>
                      <Link to={`/schemes/${scheme.id}/eligibility`} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline ml-auto">
                        Check Eligibility →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Recommendations */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-colors">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/schemes" className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3.5 group-hover:bg-white dark:group-hover:bg-slate-700">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Find More Schemes</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Discover new programs</p>
                </div>
              </Link>

              <Link to="/documents" className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-3.5 group-hover:bg-white dark:group-hover:bg-slate-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Upload Documents</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Prepare for applications</p>
                </div>
              </Link>

              <Link to="/assistant" className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-3.5 group-hover:bg-white dark:group-hover:bg-slate-700">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Chat with AI</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Get instant answers</p>
                </div>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Top Matches for You</h2>
              <Link to="/schemes" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">See all</Link>
            </div>
            <div className="space-y-3">
              {recommendations.length > 0 ? recommendations.map(scheme => (
                <div key={scheme.id} className="bg-white dark:bg-slate-850 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 transition-colors">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{scheme.name}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/70 px-2 py-1 rounded">
                      {scheme.match_score || 85}% Match
                    </span>
                    <Link to={`/schemes/${scheme.id}`} className="text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
                      View Details →
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="bg-white dark:bg-slate-850 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                  {hasProfile ? 'No recommendations found yet.' : 'Complete your profile to see recommendations.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
