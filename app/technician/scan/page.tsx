'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ScanQRPage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const html5QrCodeRef = useRef<any>(null)
  const scannedRef = useRef(false)

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {})
        html5QrCodeRef.current.clear().catch(() => {})
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      setScanning(true)
      scannedRef.current = false

      // Dynamic import html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode')
      const qrCode = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = qrCode
      
      await qrCode.start(
        { facingMode: 'environment' }, // ใช้กล้องหลัง
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText: string) => {
          // สแกนสำเร็จ!
          if (scannedRef.current) return // ป้องกันการสแกนซ้ำ
          scannedRef.current = true
          
          try {
            await qrCode.stop()
            await qrCode.clear()
            setScanning(false)
            html5QrCodeRef.current = null
            
            // ค้นหา Asset จาก QR Code แล้ว redirect ไปหน้า Asset Detail
            const response = await fetch(`/api/assets/find?qrCode=${encodeURIComponent(decodedText)}`)
            const data = await response.json()
            if (data.assetId) {
              router.push(`/assets/${data.assetId}`)
            } else {
              setError('ไม่พบเครื่องปรับอากาศที่ระบุ')
              setScanning(false)
            }
          } catch (err) {
            setScanning(false)
            html5QrCodeRef.current = null
            setError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
          }
        },
        () => {
          // ยังไม่สแกนเจอ (ไม่ต้องแสดง error)
        }
      )
    } catch (err: any) {
      console.error('Error starting camera:', err)
      setError('ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาตให้ใช้งานกล้อง')
      setScanning(false)
      html5QrCodeRef.current = null
    }
  }

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        await html5QrCodeRef.current.clear()
      } catch (err) {
        console.error('Error stopping camera:', err)
      }
      html5QrCodeRef.current = null
    }
    setScanning(false)
  }

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector('input[name="qrCode"]') as HTMLInputElement
    const qrCodeValue = input?.value.trim()
    
    if (!qrCodeValue) {
      setError('กรุณากรอกรหัส QR Code')
      return
    }

    setError(null)
    
    try {
      const response = await fetch(`/api/assets/find?qrCode=${encodeURIComponent(qrCodeValue)}`)
      const data = await response.json()
      if (data.assetId) {
        router.push(`/assets/${data.assetId}`)
      } else {
        setError('ไม่พบเครื่องปรับอากาศที่ระบุ')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            สแกน QR Code
          </h1>
          <p className="text-gray-600">
            สแกน QR Code บนตัวแอร์เพื่อดูประวัติเครื่อง
          </p>
        </div>

        {/* Scanner Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div id="qr-reader" className="w-full mb-4"></div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!scanning ? (
              <button
                onClick={startScanning}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
              >
                เปิดกล้องสแกน
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium text-lg"
              >
                หยุดสแกน
              </button>
            )}
          </div>
        </div>

        {/* Manual Input */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            หรือพิมพ์รหัส QR Code
          </h2>
          <form 
            className="flex gap-2"
            onSubmit={handleManualSubmit}
          >
            <input
              type="text"
              name="qrCode"
              placeholder="พิมพ์รหัส QR Code"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium whitespace-nowrap"
            >
              ค้นหา
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
