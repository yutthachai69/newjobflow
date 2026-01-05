'use client'

import Link from 'next/link'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: EmptyStateProps) {
  const actionButton = actionLabel && (
    actionHref ? (
      <Link
        href={actionHref}
        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {actionLabel}
      </Link>
    ) : actionOnClick ? (
      <button
        onClick={actionOnClick}
        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {actionLabel}
      </button>
    ) : null
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto">{description}</p>
      {actionButton}
    </div>
  )
}

