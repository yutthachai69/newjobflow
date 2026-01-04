import { prisma } from "@/lib/prisma"; // เรียกตัวเชื่อม Database ที่เราทำไว้
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AssetsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // สำหรับ CLIENT: ดูเฉพาะแอร์ใน Site ของตัวเอง
  // สำหรับ ADMIN: ดูทั้งหมด
  let assets;
  
  if (user.role === 'CLIENT') {
    if (!user.siteId) {
      return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลสถานที่</h1>
            <p className="text-gray-600">กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        </div>
      );
    }

    // ดึงแอร์ทั้งหมดใน Site ของ CLIENT
    const site = await prisma.site.findUnique({
      where: { id: user.siteId },
      include: {
        buildings: {
          include: {
            floors: {
              include: {
                rooms: {
                  include: {
                    assets: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!site) {
      return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลสถานที่</h1>
          </div>
        </div>
      );
    }

    assets = site.buildings.flatMap(b => 
      b.floors.flatMap(f => 
        f.rooms.flatMap(r => r.assets)
      )
    );
  } else {
    // ADMIN: ดูทั้งหมด
    assets = await prisma.asset.findMany({
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
      orderBy: {
        qrCode: "asc",
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 ทะเบียนแอร์ทั้งหมด ({assets.length})</h1>
          {user.role === 'CLIENT' && user.site?.name && (
            <p className="text-gray-600 mt-1">สถานที่: {user.site.name}</p>
          )}
        </div>
        {user.role === 'ADMIN' && (
          <Link
            href="/assets/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + เพิ่มแอร์ใหม่
          </Link>
        )}
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
                  <div className="text-gray-900">{asset.room.floor.building.site.name}</div>
                  <div className="text-xs text-gray-500">
                    {asset.room.floor.building.name} → {asset.room.floor.name} → {asset.room.name}
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
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {user.role === 'CLIENT' ? 'ดูสถานะ' : 'ดูรายละเอียด'}
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