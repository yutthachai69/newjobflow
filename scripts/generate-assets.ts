// scripts/generate-assets.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 เริ่มสร้าง Asset 1,000 ตัว...')

  // 1. ดึง Rooms ทั้งหมดที่มีอยู่
  const rooms = await prisma.room.findMany({
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
  })

  if (rooms.length === 0) {
    console.error('❌ ไม่พบ Room ในระบบ กรุณา seed ข้อมูลพื้นฐานก่อน')
    process.exit(1)
  }

  console.log(`📦 พบ ${rooms.length} ห้อง`)

  // 2. ข้อมูลสำหรับสร้าง Assets
  const brands = ['Daikin', 'Carrier', 'Mitsubishi', 'LG', 'Samsung', 'Toshiba', 'Panasonic', 'Hitachi', 'Fujitsu', 'York']
  const models = ['Standard', 'Premium', 'Deluxe', 'Pro', 'Elite', 'Ultra', 'Max', 'Plus', 'Classic', 'Modern']
  const statuses: ('ACTIVE' | 'BROKEN' | 'RETIRED')[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'BROKEN', 'RETIRED']
  
  // BTU ranges (12,000 - 36,000)
  const btuRanges = [12000, 18000, 24000, 30000, 36000]

  // 3. สร้าง Assets 1,000 ตัว
  const totalAssets = 1000
  const batchSize = 100 // สร้างทีละ 100 ตัวเพื่อประสิทธิภาพ

  let created = 0
  const startTime = Date.now()

  for (let batch = 0; batch < totalAssets / batchSize; batch++) {
    const assets = []
    const startIndex = batch * batchSize
    const endIndex = Math.min(startIndex + batchSize, totalAssets)

    for (let i = startIndex; i < endIndex; i++) {
      // สุ่ม Room
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)]
      
      // สุ่ม Brand และ Model
      const brand = brands[Math.floor(Math.random() * brands.length)]
      const model = models[Math.floor(Math.random() * models.length)]
      
      // สุ่ม Status (ส่วนใหญ่เป็น ACTIVE)
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      // สุ่ม BTU
      const btu = btuRanges[Math.floor(Math.random() * btuRanges.length)]
      
      // สร้าง QR Code (unique)
      const qrCode = `AC-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`
      
      // สร้าง Serial Number
      const serialNo = `SN-${brand.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(6, '0')}`
      
      // สุ่ม Install Date (ภายใน 5 ปีที่ผ่านมา)
      const installDate = new Date()
      installDate.setFullYear(installDate.getFullYear() - Math.floor(Math.random() * 5))
      installDate.setMonth(Math.floor(Math.random() * 12))
      installDate.setDate(Math.floor(Math.random() * 28) + 1)

      assets.push({
        qrCode,
        brand,
        model: `${model}-${Math.floor(Math.random() * 10) + 1}`,
        serialNo,
        btu,
        status,
        installDate,
        roomId: randomRoom.id,
      })
    }

    // สร้าง Assets แบบ batch
    try {
      await prisma.asset.createMany({
        data: assets,
      })
    } catch (error: any) {
      // ถ้ามี qrCode ซ้ำ ให้สร้างทีละตัว
      if (error.code === 'P2002') {
        console.log(`⚠️  พบ qrCode ซ้ำ สร้างทีละตัว...`)
        for (const asset of assets) {
          try {
            await prisma.asset.create({ data: asset })
          } catch (e: any) {
            if (e.code !== 'P2002') {
              throw e
            }
          }
        }
      } else {
        throw error
      }
    }

    created += assets.length
    const progress = ((created / totalAssets) * 100).toFixed(1)
    console.log(`✅ สร้างแล้ว ${created}/${totalAssets} ตัว (${progress}%)`)
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  // 4. แสดงสรุป
  const stats = await prisma.asset.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('\n📊 สรุป:')
  console.log(`   ✅ สร้าง Asset สำเร็จ: ${created} ตัว`)
  console.log(`   ⏱️  ใช้เวลา: ${duration} วินาที`)
  console.log('\n📈 สถานะ Assets:')
  stats.forEach((stat) => {
    console.log(`   ${stat.status}: ${stat._count} ตัว`)
  })
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

