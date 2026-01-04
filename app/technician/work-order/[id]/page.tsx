import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TechnicianWorkOrderPage({ params }: Props) {
  const { id } = await params;

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      site: {
        include: { client: true },
      },
      jobItems: {
        include: {
          asset: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      building: {
                        include: {
                          site: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          technician: true,
          photos: true,
        },
      },
    },
  });

  if (!workOrder) {
    notFound();
  }

  const pendingJobs = workOrder.jobItems.filter((j) => j.status === "PENDING");
  const inProgressJobs = workOrder.jobItems.filter((j) => j.status === "IN_PROGRESS");
  const doneJobs = workOrder.jobItems.filter((j) => j.status === "DONE");

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/technician" className="text-gray-500 hover:text-blue-600 mb-4 inline-block">
          ← กลับ
        </Link>

        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {workOrder.jobType} - {workOrder.site.name}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {workOrder.site.client.name}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              ต้องทำ: {pendingJobs.length}
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              กำลังทำ: {inProgressJobs.length}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              เสร็จแล้ว: {doneJobs.length}
            </span>
          </div>
        </div>

        {/* QR Code Input */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            สแกน QR Code หรือพิมพ์รหัส
          </h2>
          <form action={`/technician/work-order/${id}/scan`} method="GET" className="flex gap-2">
            <input
              type="text"
              name="qrCode"
              placeholder="พิมพ์หรือสแกน QR Code"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
            >
              ค้นหา
            </button>
          </form>
        </div>

        {/* Job Items List */}
        <div className="space-y-4">
          {/* Pending Jobs */}
          {pendingJobs.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                รายการที่ยังไม่ทำ ({pendingJobs.length})
              </h2>
              <div className="space-y-2">
                {pendingJobs.map((jobItem) => (
                  <Link
                    key={jobItem.id}
                    href={`/technician/job-item/${jobItem.id}`}
                    className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-1">
                          {jobItem.asset.brand} {jobItem.asset.model}
                        </div>
                        <div className="text-sm text-gray-600 font-mono mb-1">
                          QR: {jobItem.asset.qrCode}
                        </div>
                        <div className="text-xs text-gray-500">
                          {jobItem.asset.room.floor.building.site.name} → {jobItem.asset.room.floor.building.name} → {jobItem.asset.room.floor.name} → {jobItem.asset.room.name}
                        </div>
                      </div>
                      <div className="text-blue-600 font-medium ml-4">→</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Jobs */}
          {inProgressJobs.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                กำลังทำ ({inProgressJobs.length})
              </h2>
              <div className="space-y-2">
                {inProgressJobs.map((jobItem) => (
                  <Link
                    key={jobItem.id}
                    href={`/technician/job-item/${jobItem.id}`}
                    className="block bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-1">
                          {jobItem.asset.brand} {jobItem.asset.model}
                        </div>
                        <div className="text-sm text-gray-600 font-mono mb-1">
                          QR: {jobItem.asset.qrCode}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {jobItem.asset.room.floor.building.site.name} → {jobItem.asset.room.floor.building.name} → {jobItem.asset.room.floor.name} → {jobItem.asset.room.name}
                        </div>
                      </div>
                      <div className="text-blue-600 font-medium ml-4">→</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Done Jobs */}
          {doneJobs.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                ✅ เสร็จแล้ว ({doneJobs.length})
              </h2>
              <div className="space-y-2">
                {doneJobs.map((jobItem) => (
                  <div
                    key={jobItem.id}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-1">
                          {jobItem.asset.brand} {jobItem.asset.model}
                        </div>
                        <div className="text-sm text-gray-600 font-mono mb-1">
                          QR: {jobItem.asset.qrCode}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {jobItem.asset.room.floor.building.site.name} → {jobItem.asset.room.floor.building.name} → {jobItem.asset.room.floor.name} → {jobItem.asset.room.name}
                        </div>
                        {jobItem.photos.length > 0 && (
                          <div className="text-xs text-green-600 mt-2">
                            มีรูปภาพ {jobItem.photos.length} ภาพ
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/technician/job-item/${jobItem.id}`}
                        className="text-blue-600 hover:underline text-sm ml-4"
                      >
                        ดู
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
