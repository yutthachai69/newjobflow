'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNavLinks() {
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
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/") && pathname === "/"
            ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-semibold"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="Dashboard"
      >
        Dashboard
      </Link>
      <Link
        href="/work-orders"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/work-orders")
            ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-semibold"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="ใบสั่งงาน"
      >
        ใบสั่งงาน
      </Link>
      <Link
        href="/assets"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/assets")
            ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-semibold"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="ทะเบียนแอร์"
      >
        ทะเบียนแอร์
      </Link>
      <Link
        href="/users"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/users")
            ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-semibold"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="ผู้ใช้งาน"
      >
        ผู้ใช้งาน
      </Link>
      <Link
        href="/locations"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/locations")
            ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-semibold"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="สถานที่"
      >
        สถานที่
      </Link>
      <Link
        href="/security-incidents"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/security-incidents")
            ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-semibold"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="เหตุการณ์ด้านความปลอดภัย"
      >
        ความปลอดภัย
      </Link>
      <Link
        href="/contact"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/contact")
            ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-semibold"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="ติดต่อเรา"
      >
        ติดต่อเรา
      </Link>
    </>
  )
}

