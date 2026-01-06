'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ClientNavLinks() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(path)
  }

  return (
    <>
      <Link
        href="/"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isActive("/") && pathname === "/"
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="Dashboard"
      >
        Dashboard
      </Link>
      <Link
        href="/assets"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isActive("/assets")
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="ทะเบียนแอร์"
      >
        ทะเบียนแอร์
      </Link>
      <Link
        href="/work-orders"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isActive("/work-orders")
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="ประวัติงาน"
      >
        ประวัติงาน
      </Link>
      <Link
        href="/contact"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isActive("/contact")
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="ติดต่อเรา"
      >
        ติดต่อเรา
      </Link>
    </>
  )
}

