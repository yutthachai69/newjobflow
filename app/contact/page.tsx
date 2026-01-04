import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ContactForm from './ContactForm'
import AdminContactInfo from './AdminContactInfo'

export default async function ContactPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // สำหรับ ADMIN: แสดงหน้าแก้ไขข้อมูลการติดต่อ
  if (user.role === 'ADMIN') {
    // ดึงข้อมูลการติดต่อ (ถ้าไม่มีให้สร้าง)
    let contactInfo = await prisma.contactInfo.findFirst()
    
    if (!contactInfo) {
      contactInfo = await prisma.contactInfo.create({
        data: {
          email: 'support@airservice.com',
          phone: '02-XXX-XXXX',
          hours: 'จันทร์-ศุกร์ 08:00-17:00 น.',
        },
      })
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group transition-all duration-200"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="font-medium">กลับ</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                จัดการข้อมูลการติดต่อ
              </h1>
            </div>
            <p className="text-gray-600">แก้ไขข้อมูลการติดต่อที่แสดงให้ลูกค้าเห็น</p>
          </div>

          {/* Admin Contact Info Form */}
          <AdminContactInfo contactInfo={contactInfo} />
        </div>
      </div>
    )
  }

  // สำหรับ CLIENT/TECHNICIAN: แสดง form ส่งข้อความ
  // ดึงข้อมูลการติดต่อ
  const contactInfo = await prisma.contactInfo.findFirst()

  // ดึงชื่อผู้ใช้ (fullName หรือ username)
  const userName = user.fullName || user.username

  // ดึงข้อมูลสถานที่ (ถ้าเป็น CLIENT)
  const userSite = user.site
    ? {
        name: user.site.name,
        clientName: user.site.client.name,
      }
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group transition-all duration-200"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span className="font-medium">กลับ</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
              ติดต่อเรา
            </h1>
          </div>
          <p className="text-gray-600">แจ้งปัญหา สอบถามข้อมูล หรือขอความช่วยเหลือ</p>
        </div>

        {/* Contact Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <ContactForm userName={userName} userSite={userSite} contactInfo={contactInfo} />
        </div>
      </div>
    </div>
  )
}
