'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/app/actions'
import Link from 'next/link'

interface Site {
  id: string
  name: string
  client: {
    name: string
  }
}

interface Props {
  sites: Site[]
}

export default function UserForm({ sites }: Props) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'TECHNICIAN' | 'CLIENT'>('TECHNICIAN')
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const newErrors: Record<string, string> = {}

    const formData = new FormData(e.currentTarget)
    const username = (formData.get('username') as string)?.trim() || ''
    const password = formData.get('password') as string
    const fullName = (formData.get('fullName') as string)?.trim() || null

    // Validation
    if (!username) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้'
    } else if (username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
    } else if (username.length > 50) {
      newErrors.username = 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      newErrors.username = 'ชื่อผู้ใช้สามารถใช้ได้เฉพาะตัวอักษร ตัวเลข _ และ -'
    }
    
    if (!password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน'
    } else if (password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    } else if (password.length > 128) {
      newErrors.password = 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร'
    }
    
    if (selectedRole === 'CLIENT' && !selectedSiteId) {
      newErrors.siteId = 'กรุณาเลือกสถานที่ (สำหรับ CLIENT)'
    }
    
    if (fullName && fullName.length > 200) {
      newErrors.fullName = 'ชื่อ-นามสกุลต้องไม่เกิน 200 ตัวอักษร'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      const firstErrorField = document.querySelector('[data-error]')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setErrors({})
    formData.set('role', selectedRole)
    if (selectedRole === 'CLIENT' && selectedSiteId) {
      formData.set('siteId', selectedSiteId)
    }

    try {
      await createUser(formData)
    } catch (err: any) {
      setErrors({ submit: err.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border p-8">
      <div className="space-y-6">
        {/* Username */}
        <div data-error={errors.username ? 'true' : undefined}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ชื่อผู้ใช้ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            autoFocus
            className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 ${
              errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
            }`}
            placeholder="เช่น tech1, client1"
          />
          {errors.username && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span>{errors.username}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div data-error={errors.password ? 'true' : undefined}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            รหัสผ่าน <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 ${
              errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
            }`}
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ชื่อ-นามสกุล
          </label>
          <input
            type="text"
            name="fullName"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400"
            placeholder="เช่น สมชาย งานดี"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            บทบาท <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value as 'ADMIN' | 'TECHNICIAN' | 'CLIENT')
              setSelectedSiteId('')
            }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
          >
            <option value="TECHNICIAN">ช่าง</option>
            <option value="CLIENT">ลูกค้า</option>
            <option value="ADMIN">ผู้ดูแลระบบ</option>
          </select>
        </div>

        {/* Site Selection (สำหรับ CLIENT) */}
        {selectedRole === 'CLIENT' && (
          <div data-error={errors.siteId ? 'true' : undefined}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              สถานที่ <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 ${
                errors.siteId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">-- เลือกสถานที่ --</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.client.name})
                </option>
              ))}
            </select>
            {errors.siteId && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>{errors.siteId}</span>
              </p>
            )}
            {!errors.siteId && (
              <p className="mt-2 text-xs text-gray-500">
                สำหรับ CLIENT: ต้องเลือกสถานที่ที่ผู้ใช้จะดูแล
              </p>
            )}
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}
          </button>
          <Link
            href="/users"
            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </div>
    </form>
  )
}

