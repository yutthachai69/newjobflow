import { prisma } from "@/lib/prisma";
import { createWorkOrder } from "@/app/actions";
import Link from "next/link";

export default async function NewWorkOrderPage() {
  const sites = await prisma.site.findMany({
    include: {
      client: true,
      buildings: {
        include: {
          floors: {
            include: {
              rooms: {
                include: {
                  assets: {
                    where: { status: 'ACTIVE' },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const totalAssets = sites.reduce((total, site) => 
    total + site.buildings.reduce((bTotal, building) =>
      bTotal + building.floors.reduce((fTotal, floor) =>
        fTotal + floor.rooms.reduce((rTotal, room) =>
          rTotal + room.assets.length, 0
        ), 0
      ), 0
    ), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/work-orders" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group transition-all duration-200"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span className="font-medium">กลับไปหน้ารายการ</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">📋</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
              สร้างใบสั่งงานใหม่
            </h1>
          </div>
          <p className="text-gray-600 ml-15">กำหนดรายละเอียดและเลือกเครื่องที่ต้องการบำรุงรักษา</p>
        </div>

        <form action={createWorkOrder} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="space-y-6">
            {/* เลือกสถานที่ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                สถานที่ (Site) <span className="text-red-500">*</span>
              </label>
              <select
                name="siteId"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
              >
                <option value="">-- เลือกสถานที่ --</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.client.name})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                🏢 เลือกสถานที่ที่ต้องการทำงาน
              </p>
            </div>

            {/* ชนิดงาน */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชนิดงาน <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
              >
                <option value="PM">🔧 PM - บำรุงรักษาประจำ</option>
                <option value="CM">⚡ CM - ซ่อมฉุกเฉิน</option>
                <option value="INSTALL">🆕 INSTALL - ติดตั้งใหม่</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                ⚙️ ประเภทของงานที่ต้องการทำ
              </p>
            </div>

            {/* วันนัดหมาย */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                วันนัดหมาย <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="scheduledDate"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
              />
              <p className="mt-2 text-xs text-gray-500">
                📅 วันและเวลาที่ต้องการให้ช่างเข้าทำงาน
              </p>
            </div>

            {/* ทีมที่รับผิดชอบ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ทีมที่รับผิดชอบ
              </label>
              <input
                type="text"
                name="assignedTeam"
                placeholder="เช่น ทีมช่าง A, สมชาย งานดี"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
              />
              <p className="mt-2 text-xs text-gray-500">
                👥 ระบุชื่อทีมหรือช่างที่รับผิดชอบ (ไม่บังคับ)
              </p>
            </div>

            {/* เลือกแอร์ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                เลือกเครื่องปรับอากาศ <span className="text-red-500">*</span>
              </label>
              
              {totalAssets === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                  <div className="text-4xl mb-3">❄️</div>
                  <p className="text-gray-600 font-medium mb-2">ยังไม่มีเครื่องปรับอากาศในระบบ</p>
                  <p className="text-sm text-gray-500">กรุณาเพิ่มทะเบียนแอร์ก่อนสร้างใบสั่งงาน</p>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-lg">ℹ️</span>
                      <span>พบเครื่องปรับอากาศทั้งหมด <span className="font-bold text-blue-700">{totalAssets}</span> เครื่อง</span>
                    </div>
                  </div>
                  
                  <div className="border-2 border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto space-y-3 bg-gray-50">
                    {sites.map((site) =>
                      site.buildings.map((building) =>
                        building.floors.map((floor) =>
                          floor.rooms.map((room) =>
                            room.assets.map((asset) => (
                              <label
                                key={asset.id}
                                className="flex items-start gap-3 p-4 hover:bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white"
                              >
                                <input
                                  type="checkbox"
                                  name="assetIds"
                                  value={asset.id}
                                  className="mt-1.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">❄️</span>
                                    <div className="font-semibold text-gray-900">
                                      {asset.brand} {asset.model}
                                    </div>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                      {asset.qrCode}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1 flex-wrap">
                                    <span>📍</span>
                                    <span>{site.name}</span>
                                    <span className="text-gray-400">→</span>
                                    <span>{building.name}</span>
                                    <span className="text-gray-400">→</span>
                                    <span>{floor.name}</span>
                                    <span className="text-gray-400">→</span>
                                    <span>{room.name}</span>
                                  </div>
                                  {asset.btu && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                      <span>💨</span>
                                      <span>{asset.btu.toLocaleString()} BTU</span>
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))
                          )
                        )
                      )
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <span>✓</span>
                    <span>เลือกเครื่องที่ต้องการบำรุงรักษาในใบสั่งงานนี้ (เลือกได้หลายเครื่อง)</span>
                  </p>
                </>
              )}
            </div>

            {/* ปุ่ม Submit */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={totalAssets === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>✓</span>
                <span>สร้างใบสั่งงาน</span>
              </button>
              <Link
                href="/work-orders"
                className="sm:flex-none px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-medium text-center transition-all duration-200 text-gray-700"
              >
                ยกเลิก
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}