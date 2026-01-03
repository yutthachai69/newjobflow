import { login } from "@/app/actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">❄️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            AirService Enterprise
          </h1>
          <p className="text-gray-500">เข้าสู่ระบบ</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <form action={login} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                placeholder="กรอก username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                placeholder="กรอก password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:shadow-xl hover:scale-105 font-semibold text-lg transition-all duration-300 shadow-md"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              ไม่มีบัญชี?{" "}
              <span className="text-gray-400">
                กรุณาติดต่อ Admin เพื่อสร้างบัญชี
              </span>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/welcome"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:gap-3 transition-all duration-200"
            >
              <span>←</span>
              <span>กลับหน้าแรก</span>
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧪</span>
            <p className="text-sm font-semibold text-blue-900">
              บัญชีทดสอบ
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-800 bg-white/40 rounded-lg px-3 py-2">
              <span className="font-semibold min-w-16">Admin:</span>
              <span className="text-gray-700">admin / admin123</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800 bg-white/40 rounded-lg px-3 py-2">
              <span className="font-semibold min-w-16">ช่าง:</span>
              <span className="text-gray-700">tech1 / password123</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800 bg-white/40 rounded-lg px-3 py-2">
              <span className="font-semibold min-w-16">ลูกค้า:</span>
              <span className="text-gray-700">client1 / client123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}