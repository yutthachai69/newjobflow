import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface ClientDashboardProps {
  siteId: string
}

export default async function ClientDashboard({ siteId }: ClientDashboardProps) {
  // ดึงข้อมูล Site พร้อม Assets และ Work Orders
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      client: true,
      buildings: {
        include: {
          floors: {
            include: {
              rooms: {
                include: {
                  assets: {
                    include: {
                      jobItems: {
                        include: {
                          workOrder: true,
                          technician: true,
                        },
                        orderBy: { startTime: 'desc' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      workOrders: {
        include: {
          jobItems: {
            include: {
              asset: true,
              technician: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลสถานที่</h1>
          <p className="text-gray-600">กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    )
  }

  // คำนวณสถิติสำหรับ CLIENT
  const allAssets = site.buildings.flatMap(b => 
    b.floors.flatMap(f => 
      f.rooms.flatMap(r => r.assets)
    )
  )

  const activeWorkOrders = site.workOrders.filter(wo => 
    wo.status === 'OPEN' || wo.status === 'IN_PROGRESS'
  )

  const inProgressJobItems = allAssets.flatMap(asset => 
    asset.jobItems.filter(ji => ji.status === 'IN_PROGRESS' || ji.status === 'PENDING')
  )

  const completedToday = site.workOrders.filter(wo => 
    wo.status === 'COMPLETED' && 
    new Date(wo.updatedAt).toDateString() === new Date().toDateString()
  ).length

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600">{site.name} • {site.client.name}</p>
        </div>

        {/* สถิติการ์ด */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">แอร์ทั้งหมด</p>
                <p className="text-2xl font-semibold text-gray-900">{allAssets.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">งานที่กำลังดำเนินการ</p>
                <p className="text-2xl font-semibold text-gray-900">{activeWorkOrders.length}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">เสร็จสิ้นวันนี้</p>
                <p className="text-2xl font-semibold text-gray-900">{completedToday}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">เครื่องที่กำลังซ่อม/บำรุง</p>
                <p className="text-2xl font-semibold text-gray-900">{inProgressJobItems.length}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* งานล่าสุด */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">งานล่าสุด</h2>
            <Link 
              href="/work-orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          {site.workOrders.slice(0, 5).length > 0 ? (
            <div className="space-y-3">
              {site.workOrders.slice(0, 5).map((wo) => {
                const statusConfig = {
                  OPEN: { bg: 'bg-blue-100 text-blue-800', text: 'รอเริ่มงาน' },
                  IN_PROGRESS: { bg: 'bg-yellow-100 text-yellow-800', text: 'กำลังทำงาน' },
                  COMPLETED: { bg: 'bg-green-100 text-green-800', text: 'เสร็จสิ้น' },
                  CANCELLED: { bg: 'bg-red-100 text-red-800', text: 'ยกเลิก' },
                }[wo.status] || { bg: 'bg-gray-100 text-gray-800', text: wo.status }

                return (
                  <Link
                    key={wo.id}
                    href={`/work-orders/${wo.id}`}
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">
                            {wo.jobType === 'PM' ? 'PM - บำรุงรักษา' : wo.jobType === 'CM' ? 'CM - ซ่อมฉุกเฉิน' : 'INSTALL - ติดตั้งใหม่'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.bg}`}>
                            {statusConfig.text}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>{new Date(wo.scheduledDate).toLocaleDateString('th-TH')}</span>
                          <span className="mx-2">•</span>
                          <span>{wo.jobItems.length} เครื่อง</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีงาน
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/assets"
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:border-gray-300 hover:shadow transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">ทะเบียนแอร์</h3>
            <p className="text-sm text-gray-600">ดูรายการแอร์ทั้งหมดในสถานที่</p>
          </Link>

          <Link
            href="/work-orders"
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:border-gray-300 hover:shadow transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">ประวัติงาน</h3>
            <p className="text-sm text-gray-600">ดูประวัติการทำงานทั้งหมด</p>
          </Link>

          <Link
            href="/contact"
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:border-gray-300 hover:shadow transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">ติดต่อเรา</h3>
            <p className="text-sm text-gray-600">แจ้งปัญหาหรือสอบถามข้อมูล</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

