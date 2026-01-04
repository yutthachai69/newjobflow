"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";

interface User {
  username: string;
  fullName?: string;
  role: "ADMIN" | "TECHNICIAN" | "CLIENT";
}

export default function Navigation({ user }: { user: User | null }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href={user ? "/" : "/welcome"} 
                className="flex items-center gap-3"
              >
                <div className="h-10 flex items-center justify-center">
                  <img 
                    src="/Gemini_Generated_Image_5oosqk5oosqk5oos.png" 
                    alt="AirService Logo" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  AirService
                </span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {user.role === "CLIENT" && (
                  <>
                    <Link
                      href="/"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/") && pathname === "/"
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/assets"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/assets")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      ทะเบียนแอร์
                    </Link>
                    <Link
                      href="/work-orders"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/work-orders")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      ประวัติงาน
                    </Link>
                    <Link
                      href="/contact"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/contact")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      ติดต่อเรา
                    </Link>
                  </>
                )}
                {user.role === "ADMIN" && (
                  <>
                    <Link
                      href="/"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/") && pathname === "/"
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/work-orders"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/work-orders")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      ใบสั่งงาน
                    </Link>
                    <Link
                      href="/assets"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/assets")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      ทะเบียนแอร์
                    </Link>
                    <Link
                      href="/locations"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/locations")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      สถานที่
                    </Link>
                    <Link
                      href="/users"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/users")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      ผู้ใช้งาน
                    </Link>
                    <Link
                      href="/contact"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/contact")
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      ติดต่อเรา
                    </Link>
                  </>
                )}
                {user.role === "TECHNICIAN" && (
                  <>
                    <Link
                      href="/"
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/") && pathname === "/"
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
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
                    >
                      ประวัติงาน
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user.fullName || user.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.role === "ADMIN" && "Admin"}
                      {user.role === "TECHNICIAN" && "ช่าง"}
                      {user.role === "CLIENT" && "ลูกค้า"}
                    </div>
                  </div>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ออกจากระบบ
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}