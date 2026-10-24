import React from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function EligibilityBadge({ status }) {
  if (status === 'potentially_eligible') {
    return (
      <span className="badge-green text-sm px-3 py-1">
        <CheckCircle className="w-4 h-4" /> Potentially Eligible
      </span>
    )
  }

  if (status === 'not_matching_known_criteria') {
    return (
      <span className="badge-red text-sm px-3 py-1">
        <XCircle className="w-4 h-4" /> Not Matching Criteria
      </span>
    )
  }

  if (status === 'needs_more_information') {
    return (
      <span className="badge-yellow text-sm px-3 py-1">
        <AlertCircle className="w-4 h-4" /> Needs More Info
      </span>
    )
  }

  return (
    <span className="badge-blue text-sm px-3 py-1">
      <AlertCircle className="w-4 h-4" /> Unknown Status
    </span>
  )
}
