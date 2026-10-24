import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, ShieldCheck, FileCheck, CheckCircle2, Languages, ArrowRight,
  Sparkles, Globe2, IndianRupee, ChevronRight, Users, GraduationCap,
  Tractor, HeartHandshake, Home, HelpCircle, Smartphone, ExternalLink
} from 'lucide-react'
import Logo from '../components/Logo'

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/schemes')
    }
  }

  const quickCategories = [
    { name: 'Agriculture & Farmers', icon: <Tractor className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, filter: 'Agriculture', count: 'PM-KISAN, KCC...' },
    { name: 'Students & Education', icon: <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />, filter: 'Education', count: 'Scholarships...' },
    { name: 'Women & Child', icon: <HeartHandshake className="w-5 h-5 text-pink-600 dark:text-pink-400" />, filter: 'Women Empowerment', count: 'Sukanya, PMMVY...' },
    { name: 'Healthcare & Insurance', icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />, filter: 'Healthcare', count: 'Ayushman Bharat...' },
    { name: 'Housing & Urban/Rural', icon: <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />, filter: 'Housing', count: 'PMAY Scheme...' },
    { name: 'Social Welfare & Pension', icon: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, filter: 'Social Security', count: 'Atal Pension, NSAP...' },
  ]

  const features = [
    {
      icon: <Search className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      title: 'Personalized Matching',
      description: 'Match against central and state government criteria based on your age, income, caste, state, and occupation.'
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      title: 'Transparent AI Eligibility',
      description: 'Know exactly why you qualify or what criterion is missing with clear, criterion-by-criterion reasoning.'
    },
    {
      icon: <FileCheck className="w-7 h-7 text-saffron-500 dark:text-saffron-400" />,
      bg: 'bg-orange-50 dark:bg-amber-950/60',
      title: 'Document Readiness Checklist',
      description: 'Verify required documents (Aadhaar, Income Certificate, Land records) before you go to the official portal.'
    },
    {
      icon: <ExternalLink className="w-7 h-7 text-purple-600 dark:text-purple-400" />,
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      title: 'Direct Official Portals',
      description: 'Zero middlemen or commission agents. Get direct links to verified government websites (.gov.in / .nic.in).'
    }
  ]

  const steps = [
    { num: '01', title: 'Enter Your Details', desc: 'Answer a few simple questions: age, state, occupation, and family income.', color: 'bg-saffron-500' },
    { num: '02', title: 'AI Match Engine', desc: 'Our engine evaluates your profile against dozens of central and state rules.', color: 'bg-blue-600' },
    { num: '03', title: 'Check Requirements', desc: 'Review exact eligibility reasons and get your pre-application document checklist.', color: 'bg-emerald-600' },
    { num: '04', title: 'Apply on Govt Portals', desc: 'Follow simple step-by-step instructions to apply directly on official portals.', color: 'bg-purple-600' },
  ]

  const languages = [
    { label: 'English', flag: '🇬🇧' },
    { label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-slate-950 transition-colors duration-200">
      {/* Tricolor Header Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-saffron-500 via-amber-400 via-white to-india-green" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white">
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-saffron-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32 text-center">
          {/* Cloud & AI Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold mb-6 text-amber-200">
            <Sparkles className="w-4 h-4 text-saffron-400 animate-pulse" />
            <span>24/7 Powered • AI Government Scheme Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Find Government Schemes<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-400 via-amber-300 to-yellow-200">
              You Actually Qualify For
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 mb-8 leading-relaxed font-normal">
            Every year, billions in government welfare funds go unclaimed. JanSathiii AI helps Indian citizens discover, understand, and apply for schemes they are eligible for.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center bg-white dark:bg-slate-850 rounded-2xl shadow-xl p-1.5 border border-transparent dark:border-slate-700/80 focus-within:ring-4 focus-within:ring-saffron-400/50 transition-all">
              <Search className="w-5 h-5 text-gray-400 ml-3.5 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme name, category (e.g. Farmer, Scholarship, Pension)..."
                className="w-full px-3 py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400 dark:placeholder-slate-400"
              />
              <button
                type="submit"
                className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-5 py-3 rounded-xl transition text-sm flex items-center gap-1.5 flex-shrink-0 shadow-md"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg hover:shadow-saffron-500/25 transition-all transform hover:-translate-y-0.5"
            >
              Check My Eligibility <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/assistant"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all"
            >
              Ask AI Assistant
            </Link>
            <Link
              to="/schemes"
              className="inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-slate-200 font-medium text-base px-6 py-3.5 rounded-xl transition-all"
            >
              Browse All Schemes
            </Link>
          </div>

          {/* Multilingual Support Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-slate-300 mr-1 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-saffron-400" /> Available in:
            </span>
            {languages.map((lang) => (
              <span
                key={lang.label}
                className="inline-flex items-center gap-1 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-medium text-white/90"
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Category Discovery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-14">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6 sm:p-8 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Explore by Category</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Jump straight to welfare programs matching your situation</p>
            </div>
            <Link to="/schemes" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1">
              View all programs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {quickCategories.map((cat) => (
              <Link
                key={cat.name}
                to={`/schemes?category=${cat.filter}`}
                className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-slate-800 hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-slate-200 leading-tight mb-1">
                  {cat.name}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-slate-500 line-clamp-1">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-white dark:bg-slate-900/60 border-y border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-saffron-600 dark:text-saffron-400 uppercase tracking-widest bg-orange-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-orange-200/50 dark:border-amber-800/60">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
              How JanSathiii Helps You
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-xl mx-auto mt-2">
              From discovering schemes to stepping into official application portals without confusion.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative bg-gray-50 dark:bg-slate-850 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all text-center flex flex-col items-center"
              >
                <div className={`w-12 h-12 ${step.color} text-white rounded-xl flex items-center justify-center font-extrabold text-lg mb-4 shadow-sm`}>
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Advantages */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Built for Indian Citizens
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Honest, transparent, and always 100% free of cost.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-md transition-all flex flex-col"
              >
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cloud 24/7 Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Always Live, Anytime, Anywhere
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
              JanSathiii is deployed across global infrastructure (GitHub Pages). Access it on your smartphone, tablet, or desktop 24/7 without needing your personal laptop running.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/profile"
                className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-2"
              >
                Start Free Check <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/assistant"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm px-6 py-3 rounded-xl transition"
              >
                Ask Scheme Questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 dark:bg-slate-950 text-slate-400 text-center py-10 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Logo size="sm" showText={false} />
            <span className="font-extrabold text-white text-lg">JanSathiii AI</span>
            <span className="text-xs bg-saffron-500/20 text-saffron-300 border border-saffron-500/30 px-2 py-0.5 rounded-full font-semibold">
              India Edition 🇮🇳
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed mb-4">
            Disclaimer: JanSathiii AI is an informational tool built to empower citizens to understand publicly published eligibility guidelines. We do not represent any government agency or guarantee application acceptance. Always submit official documents directly on verified government portals.
          </p>
          <div className="border-t border-slate-800 pt-5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} JanSathiii AI. Built for the citizens of India.</span>
            <span>Free & Open Access 🇮🇳</span>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile Bar */}
      <div className="fixed bottom-3 left-3 right-3 sm:hidden z-40">
        <Link
          to="/profile"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-saffron-500 to-amber-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-2xl transition active:scale-95"
        >
          <span>Find Government Schemes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
