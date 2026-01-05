'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import AssetsSearchFilter from './AssetsSearchFilter'
import EmptyState from '@/app/components/EmptyState'

interface Asset {
  id: string
  qrCode: string
  brand: string | null
  model: string | null
  btu: number | null
  status: string
  room: {
    name: string
    floor: {
      name: string
      building: {
        name: string
        site: {
          name: string
        }
      }
    }
  }
}

interface Props {
  assets: Asset[]
  userRole: string
}

export default function AssetsClient({ assets, userRole }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Search filter
      const searchLower = search.toLowerCase()
      const matchesSearch = 
        !search ||
        asset.qrCode.toLowerCase().includes(searchLower) ||
        asset.brand?.toLowerCase().includes(searchLower) ||
        asset.model?.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [assets, search, statusFilter])

  const getStatusBadge = (status: string) => {
    const configs = {
      ACTIVE: { bg: 'bg-green-100 text-green-800', text: 'ใช้งาน' },
      BROKEN: { bg: 'bg-red-100 text-red-800', text: 'ชำรุด' },
      RETIRED: { bg: 'bg-gray-100 text-gray-800', text: 'เลิกใช้งาน' },
    }
    const config = configs[status as keyof typeof configs] || configs.RETIRED
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg}`}>
        {config.text}
      </span>
    )
  }

  return (
    <>
      <AssetsSearchFilter
        searchValue={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredAssets.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={search || statusFilter !== 'ALL' ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูลแอร์"}
            description={search || statusFilter !== 'ALL' ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : userRole === 'ADMIN' ? "เริ่มต้นโดยการเพิ่มแอร์ใหม่" : "ยังไม่มีแอร์ในระบบ"}
            actionLabel={userRole === 'ADMIN' && !search && statusFilter === 'ALL' ? "+ เพิ่มแอร์ใหม่" : undefined}
            actionHref={userRole === 'ADMIN' && !search && statusFilter === 'ALL' ? "/assets/new" : undefined}
          />
        ) : (
          filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-mono font-medium text-blue-600 text-sm mb-1">
                    {asset.qrCode}
                  </div>
                  <div className="font-bold text-gray-900 text-base mb-1">
                    {asset.brand}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {asset.model} {asset.btu && `(${asset.btu} BTU)`}
                  </div>
                </div>
                {getStatusBadge(asset.status)}
              </div>
              
              <div className="mb-3 pb-3 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">สถานที่ติดตั้ง</div>
                <div className="text-sm text-gray-900 font-medium">
                  {asset.room.floor.building.site.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {asset.room.floor.building.name} → {asset.room.floor.name} → {asset.room.name}
                </div>
              </div>

              <Link
                href={`/assets/${asset.id}`}
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm transition-colors"
              >
                {userRole === 'CLIENT' ? 'ดูสถานะ' : 'ดูรายละเอียด'}
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border rounded-lg shadow-sm">
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
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12">
                  <EmptyState
                    icon="🔍"
                    title={search || statusFilter !== 'ALL' ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูลแอร์"}
                    description={search || statusFilter !== 'ALL' ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : userRole === 'ADMIN' ? "เริ่มต้นโดยการเพิ่มแอร์ใหม่" : "ยังไม่มีแอร์ในระบบ"}
                    actionLabel={userRole === 'ADMIN' && !search && statusFilter === 'ALL' ? "+ เพิ่มแอร์ใหม่" : undefined}
                    actionHref={userRole === 'ADMIN' && !search && statusFilter === 'ALL' ? "/assets/new" : undefined}
                  />
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
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
                    {getStatusBadge(asset.status)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {userRole === 'CLIENT' ? 'ดูสถานะ' : 'ดูรายละเอียด'}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredAssets.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          แสดง {filteredAssets.length} จาก {assets.length} รายการ
        </div>
      )}
    </>
  )
}
