import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Search, UserCheck, Bookmark, Sparkles, X, ArrowUpDown } from 'lucide-react'
import { getSchemes } from '../services/api'
import { useSession } from '../App'
import SchemeCard from '../components/SchemeCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function SchemeRecommendations() {
  const { sessionId, profile, hasProfile, bookmarks = [] } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || ''
  const initialSearch = searchParams.get('search') || searchParams.get('query') || ''

  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  
  const [filters, setFilters] = useState({
    category: initialCategory,
    government_level: '',
    search: initialSearch,
    useProfileMatch: hasProfile
  })

  const quickCategories = [
    { label: 'All', value: '' },
    { label: 'Agriculture 🌾', value: 'Agriculture' },
    { label: 'Education 🎓', value: 'Education' },
    { label: 'Healthcare 🏥', value: 'Healthcare' },
    { label: 'Women 👩', value: 'Women Empowerment' },
    { label: 'Housing 🏠', value: 'Housing' },
    { label: 'Pension & Welfare 🛡️', value: 'Social Security' },
  ]

  const fetchSchemes = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.government_level) params.government_level = filters.government_level
      if (filters.search) params.query = filters.search

      // Functional enhancement: personalize with profile data if enabled
      if (filters.useProfileMatch && profile) {
        if (profile.state) params.state = profile.state
        if (profile.is_farmer) params.is_farmer = true
        if (profile.is_student) params.is_student = true
        if (profile.annual_income) params.max_income = profile.annual_income
      }

      const res = await getSchemes(params)
      setSchemes(res.data.schemes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to load schemes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cat = searchParams.get('category')
    const q = searchParams.get('search') || searchParams.get('query')
    if (cat !== null || q !== null) {
      setFilters(prev => ({
        ...prev,
        category: cat !== null ? cat : prev.category,
        search: q !== null ? q : prev.search
      }))
    }
  }, [searchParams])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSchemes()
    }, 400)
    return () => clearTimeout(delayDebounceFn)
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCategoryPill = (catValue) => {
    setFilters(prev => ({ ...prev, category: catValue }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      government_level: '',
      search: '',
      useProfileMatch: false
    })
    setShowSavedOnly(false)
  }

  // Filter schemes by saved status & sorting
  const displayedSchemes = useMemo(() => {
    let result = [...schemes]
    if (showSavedOnly) {
      const savedIds = new Set(bookmarks.map(b => b.id))
      result = result.filter(s => savedIds.has(s.id))
    }
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'category') {
      result.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
    }
    return result
  }, [schemes, showSavedOnly, bookmarks, sortBy])

  const hasActiveFilters = Boolean(filters.search || filters.category || filters.government_level || filters.useProfileMatch || showSavedOnly)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            Government Scheme Directory
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Discover, filter, and verify welfare programs designed for Indian citizens.
          </p>
        </div>

        {/* Saved Count Badge Button */}
        {bookmarks.length > 0 && (
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              showSavedOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 hover:bg-amber-50 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${showSavedOnly ? 'fill-white' : 'fill-amber-500'}`} />
            <span>Saved Schemes ({bookmarks.length})</span>
          </button>
        )}
      </div>

      {/* Quick Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {quickCategories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleCategoryPill(cat.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              filters.category === cat.value
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white dark:bg-slate-850 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Box */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 mb-8 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by scheme name or keywords..."
              className="pl-10 input-field"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select name="category" value={filters.category} onChange={handleFilterChange} className="input-field cursor-pointer">
              <option value="">All Categories</option>
              <option value="Agriculture">Agriculture & Farmers</option>
              <option value="Education">Education & Scholarships</option>
              <option value="Healthcare">Healthcare & Insurance</option>
              <option value="Women Empowerment">Women Empowerment</option>
              <option value="Housing">Housing</option>
              <option value="Social Security">Social Security & Pension</option>
              <option value="Business/Employment">Business & Employment</option>
            </select>
          </div>
          
          {/* Level Dropdown */}
          <div className="md:col-span-2">
            <select name="government_level" value={filters.government_level} onChange={handleFilterChange} className="input-field cursor-pointer">
              <option value="">All Levels</option>
              <option value="Central">Central Govt</option>
              <option value="State">State Govt</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field cursor-pointer">
              <option value="default">Default Sort</option>
              <option value="name">Name (A-Z)</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Filter Bottom Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all border text-xs sm:text-sm font-semibold ${
              filters.useProfileMatch 
                ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-800' 
                : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-750'
            }`}>
              <input 
                type="checkbox" 
                name="useProfileMatch" 
                checked={filters.useProfileMatch} 
                onChange={handleFilterChange}
                className="sr-only"
                disabled={!hasProfile}
              />
              <UserCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>Personalize for My Profile</span>
            </label>

            {!hasProfile && (
              <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                Complete profile for instant matching
              </span>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>

          <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium">
            {loading ? 'Searching...' : `Showing ${displayedSchemes.length} schemes`}
          </div>
        </div>
      </div>

      {/* Results Area */}
      {error && <ErrorMessage message={error} onRetry={fetchSchemes} />}
      
      {!error && loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 h-64 animate-pulse flex flex-col">
              <div className="flex gap-2 mb-4">
                <div className="h-5 w-20 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-800 rounded mb-4"></div>
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="mt-auto flex gap-3">
                <div className="h-10 w-full bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 w-full bg-gray-200 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!error && !loading && displayedSchemes.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-slate-800 p-8">
          <Filter className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No matching schemes found</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Try clearing filters or searching with different keywords.</p>
          <button
            onClick={clearFilters}
            className="btn-primary text-sm px-4 py-2"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {!error && !loading && displayedSchemes.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSchemes.map((scheme, idx) => (
            <SchemeCard 
              key={scheme.id || idx}
              scheme={scheme}
              matchScore={scheme.match_score}
              eligibilityStatus={scheme.eligibility_status}
            />
          ))}
        </div>
      )}
    </div>
  )
}
