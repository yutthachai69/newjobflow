import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">❄️</span>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            AirService Enterprise
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            ระบบบริหารจัดการงานบริการแอร์ระดับองค์กร
            <br />
            <span className="text-base text-gray-500">ครบครัน ทันสมัย และใช้งานง่าย</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:scale-105 font-semibold text-lg transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">เข้าสู่ระบบ</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white hover:shadow-lg hover:scale-105 font-semibold text-lg border border-gray-200 transition-all duration-300"
            >
              ดู Dashboard Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-4 text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
              📊
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Dashboard แบบ Real-time
            </h3>
            <p className="text-gray-600 leading-relaxed">
              ติดตามความคืบหน้างานแบบ Real-time พร้อมกราฟและสถิติที่อัปเดตอัตโนมัติ
            </p>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl mb-4 text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
              📷
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              หลักฐานภาพ Before/After
            </h3>
            <p className="text-gray-600 leading-relaxed">
              บันทึกภาพถ่ายก่อนและหลังการทำงาน พร้อมประวัติงานครบถ้วน
            </p>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl mb-4 text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
              📱
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              QR Code Scanner
            </h3>
            <p className="text-gray-600 leading-relaxed">
              สแกน QR Code เพื่อบันทึกงานทันที ใช้งานง่ายบนมือถือ
            </p>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl mb-4 text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
              🏠
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              จัดการหลายสถานที่
            </h3>
            <p className="text-gray-600 leading-relaxed">
              รองรับโครงสร้างสถานที่ที่ซับซ้อน ตั้งแต่สาขา ตึก ชั้น ห้อง
            </p>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl mb-4 text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
              📋
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              ประวัติครบถ้วน
            </h3>
            <p className="text-gray-600 leading-relaxed">
              เก็บประวัติการบำรุงรักษาและซ่อมแซมทุกเครื่องแบบละเอียด
            </p>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl mb-4 text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
              🔒
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              ระบบสิทธิ์
            </h3>
            <p className="text-gray-600 leading-relaxed">
              แยกสิทธิ์ตามบทบาท Admin, ช่าง, และลูกค้า ปลอดภัยและควบคุมได้
            </p>
          </div>
        </div>

        {/* Role Information */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-10 mb-16 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            บทบาทในระบบ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative p-6 rounded-2xl hover:bg-blue-50 transition-all duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
              <div className="pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">👨‍💼</span>
                  <h3 className="font-bold text-xl text-gray-900">Admin</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  จัดการระบบทั้งหมด สร้าง User, จัดการข้อมูล, ดูรายงานทั้งหมด
                </p>
              </div>
            </div>
            
            <div className="group relative p-6 rounded-2xl hover:bg-emerald-50 transition-all duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
              <div className="pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🔧</span>
                  <h3 className="font-bold text-xl text-gray-900">Technician</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  รับงานและบันทึกการทำงาน สแกน QR Code ถ่ายรูป Before/After
                </p>
              </div>
            </div>
            
            <div className="group relative p-6 rounded-2xl hover:bg-purple-50 transition-all duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <div className="pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🏢</span>
                  <h3 className="font-bold text-xl text-gray-900">Client</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  ดูข้อมูลสถานะแอร์ทั้งหมดของสถานที่ตัวเอง ติดตามงาน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 space-y-2">
          <p className="text-sm">© 2024 AirService Enterprise. All rights reserved.</p>
          <p className="text-xs">
            ระบบจัดการงานบริการแอร์สำหรับองค์กร
          </p>
        </div>
      </div>
    </div>
  );
}