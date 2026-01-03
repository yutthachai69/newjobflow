import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LocationsPage() {
  const clients = await prisma.client.findMany({
    include: {
      sites: {
        include: {
          buildings: {
            include: {
              floors: {
                include: {
                  rooms: {
                    include: {
                      _count: {
                        select: { assets: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      _count: {
        select: { sites: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📍 จัดการสถานที่</h1>
          <Link
            href="/locations/clients/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + เพิ่มลูกค้าใหม่
          </Link>
        </div>

        <div className="space-y-6">
          {clients.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีข้อมูลลูกค้า</h2>
              <p className="text-gray-600 mb-4">เริ่มต้นโดยการเพิ่มลูกค้าใหม่</p>
              <Link
                href="/locations/clients/new"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                + เพิ่มลูกค้าใหม่
              </Link>
            </div>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg shadow">
                {/* Client Header */}
                <div className="p-6 border-b bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        🏢 {client.name}
                      </h2>
                      {client.contactInfo && (
                        <p className="text-gray-600">📞 {client.contactInfo}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {client._count.sites} สาขา
                      </p>
                    </div>
                    <Link
                      href={`/locations/sites/new?clientId=${client.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      + เพิ่มสาขา
                    </Link>
                  </div>
                </div>

                {/* Sites */}
                <div className="p-6">
                  {client.sites.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>ยังไม่มีสาขา</p>
                      <Link
                        href={`/locations/sites/new?clientId=${client.id}`}
                        className="text-blue-600 hover:underline mt-2 inline-block"
                      >
                        + เพิ่มสาขาใหม่
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {client.sites.map((site) => (
                        <div key={site.id} className="border rounded-lg p-4 bg-gray-50">
                          {/* Site Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                📍 {site.name}
                              </h3>
                              {site.address && (
                                <p className="text-sm text-gray-600">📍 {site.address}</p>
                              )}
                            </div>
                            <Link
                              href={`/locations/buildings/new?siteId=${site.id}`}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-medium"
                            >
                              + เพิ่มอาคาร
                            </Link>
                          </div>

                          {/* Buildings */}
                          {site.buildings.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-4">
                              ยังไม่มีอาคาร
                              <Link
                                href={`/locations/buildings/new?siteId=${site.id}`}
                                className="text-blue-600 hover:underline ml-1"
                              >
                                เพิ่มใหม่
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {site.buildings.map((building) => (
                                <div key={building.id} className="bg-white rounded p-3 border">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900">
                                      🏛️ {building.name}
                                    </h4>
                                    <Link
                                      href={`/locations/floors/new?buildingId=${building.id}`}
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      + เพิ่มชั้น
                                    </Link>
                                  </div>

                                  {/* Floors */}
                                  {building.floors.length === 0 ? (
                                    <div className="text-xs text-gray-500 pl-4">
                                      ยังไม่มีชั้น
                                    </div>
                                  ) : (
                                    <div className="space-y-2 pl-4">
                                      {building.floors.map((floor) => (
                                        <div key={floor.id} className="border-l-2 border-gray-200 pl-3">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <h5 className="font-medium text-gray-800 text-sm mb-1">
                                                🏢 {floor.name}
                                              </h5>
                                              {/* Rooms */}
                                              {floor.rooms.length === 0 ? (
                                                <div className="text-xs text-gray-500">
                                                  ยังไม่มีห้อง
                                                  <Link
                                                    href={`/locations/rooms/new?floorId=${floor.id}`}
                                                    className="text-blue-600 hover:underline ml-1"
                                                  >
                                                    เพิ่มใหม่
                                                  </Link>
                                                </div>
                                              ) : (
                                                <div className="space-y-1">
                                                  {floor.rooms.map((room) => (
                                                    <div
                                                      key={room.id}
                                                      className="text-xs text-gray-600 flex justify-between items-center"
                                                    >
                                                      <span>
                                                        🚪 {room.name} ({room._count.assets} แอร์)
                                                      </span>
                                                      <Link
                                                        href={`/locations/rooms/new?floorId=${floor.id}`}
                                                        className="text-blue-600 hover:underline ml-2"
                                                      >
                                                        + เพิ่มห้อง
                                                      </Link>
                                                    </div>
                                                  ))}
                                                  <Link
                                                    href={`/locations/rooms/new?floorId=${floor.id}`}
                                                    className="text-xs text-blue-600 hover:underline"
                                                  >
                                                    + เพิ่มห้องใหม่
                                                  </Link>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
