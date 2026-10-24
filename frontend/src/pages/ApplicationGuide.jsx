import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, AlertCircle, ArrowRight } from 'lucide-react'
import { getScheme, startApplication } from '../services/api'
import { useSession } from '../App'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ApplicationGuide() {
  const { id } = useParams()
  const { sessionId } = useSession()
  const [scheme, setScheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState('not_started')

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const res = await getScheme(id)
        setScheme(res.data)
        await startApplication(sessionId, id)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchScheme()
  }, [id, sessionId])

  if (loading) return <LoadingSpinner fullScreen />
  if (!scheme) return <div className="text-center p-8 dark:text-slate-200">Scheme not found</div>

  const handlePortalClick = async () => {
    setApplicationStatus('application_started')
  }

  const portalUrl = scheme.official_application_url || scheme.official_source_url

  const steps = [
    {
      num: 1,
      title: "Prepare Your Documents",
      desc: "Ensure you have all required documents digitized (PDF/JPEG) before starting.",
      icon: <FileText className="w-5 h-5" />
    },
    {
      num: 2,
      title: "Open Official Portal",
      desc: portalUrl ? (
        <span>
          Navigate to the official verified government portal:{" "}
          <a 
            href={portalUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary-600 dark:text-primary-400 underline font-semibold inline-flex items-center gap-1 hover:text-primary-700"
          >
            {portalUrl} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </span>
      ) : "Navigate to the official government website.",
      icon: <ExternalLink className="w-5 h-5" />
    },
    {
      num: 3,
      title: "Register / Login",
      desc: "Create an account using your Aadhaar or mobile number as required.",
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      num: 4,
      title: "Fill Application Form",
      desc: "Enter your personal, demographic, and bank details exactly as per records.",
      icon: <FileText className="w-5 h-5" />
    },
    {
      num: 5,
      title: "Submit & Save Reference",
      desc: "Submit the form and save the Application Reference Number generated.",
      icon: <CheckCircle2 className="w-5 h-5" />
    }
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to={`/schemes/${id}`} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to scheme details
      </Link>

      <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8 mb-8 transition-colors">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tight">Application Guide</h1>
            <p className="text-gray-600 dark:text-slate-300 font-medium">{scheme.name}</p>
          </div>
          <StatusBadge status={applicationStatus} />
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 mb-8 text-sm text-blue-800 dark:text-blue-300">
          <strong>Important:</strong> JanSathiii AI does not submit applications on your behalf. You must complete the application yourself on the official portal.
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-slate-700 before:to-transparent">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-850 bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                {step.icon}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Step {step.num}: {step.title}</h3>
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-300">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-800 text-center">
          {portalUrl ? (
            <a 
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePortalClick}
              className="btn-primary inline-flex items-center justify-center gap-2 text-base font-bold px-8 py-3.5 w-full md:w-auto shadow-lg"
            >
              Open Official Portal <ArrowRight className="w-5 h-5" />
            </a>
          ) : (
            <button disabled className="btn-primary opacity-50 cursor-not-allowed inline-flex items-center justify-center gap-2 text-base px-8 py-3.5 w-full md:w-auto">
              <AlertCircle className="w-5 h-5" /> Portal URL Pending Verification
            </button>
          )}
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-4">Make sure you have all required documents ready before proceeding.</p>
        </div>
      </div>
    </div>
  )
}
