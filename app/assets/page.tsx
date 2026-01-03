import { prisma } from "@/lib/prisma"; // เรียกตัวเชื่อม Database ที่เราทำไว้
import Link from "next/link";

export default async function AssetsPage() {
  // 1. ดึงข้อมูลแอร์ทั้งหมดจาก Database
  const assets = await prisma.asset.findMany({
    include: {
      room: {
        include: {
          floor: {
            include: {
              building: true, // ดึงยาวไปถึงชื่อตึก
            },
          },
        },
      },
    },
    orderBy: {
      qrCode: "asc", // เรียงตามรหัส QR
    },
  });

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📋 ทะเบียนแอร์ทั้งหมด ({assets.length})</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + เพิ่มแอร์ใหม่
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 uppercase font-medium border-b">
            <tr>
              <th className="px-6 py-3">QR Code</th>
              <th className="px-6 py-3">ยี่ห้อ / รุ่น</th>
              <th className="px-6 py-3">สถานที่ติดตั้ง</th>
              <th className="px-6 py-3">สถานะ</th>
              <th className="px-6 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium text-blue-600">
                  {asset.qrCode}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{asset.brand}</div>
                  <div className="text-xs text-gray-500">{asset.model} ({asset.btu} BTU)</div>
                </td>
                <td className="px-6 py-4">
                  <div>{asset.room.name}</div>
                  <div className="text-xs text-gray-500">
                    {asset.room.floor.building.name} - {asset.room.floor.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      asset.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    ดูประวัติ
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}