'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface NotificationBellProps {
  initialCount: number
}

export default function NotificationBell({ initialCount }: NotificationBellProps) {
  const [count, setCount] = useState(initialCount)
  const pathname = usePathname()

  // Update count when navigating to messages page
  useEffect(() => {
    if (pathname === '/messages') {
      setCount(0)
    } else {
      setCount(initialCount)
    }
  }, [pathname, initialCount])

  const isActive = pathname === '/messages'

  if (count === 0) {
    return (
      <Link
        href="/messages"
        className={`relative inline-flex items-center justify-center p-2 rounded-md transition-colors ${
          isActive
            ? "text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
        title="กล่องข้อความ"
        aria-label="กล่องข้อความ"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </Link>
    )
  }

  return (
    <Link
      href="/messages"
      className={`relative inline-flex items-center justify-center p-2 rounded-md transition-colors ${
        isActive
          ? "text-blue-600 bg-blue-50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
      title="กล่องข้อความ"
      aria-label={`กล่องข้อความ (${count} ข้อความใหม่)`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px]">
        {count > 99 ? '99+' : count}
      </span>
    </Link>
  )
}
