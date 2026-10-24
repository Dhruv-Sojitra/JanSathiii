import React from 'react'
import { ShieldAlert } from 'lucide-react'

export default function DemoDataBanner() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ShieldAlert className="h-5 w-5 text-yellow-600" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-800 font-medium">
            Demo Data Notice
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            This scheme information is for demonstration purposes only. Always verify eligibility and requirements with official government sources and portals.
          </p>
        </div>
      </div>
    </div>
  )
}
