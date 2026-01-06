'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TechnicianNavLinks() {
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
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="Dashboard"
      >
        Dashboard
      </Link>
      <Link
        href="/technician/scan"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/technician/scan")
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="สแกน QR Code"
      >
        สแกน QR Code
      </Link>
      <Link
        href="/technician"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/technician") && !isActive("/technician/scan")
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="หน้างาน"
      >
        หน้างาน
      </Link>
      <Link
        href="/work-orders"
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/work-orders")
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }`}
        aria-label="ประวัติงาน"
      >
        ประวัติงาน
      </Link>
    </>
  )
}

