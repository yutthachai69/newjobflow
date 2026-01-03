import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WorkOrdersPage() {
  const workOrders = await prisma.workOrder.findMany({
    include: {
      site: {
        include: { client: true },
      },
      jobItems: {
        include: { asset: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 ใบสั่งงานทั้งหมด</h1>
          <Link
            href="/work-orders/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + สร้างใบสั่งงานใหม่
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ใบงาน ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ชนิดงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  สถานที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  วันนัดหมาย
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  รายการงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {workOrders.map((wo) => {
                const doneCount = wo.jobItems.filter((j) => j.status === "DONE").length;
                return (
                  <tr key={wo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {wo.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{wo.jobType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{wo.site.name}</div>
                      <div className="text-xs text-gray-500">{wo.site.client.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(wo.scheduledDate).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
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
                        {wo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="text-sm">
                        {doneCount}/{wo.jobItems.length} เสร็จ
                      </div>
                      {wo.jobItems.length > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${(doneCount / wo.jobItems.length) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/work-orders/${wo.id}`}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {workOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ยังไม่มีใบสั่งงาน
              <Link href="/work-orders/new" className="text-blue-600 hover:underline ml-1">
                สร้างใหม่
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
