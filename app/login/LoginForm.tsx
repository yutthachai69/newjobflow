'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions'
import Link from 'next/link'

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const newErrors: Record<string, string> = {}

    // Custom validation
    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = 'กรุณากรอก Username'
    }
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = 'กรุณากรอก Password'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      const firstErrorField = document.querySelector('[data-error]')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setErrors({})

    // สร้าง FormData และเรียก login action
    const formDataObj = new FormData()
    formDataObj.append('username', formData.username)
    formDataObj.append('password', formData.password)

    try {
      await login(formDataObj)
    } catch (error) {
      // Handle error if needed
      setErrors({ submit: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div data-error={errors.username ? 'true' : undefined}>
        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          autoFocus
          className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white text-gray-900 placeholder:text-gray-400 ${
            errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
          }`}
          placeholder="กรอก username"
        />
        {errors.username && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>{errors.username}</span>
          </p>
        )}
      </div>

      <div data-error={errors.password ? 'true' : undefined}>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white text-gray-900 placeholder:text-gray-400 ${
            errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
          }`}
          placeholder="กรอก password"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>{errors.password}</span>
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            <span>{errors.submit}</span>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:shadow-xl hover:scale-105 font-semibold text-lg transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  )
}
