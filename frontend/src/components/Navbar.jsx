import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, Home, Search, MessageSquare, FileText, LayoutDashboard, Bookmark } from 'lucide-react'
import { useSession } from '../App'
import { getHealth } from '../services/api'
import Logo from './Logo'
import DarkModeToggle from './DarkModeToggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [cloudStatus, setCloudStatus] = useState('checking') // 'checking' | 'online' | 'waking'
  const location = useLocation()
  const { hasProfile, bookmarks = [] } = useSession()

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        await getHealth()
        if (mounted) setCloudStatus('online')
      } catch {
        if (mounted) setCloudStatus('waking')
      }
    }
    check()
    const timer = setInterval(check, 25000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Find Schemes', path: '/schemes', icon: <Search className="w-4 h-4" /> },
    { name: 'AI Assistant', path: '/assistant', icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'Documents', path: '/documents', icon: <FileText className="w-4 h-4" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            {/* JanSathiii Logo */}
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1.5 lg:space-x-2.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive(link.path)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}

            {/* Saved Schemes Shortcut */}
            {bookmarks.length > 0 && (
              <Link
                to="/dashboard"
                title={`${bookmarks.length} Bookmarked Scheme${bookmarks.length > 1 ? 's' : ''}`}
                className="relative p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              </Link>
            )}

            {/* Dark Mode Toggle Button */}
            <DarkModeToggle />

            {/* Profile CTA */}
            <Link
              to="/profile"
              className={`flex items-center gap-1.5 ml-1 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${hasProfile
                  ? 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                  : 'bg-gradient-to-r from-saffron-500 to-amber-500 text-white hover:from-saffron-600 hover:to-amber-600 shadow-saffron-500/20'
                }`}
            >
              <User className="w-4 h-4" />
              {hasProfile ? 'My Profile' : 'Complete Profile'}
            </Link>
          </div>

          {/* Mobile menu and Dark Mode buttons */}
          <div className="flex items-center md:hidden gap-2">
            <DarkModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Open main menu"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-colors">
          <div className="px-3 pt-3 pb-4 space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${isActive(link.path)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300'
                    : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-2">
              <DarkModeToggle variant="full" />

              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-saffron-500 to-amber-500 text-white hover:from-saffron-600 hover:to-amber-600 shadow-sm"
              >
                <User className="w-5 h-5" />
                {hasProfile ? 'View Profile' : 'Start My Profile'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
