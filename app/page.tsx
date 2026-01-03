import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  // ดึงข้อมูลสถิติ
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
  ]);

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
  });

  // คำนวณความคืบหน้า
  const progressData = await prisma.workOrder.findMany({
    where: { status: "IN_PROGRESS" },
    include: {
      site: true,
      jobItems: true,
    },
  });

  const progressInfo = progressData.map((wo) => {
    const total = wo.jobItems.length;
    const done = wo.jobItems.filter((j) => j.status === "DONE").length;
    return { total, done, workOrder: wo };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📊 Dashboard - ภาพรวมระบบ
        </h1>

        {/* สถิติการ์ด */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">แอร์ทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{totalAssets}</p>
              </div>
              <div className="text-4xl">🏠</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">งานที่ดำเนินการ</p>
                <p className="text-3xl font-bold text-gray-900">{activeWorkOrders}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">เสร็จสิ้นวันนี้</p>
                <p className="text-3xl font-bold text-gray-900">{completedToday}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">งานทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{totalWorkOrders}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* ความคืบหน้างาน */}
        {progressInfo.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🔄 ความคืบหน้างานที่กำลังดำเนินการ
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">📋 งานล่าสุด</h2>
            <Link
              href="/work-orders"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ชนิดงาน
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    สถานที่
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    วันที่
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    รายการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentWorkOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50">
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
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {wo.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {wo.jobItems.length} รายการ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/work-orders/new"
            className="bg-blue-600 text-white rounded-lg shadow p-6 hover:bg-blue-700 transition text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <div className="font-semibold">สร้างใบสั่งงานใหม่</div>
          </Link>
          <Link
            href="/assets"
            className="bg-green-600 text-white rounded-lg shadow p-6 hover:bg-green-700 transition text-center"
          >
            <div className="text-3xl mb-2">🏠</div>
            <div className="font-semibold">จัดการทะเบียนแอร์</div>
          </Link>
          <Link
            href="/technician"
            className="bg-orange-600 text-white rounded-lg shadow p-6 hover:bg-orange-700 transition text-center"
          >
            <div className="text-3xl mb-2">🔧</div>
            <div className="font-semibold">หน้างาน (ช่าง)</div>
          </Link>
        </div>
      </div>
    </div>
  );
}