'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions'
import AdminNavLinks from './navigation/AdminNavLinks'
import TechnicianNavLinks from './navigation/TechnicianNavLinks'
import ClientNavLinks from './navigation/ClientNavLinks'
import NotificationBell from './navigation/NotificationBell'

interface NavigationProps {
  userRole: 'ADMIN' | 'TECHNICIAN' | 'CLIENT' | null
  unreadMessageCount?: number
}

export default function Navigation({ userRole, unreadMessageCount = 0 }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Do not render navigation on /welcome page (regardless of login status)
  if (pathname === '/welcome') {
    return null
  }

  // Do not render navigation if userRole is null (not logged in)
  if (!userRole) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                AirService
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {userRole === 'ADMIN' && <AdminNavLinks />}
              {userRole === 'TECHNICIAN' && <TechnicianNavLinks />}
              {userRole === 'CLIENT' && <ClientNavLinks />}
            </div>
          </div>

          {/* Right side - Notification Bell (Admin only) and User Menu */}
          <div className="flex items-center gap-4">
            {userRole === 'ADMIN' && (
              <NotificationBell initialCount={unreadMessageCount} />
            )}
            
            <div className="hidden sm:block">
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="ออกจากระบบ"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="เปิดเมนู"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {userRole === 'ADMIN' && <AdminNavLinks />}
            {userRole === 'TECHNICIAN' && <TechnicianNavLinks />}
            {userRole === 'CLIENT' && <ClientNavLinks />}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <form action={logout}>
              <button
                type="submit"
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                aria-label="ออกจากระบบ"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}
