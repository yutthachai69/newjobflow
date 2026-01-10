import { prisma } from "@/lib/prisma"
import Link from "next/link"
import EmptyState from "@/app/components/EmptyState"

export default async function AdminDashboard() {
  const [
    totalAssets,
    activeWorkOrders,
    completedToday,
    totalWorkOrders,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.workOrder.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.workOrder.count({
      where: {
        status: "COMPLETED",
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.workOrder.count(),
  ])

  // ดึงงานล่าสุด
  const recentWorkOrders = await prisma.workOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      site: {
        include: { client: true },
      },
      jobItems: {
        include: { asset: true },
      },
    },
  })

  // คำนวณความคืบหน้า
  const progressData = await prisma.workOrder.findMany({
    where: { status: "IN_PROGRESS" },
    include: {
      site: true,
      jobItems: true,
    },
  })

  const progressInfo = progressData.map((wo) => {
    const total = wo.jobItems.length
    const done = wo.jobItems.filter((j) => j.status === "DONE").length
    return { total, done, workOrder: wo }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 mb-8">ภาพรวมระบบ</p>

        {/* สถิติการ์ด */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">แอร์ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">งานที่ดำเนินการ</p>
                <p className="text-2xl font-bold text-gray-900">{activeWorkOrders}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">เสร็จสิ้นวันนี้</p>
                <p className="text-2xl font-bold text-gray-900">{completedToday}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">งานทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{totalWorkOrders}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ความคืบหน้างาน */}
        {progressInfo.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ความคืบหน้างานที่กำลังดำเนินการ
            </h2>
            <div className="space-y-4">
              {progressInfo.map((info) => (
                <div key={info.workOrder.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <Link
                        href={`/work-orders/${info.workOrder.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {info.workOrder.jobType} - {info.workOrder.site.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {new Date(info.workOrder.scheduledDate).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {info.done}/{info.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(info.done / info.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* งานล่าสุด */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">งานล่าสุด</h2>
            <Link
              href="/work-orders"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentWorkOrders.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon="📋"
                  title="ยังไม่มีงานล่าสุด"
                  description="เมื่อมีการสร้างใบสั่งงานใหม่ จะแสดงที่นี่"
                  actionLabel="สร้างใบสั่งงานใหม่"
                  actionHref="/work-orders/new"
                />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ชนิดงาน
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      สถานที่
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      รายการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {recentWorkOrders.map((wo) => {
                    const statusLabels = {
                      OPEN: "เปิด",
                      IN_PROGRESS: "กำลังทำ",
                      COMPLETED: "เสร็จสิ้น",
                      CANCELLED: "ยกเลิก",
                    } as const
                    
                    return (
                      <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{wo.jobType}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {wo.site.name} ({wo.site.client.name})
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(wo.scheduledDate).toLocaleDateString("th-TH")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              wo.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : wo.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : wo.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusLabels[wo.status as keyof typeof statusLabels] || wo.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {wo.jobItems.length} รายการ
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/work-orders/new"
            className="bg-blue-600 text-white rounded-lg border border-blue-700 shadow-sm p-4 hover:bg-blue-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-center group"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <div className="font-semibold">สร้างใบสั่งงานใหม่</div>
                <div className="text-sm text-blue-100 mt-1">เริ่มต้นงานใหม่</div>
              </div>
            </div>
          </Link>
          <Link
            href="/assets"
            className="bg-white text-gray-900 rounded-lg border border-gray-300 shadow-sm p-4 hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-center group"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="font-semibold">จัดการทะเบียนแอร์</div>
                <div className="text-sm text-gray-500 mt-1">เพิ่ม แก้ไข ลบเครื่อง</div>
              </div>
            </div>
          </Link>
          <Link
            href="/locations"
            className="bg-white text-gray-900 rounded-lg border border-gray-300 shadow-sm p-4 hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-center group"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="font-semibold">จัดการสถานที่</div>
                <div className="text-sm text-gray-500 mt-1">ตั้งค่าสถานที่ทำงาน</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}


