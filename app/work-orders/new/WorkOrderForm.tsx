'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWorkOrder } from '@/app/actions'

interface Site {
  id: string
  name: string
  client: {
    name: string
  }
  buildings: Building[]
}

interface Building {
  id: string
  name: string
  floors: Floor[]
}

interface Floor {
  id: string
  name: string
  rooms: Room[]
}

interface Room {
  id: string
  name: string
  assets: Asset[]
}

interface Asset {
  id: string
  qrCode: string
  brand: string | null
  model: string | null
  btu: number | null
}

interface Props {
  sites: Site[]
}

type SelectionStage = 'site' | 'building' | 'floor' | 'room' | 'done'

export default function WorkOrderForm({ sites }: Props) {
  const router = useRouter()
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('')
  const [selectedFloorId, setSelectedFloorId] = useState<string>('')
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [currentStage, setCurrentStage] = useState<SelectionStage>('site')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedSite = sites.find(s => s.id === selectedSiteId)
  const selectedBuilding = selectedSite?.buildings.find(b => b.id === selectedBuildingId)
  const selectedFloor = selectedBuilding?.floors.find(f => f.id === selectedFloorId)
  const selectedRoom = selectedFloor?.rooms.find(r => r.id === selectedRoomId)
  
  // สร้าง breadcrumb path
  const locationPath = selectedRoom
    ? `${selectedSite?.name} → ${selectedBuilding?.name} → ${selectedFloor?.name} → ${selectedRoom.name}`
    : selectedFloor
    ? `${selectedSite?.name} → ${selectedBuilding?.name} → ${selectedFloor.name}`
    : selectedBuilding
    ? `${selectedSite?.name} → ${selectedBuilding.name}`
    : selectedSite
    ? selectedSite.name
    : ''

  // ดึง options ตาม stage ปัจจุบัน
  const getCurrentOptions = () => {
    const query = searchQuery.toLowerCase()
    
    if (currentStage === 'site') {
      return sites
        .filter(site => 
          site.name.toLowerCase().includes(query) || 
          site.client.name.toLowerCase().includes(query)
        )
        .map(site => ({
          id: site.id,
          label: `${site.name} (${site.client.name})`,
          type: 'site' as const,
        }))
    }
    
    if (currentStage === 'building' && selectedSite) {
      return selectedSite.buildings
        .filter(building => building.name.toLowerCase().includes(query))
        .map(building => ({
          id: building.id,
          label: building.name,
          type: 'building' as const,
        }))
    }
    
    if (currentStage === 'floor' && selectedBuilding) {
      return selectedBuilding.floors
        .filter(floor => floor.name.toLowerCase().includes(query))
        .map(floor => ({
          id: floor.id,
          label: floor.name,
          type: 'floor' as const,
        }))
    }
    
    if (currentStage === 'room' && selectedFloor) {
      return selectedFloor.rooms
        .filter(room => room.name.toLowerCase().includes(query))
        .map(room => ({
          id: room.id,
          label: room.name,
          type: 'room' as const,
        }))
    }
    
    return []
  }

  const handleOptionSelect = (option: { id: string; label: string; type: string }) => {
    setSearchQuery('')
    setShowDropdown(false)
    
    if (option.type === 'site') {
      setSelectedSiteId(option.id)
      setSelectedBuildingId('')
      setSelectedFloorId('')
      setSelectedRoomId('')
      setCurrentStage('building')
      if (errors.siteId) setErrors({ ...errors, siteId: '' })
    } else if (option.type === 'building') {
      setSelectedBuildingId(option.id)
      setSelectedFloorId('')
      setSelectedRoomId('')
      setCurrentStage('floor')
      if (errors.buildingId) setErrors({ ...errors, buildingId: '' })
    } else if (option.type === 'floor') {
      setSelectedFloorId(option.id)
      setSelectedRoomId('')
      setCurrentStage('room')
      if (errors.floorId) setErrors({ ...errors, floorId: '' })
    } else if (option.type === 'room') {
      setSelectedRoomId(option.id)
      setCurrentStage('done')
      if (errors.roomId) setErrors({ ...errors, roomId: '' })
    }
  }

  const handleReset = () => {
    setSelectedSiteId('')
    setSelectedBuildingId('')
    setSelectedFloorId('')
    setSelectedRoomId('')
    setCurrentStage('site')
    setSearchQuery('')
    setShowDropdown(false)
    setErrors({})
  }
  
  // รวบรวมแอร์ทั้งหมดจากห้องที่เลือก (ถ้าเลือกห้อง) หรือจากชั้นที่เลือก (ถ้ายังไม่เลือกห้อง)
  const filteredAssets: Array<{
    asset: Asset
    siteName: string
    buildingName: string
    floorName: string
    roomName: string
  }> = selectedRoom
    ? selectedRoom.assets.map((asset) => ({
        asset,
        siteName: selectedSite!.name,
        buildingName: selectedBuilding!.name,
        floorName: selectedFloor!.name,
        roomName: selectedRoom.name,
      }))
    : selectedFloor
    ? selectedFloor.rooms.flatMap((room) =>
        room.assets.map((asset) => ({
          asset,
          siteName: selectedSite!.name,
          buildingName: selectedBuilding!.name,
          floorName: selectedFloor.name,
          roomName: room.name,
        }))
      )
    : []

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const newErrors: Record<string, string> = {}

    // Validation
    if (!selectedSiteId) {
      newErrors.siteId = 'กรุณาเลือกสถานที่'
    }
    if (!selectedBuildingId) {
      newErrors.buildingId = 'กรุณาเลือกอาคาร'
    }
    if (!selectedFloorId) {
      newErrors.floorId = 'กรุณาเลือกชั้น'
    }

    const formData = new FormData(e.currentTarget)
    const jobType = formData.get('jobType') as string
    if (!jobType) {
      newErrors.jobType = 'กรุณาเลือกชนิดงาน'
    }

    const scheduledDate = formData.get('scheduledDate') as string
    if (!scheduledDate) {
      newErrors.scheduledDate = 'กรุณาเลือกวันนัดหมาย'
    }

    const assetIds = formData.getAll('assetIds')
    if (assetIds.length === 0) {
      newErrors.assetIds = 'กรุณาเลือกเครื่องปรับอากาศอย่างน้อย 1 เครื่อง'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error]')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setErrors({})
    formData.set('siteId', selectedSiteId)
    await createWorkOrder(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
      <div className="space-y-6">
        {/* เลือกสถานที่ (Single Autocomplete Field) */}
        <div data-error={(errors.siteId || errors.buildingId || errors.floorId) ? 'true' : undefined}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            สถานที่ติดตั้ง <span className="text-red-500">*</span>
          </label>
          
          {/* Breadcrumb Display */}
          {locationPath && (
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-blue-700 font-medium">{locationPath}</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  เปลี่ยน
                </button>
              </div>
            </div>
          )}

          {/* Search Input */}
          {currentStage !== 'done' && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder={
                  currentStage === 'site' ? 'ค้นหาหรือเลือกสถานที่...' :
                  currentStage === 'building' ? 'ค้นหาหรือเลือกอาคาร...' :
                  currentStage === 'floor' ? 'ค้นหาหรือเลือกชั้น...' :
                  'ค้นหาหรือเลือกห้อง...'
                }
                className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white text-gray-900 placeholder:text-gray-400 ${
                  (errors.siteId || errors.buildingId || errors.floorId) ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
                }`}
              />
              
              {/* Dropdown Options */}
              {showDropdown && getCurrentOptions().length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {getCurrentOptions().map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{option.label}</span>
                        <span className="text-xs text-gray-500">
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Messages */}
          {errors.siteId && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span>{errors.siteId}</span>
            </div>
          )}
          {errors.buildingId && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span>{errors.buildingId}</span>
            </div>
          )}
          {errors.floorId && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span>{errors.floorId}</span>
            </div>
          )}
          
          {/* Helper Text */}
          {!errors.siteId && !errors.buildingId && !errors.floorId && (
            <p className="mt-2 text-xs text-gray-500">
              {currentStage === 'site' && 'ค้นหาหรือเลือกสถานที่ที่ต้องการทำงาน'}
              {currentStage === 'building' && 'ค้นหาหรือเลือกอาคาร'}
              {currentStage === 'floor' && 'ค้นหาหรือเลือกชั้น'}
              {currentStage === 'room' && 'ค้นหาหรือเลือกห้อง (ไม่บังคับ - สามารถเลือกทั้งหมดในชั้นได้)'}
              {currentStage === 'done' && 'เลือกสถานที่เรียบร้อยแล้ว'}
            </p>
          )}
        </div>

        {/* ชนิดงาน */}
        <div data-error={errors.jobType ? 'true' : undefined}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ชนิดงาน <span className="text-red-500">*</span>
          </label>
          <select
            name="jobType"
            onChange={(e) => {
              if (errors.jobType) setErrors({ ...errors, jobType: '' })
            }}
            className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white text-gray-900 ${
              errors.jobType ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
            }`}
          >
            <option value="">-- เลือกชนิดงาน --</option>
            <option value="PM">🔧 PM - บำรุงรักษาประจำ</option>
            <option value="CM">⚡ CM - ซ่อมฉุกเฉิน</option>
            <option value="INSTALL">🆕 INSTALL - ติดตั้งใหม่</option>
          </select>
          {errors.jobType && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span>{errors.jobType}</span>
            </div>
          )}
          {!errors.jobType && (
            <p className="mt-2 text-xs text-gray-500">
              ประเภทของงานที่ต้องการทำ
            </p>
          )}
        </div>

        {/* วันนัดหมาย */}
        <div data-error={errors.scheduledDate ? 'true' : undefined}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            วันนัดหมาย <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="scheduledDate"
            onChange={(e) => {
              if (errors.scheduledDate) setErrors({ ...errors, scheduledDate: '' })
            }}
            className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white text-gray-900 ${
              errors.scheduledDate ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
            }`}
          />
          {errors.scheduledDate && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span>{errors.scheduledDate}</span>
            </div>
          )}
          {!errors.scheduledDate && (
            <p className="mt-2 text-xs text-gray-500">
              📅 วันและเวลาที่ต้องการให้ช่างเข้าทำงาน
            </p>
          )}
        </div>

        {/* ทีมที่รับผิดชอบ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ทีมที่รับผิดชอบ
          </label>
          <input
            type="text"
            name="assignedTeam"
            placeholder="เช่น ทีมช่าง A, สมชาย งานดี"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white text-gray-900 placeholder:text-gray-400"
          />
          <p className="mt-2 text-xs text-gray-500">
            👥 ระบุชื่อทีมหรือช่างที่รับผิดชอบ (ไม่บังคับ)
          </p>
        </div>

        {/* เลือกแอร์ */}
        <div data-error={errors.assetIds ? 'true' : undefined}>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            เลือกเครื่องปรับอากาศ <span className="text-red-500">*</span>
          </label>
          
          {!selectedSiteId ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <p className="text-gray-600 font-medium mb-2">กรุณาเลือกสถานที่ก่อน</p>
              <p className="text-sm text-gray-500">หลังจากเลือกสถานที่ อาคาร และชั้นแล้ว จะแสดงเครื่องปรับอากาศ</p>
            </div>
          ) : !selectedBuildingId ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <p className="text-gray-600 font-medium mb-2">กรุณาเลือกอาคารก่อน</p>
              <p className="text-sm text-gray-500">หลังจากเลือกอาคารและชั้นแล้ว จะแสดงเครื่องปรับอากาศ</p>
            </div>
          ) : !selectedFloorId ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <p className="text-gray-600 font-medium mb-2">กรุณาเลือกชั้นก่อน</p>
              <p className="text-sm text-gray-500">หลังจากเลือกชั้นแล้ว จะแสดงเครื่องปรับอากาศในชั้นนั้น</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <p className="text-gray-600 font-medium mb-2">
                {selectedRoomId 
                  ? 'ไม่พบเครื่องปรับอากาศในห้องนี้' 
                  : 'ไม่พบเครื่องปรับอากาศในชั้นนี้'}
              </p>
              <p className="text-sm text-gray-500">
                {selectedRoomId
                  ? 'ห้องนี้ยังไม่มีเครื่องปรับอากาศ'
                  : 'ชั้นนี้ยังไม่มีเครื่องปรับอากาศ'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>
                    พบเครื่องปรับอากาศทั้งหมด <span className="font-bold text-blue-700">{filteredAssets.length}</span> เครื่อง
                    {selectedRoomId ? ` ในห้อง ${selectedRoom?.name}` : ` ในชั้น ${selectedFloor?.name}`}
                  </span>
                </div>
              </div>
              
              <div className="border-2 border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto space-y-3 bg-gray-50">
                {filteredAssets.map((item) => (
                  <label
                    key={item.asset.id}
                    className="flex items-start gap-3 p-4 hover:bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white"
                  >
                    <input
                      type="checkbox"
                      name="assetIds"
                      value={item.asset.id}
                      className="mt-1.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-gray-900">
                          {item.asset.brand || 'ไม่มียี่ห้อ'} {item.asset.model || ''}
                        </div>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {item.asset.qrCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1 flex-wrap">
                        <span>{item.siteName}</span>
                        <span className="text-gray-400">→</span>
                        <span>{item.buildingName}</span>
                        <span className="text-gray-400">→</span>
                        <span>{item.floorName}</span>
                        <span className="text-gray-400">→</span>
                        <span>{item.roomName}</span>
                      </div>
                      {item.asset.btu && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span>💨</span>
                          <span>{item.asset.btu.toLocaleString()} BTU</span>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <span>เลือกเครื่องที่ต้องการบำรุงรักษาในใบสั่งงานนี้ (เลือกได้หลายเครื่อง)</span>
              </p>
            </>
          )}
        </div>

        {/* ปุ่ม Submit */}
        {errors.assetIds && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <span>{errors.assetIds}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || !selectedSiteId || !selectedBuildingId || !selectedFloorId || filteredAssets.length === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>{isSubmitting ? 'กำลังสร้าง...' : 'สร้างใบสั่งงาน'}</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/work-orders')}
            className="sm:flex-none px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-medium text-center transition-all duration-200 text-gray-700"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </form>
  )
}

