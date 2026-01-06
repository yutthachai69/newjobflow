// scripts/clear-assets.js
// ล้างข้อมูลใบสั่งงาน + JobItem + รูปภาพ + Asset ทั้งหมด
// ใช้สำหรับรีเซ็ตทะเบียนแอร์ในสภาพแวดล้อมทดสอบ (ไม่ใช่ production)

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('⚠️  กำลังล้างข้อมูล Asset ทั้งหมด (รวมใบสั่งงานและรูปที่เกี่ยวข้อง)...')

  // ลบตามลำดับความสัมพันธ์เพื่อไม่ให้ติด foreign key
  const deletedJobPhotos = await prisma.jobPhoto.deleteMany({})
  console.log(`🧹 ลบรูปงานแล้ว: ${deletedJobPhotos.count} รายการ`)

  const deletedJobItems = await prisma.jobItem.deleteMany({})
  console.log(`🧹 ลบ JobItem แล้ว: ${deletedJobItems.count} รายการ`)

  const deletedWorkOrders = await prisma.workOrder.deleteMany({})
  console.log(`🧹 ลบใบสั่งงานแล้ว: ${deletedWorkOrders.count} รายการ`)

  const deletedAssets = await prisma.asset.deleteMany({})
  console.log(`🧹 ลบ Asset แล้ว: ${deletedAssets.count} ตัว`)

  console.log('✅ ล้างข้อมูลทะเบียนแอร์เรียบร้อย (Asset + WorkOrder + JobItem + JobPhoto)')
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดขณะล้างข้อมูล:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


