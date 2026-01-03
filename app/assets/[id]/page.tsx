import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createMockMaintenance } from "@/app/actions"; // <--- Import มาใหม่

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          floor: {
            include: {
              building: {
                include: { site: true },
              },
            },
          },
        },
      },
      jobItems: {
        include: {
          workOrder: true,
          technician: true,
          photos: true,
        },
        orderBy: { startTime: "desc" },
      },
    },
  });

  if (!asset) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <Link href="/assets" className="text-gray-500 hover:text-blue-600 mb-4 inline-block">
        ← กลับไปหน้ารายการ
      </Link>

      <div className="bg-white rounded-xl shadow-lg border p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {asset.status}
            </span>
            <h1 className="text-3xl font-bold mt-2 text-gray-800">
              {asset.brand} - {asset.model}
            </h1>
            <p className="text-gray-500 text-lg font-mono mt-1">QR: {asset.qrCode}</p>
          </div>
          <div className="text-right">
             <div className="text-sm text-gray-500">ขนาด BTU</div>
             <div className="text-2xl font-bold text-blue-600">{asset.btu?.toLocaleString()} BTU</div>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">สถานที่ติดตั้ง</p>
            <p className="font-semibold text-lg">{asset.room.floor.building.site.name}</p>
            <p>{asset.room.floor.building.name} / {asset.room.floor.name}</p>
            <p>ห้อง: {asset.room.name}</p>
          </div>
          <div>
            <p className="text-gray-500">ข้อมูลเครื่อง</p>
            <p>S/N: {asset.serialNo || "-"}</p>
            <p>วันที่ติดตั้ง: {asset.installDate ? asset.installDate.toLocaleDateString('th-TH') : "-"}</p>
          </div>
        </div>
      </div>

      {/* --- ส่วนปุ่มทดสอบ (เพิ่มใหม่) --- */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
        <div>
           <h3 className="font-bold text-blue-900">🔧 พื้นที่ทดสอบระบบ (Demo)</h3>
           <p className="text-sm text-blue-700">กดปุ่มนี้เพื่อจำลองว่าช่างเพิ่งปิดงานซ่อมเสร็จ</p>
        </div>
        <form action={createMockMaintenance.bind(null, asset.id)}>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
               + เพิ่มประวัติงานซ่อมเดี๋ยวนี้
            </button>
        </form>
      </div>
      {/* ----------------------------- */}

      <h2 className="text-xl font-bold mb-4 flex items-center">
        🛠️ ประวัติการบำรุงรักษา
        <span className="ml-2 text-sm font-normal text-gray-500">({asset.jobItems.length} รายการ)</span>
      </h2>

      <div className="space-y-4">
        {asset.jobItems.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed text-gray-500">
            ยังไม่มีประวัติการซ่อมบำรุง
          </div>
        ) : (
          asset.jobItems.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition">
              <div className="flex justify-between mb-2">
                <div className="font-bold text-blue-800">
                  {job.workOrder.jobType} - {job.status}
                </div>
                <div className="text-sm text-gray-500">
                  {job.startTime ? new Date(job.startTime).toLocaleDateString('th-TH') : "ไม่ระบุวัน"}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{job.techNote || "ไม่มีบันทึกเพิ่มเติม"}</p>
              
              {/* แสดงรูปภาพ Before/After */}
              {job.photos && job.photos.length > 0 && (
                <div className="mt-4 mb-3">
                  <div className="grid grid-cols-2 gap-4">
                    {job.photos
                      .filter((photo) => photo.type === 'BEFORE' || photo.type === 'AFTER')
                      .map((photo) => (
                        <div key={photo.id} className="relative">
                          <div className="text-xs font-semibold mb-1 text-gray-600 uppercase">
                            {photo.type === 'BEFORE' ? '🔵 ก่อนทำ' : '🟢 หลังทำ'}
                          </div>
                          <img
                            src={photo.url}
                            alt={photo.type}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(photo.createdAt).toLocaleString('th-TH')}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {/* แสดงรูปภาพอื่นๆ (DEFECT, METER) */}
                  {job.photos.some((p) => p.type === 'DEFECT' || p.type === 'METER') && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {job.photos
                        .filter((photo) => photo.type === 'DEFECT' || photo.type === 'METER')
                        .map((photo) => (
                          <div key={photo.id} className="relative">
                            <div className="text-xs font-semibold mb-1 text-gray-600">
                              {photo.type === 'DEFECT' ? '⚠️ จุดชำรุด' : '📊 ค่าเกจ'}
                            </div>
                            <img
                              src={photo.url}
                              alt={photo.type}
                              className="w-full h-40 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-400 border-t pt-2">
                โดยช่าง: {job.technician?.fullName || "System Admin"}
                {job.startTime && job.endTime && (
                  <span className="ml-2">
                    • ใช้เวลา: {Math.round((new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 60000)} นาที
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}