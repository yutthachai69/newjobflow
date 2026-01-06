import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface TechnicianDashboardProps {
  userId: string
}

export default async function TechnicianDashboard({ userId }: TechnicianDashboardProps) {
  // ดึงข้อมูลงานทั้งหมดของช่าง
  const allJobItems = await prisma.jobItem.findMany({
    where: {
      OR: [
        { technicianId: userId },
        { technicianId: null }, // งานที่ยังไม่ได้มอบหมาย
      ],
    },
    include: {
      workOrder: {
        include: {
          site: {
            include: { client: true },
          },
        },
      },
      asset: true,
      photos: true,
    },
    orderBy: { id: 'desc' },
  })

  // คำนวณสถิติ
  const pendingJobs = allJobItems.filter(j => j.status === 'PENDING')
  const inProgressJobs = allJobItems.filter(j => j.status === 'IN_PROGRESS')
  const doneJobs = allJobItems.filter(j => j.status === 'DONE')
  const issueJobs = allJobItems.filter(j => j.status === 'ISSUE_FOUND')

  // งานที่ต้องทำวันนี้
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayJobs = allJobItems.filter(j => {
    if (!j.workOrder.scheduledDate) return false
    const scheduledDate = new Date(j.workOrder.scheduledDate)
    scheduledDate.setHours(0, 0, 0, 0)
    return scheduledDate.getTime() === today.getTime()
  })

  // งานที่เสร็จวันนี้
  const completedToday = doneJobs.filter(j => {
    if (!j.endTime) return false
    const endDate = new Date(j.endTime)
    endDate.setHours(0, 0, 0, 0)
    return endDate.getTime() === today.getTime()
  }).length

  // งานที่กำลังทำอยู่ (IN_PROGRESS)
  const currentJobs = inProgressJobs.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600">ภาพรวมงานของช่าง</p>
        </div>

        {/* สถิติการ์ด */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">งานที่รอดำเนินการ</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingJobs.length}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">งานที่กำลังทำ</p>
                <p className="text-2xl font-semibold text-gray-900">{inProgressJobs.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm font-medium text-gray-600 mb-1">งานที่เสร็จแล้ว</p>
                <p className="text-2xl font-semibold text-gray-900">{doneJobs.length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* งานที่ต้องทำวันนี้ */}
        {todayJobs.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">งานที่ต้องทำวันนี้</h2>
              <span className="text-sm font-medium text-blue-600">{todayJobs.length} รายการ</span>
            </div>
            <div className="space-y-3">
              {todayJobs.slice(0, 5).map((job) => (
                <Link
                  key={job.id}
                  href={`/technician/job-item/${job.id}`}
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {job.asset.brand} {job.asset.model}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {job.workOrder.jobType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>{job.workOrder.site.name}</span>
                        <span className="mx-2">•</span>
                        <span>{job.workOrder.site.client.name}</span>
                      </div>
                    </div>
                    <div className="text-blue-600 font-medium ml-4">→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* งานที่กำลังทำอยู่ */}
        {currentJobs.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">งานที่กำลังทำอยู่</h2>
              <Link
                href="/technician"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="space-y-3">
              {currentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/technician/job-item/${job.id}`}
                  className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {job.asset.brand} {job.asset.model}
                        </span>
                        <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                          กำลังทำ
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>{job.workOrder.site.name}</span>
                        <span className="mx-2">•</span>
                        <span>{job.workOrder.site.client.name}</span>
                      </div>
                      {job.startTime && (
                        <div className="text-xs text-gray-500 mt-1">
                          เริ่มงาน: {new Date(job.startTime).toLocaleString('th-TH')}
                        </div>
                      )}
                    </div>
                    <div className="text-blue-600 font-medium ml-4">→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/technician"
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:border-gray-300 hover:shadow transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">หน้างาน</h3>
            <p className="text-sm text-gray-600">ดูรายการงานทั้งหมดที่ต้องทำ</p>
          </Link>

          <Link
            href="/technician/scan"
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:border-gray-300 hover:shadow transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">สแกน QR Code</h3>
            <p className="text-sm text-gray-600">สแกน QR Code เพื่อดูข้อมูลเครื่อง</p>
          </Link>

          <Link
            href="/work-orders"
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:border-gray-300 hover:shadow transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">ประวัติงาน</h3>
            <p className="text-sm text-gray-600">ดูประวัติการทำงานทั้งหมด</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

