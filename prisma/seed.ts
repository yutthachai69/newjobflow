// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // 1. ล้างข้อมูลเก่าทิ้งก่อน (เรียงตามลำดับเพื่อไม่ให้ติด Relation)
  await prisma.jobPhoto.deleteMany()
  await prisma.jobItem.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.room.deleteMany()
  await prisma.floor.deleteMany()
  await prisma.building.deleteMany()
  await prisma.site.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const techPasswordHash = await bcrypt.hash('password123', 10)
  const clientPasswordHash = await bcrypt.hash('client123', 10)

  // 3. สร้าง User (Admin, ช่าง, ลูกค้า)
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPasswordHash,
      fullName: 'ผู้ดูแลระบบ',
      role: 'ADMIN'
    }
  })

  const techUser = await prisma.user.create({
    data: {
      username: 'tech1',
      password: techPasswordHash,
      fullName: 'สมชาย งานดี',
      role: 'TECHNICIAN'
    }
  })

  // 3. สร้างลูกค้า (Client)
  const client = await prisma.client.create({
    data: {
      name: 'Grand Hotel Group',
      contactInfo: '02-999-9999'
    }
  })

  // 4. สร้างสาขา (Site)
  const site = await prisma.site.create({
    data: {
      name: 'สาขาสุขุมวิท',
      clientId: client.id,
      address: 'สุขุมวิท 21 กทม.'
    }
  })

  // สร้าง User สำหรับลูกค้า (ผูกกับ Site)
  const clientUser = await prisma.user.create({
    data: {
      username: 'client1',
      password: clientPasswordHash, // Fixed: ใช้ hashed password
      fullName: 'ผู้จัดการสาขาสุขุมวิท',
      role: 'CLIENT',
      siteId: site.id  // ผูกกับ Site แทน Client
    }
  })

  // 5. สร้างตึก (Building)
  const building = await prisma.building.create({
    data: {
      name: 'อาคาร A (Main Wing)',
      siteId: site.id
    }
  })

  // 6. สร้างชั้น (Floors)
  const floor1 = await prisma.floor.create({
    data: { name: 'ชั้น 1 Lobby', buildingId: building.id }
  })
  const floor2 = await prisma.floor.create({
    data: { name: 'ชั้น 2 Meeting', buildingId: building.id }
  })

  // 7. สร้างห้อง (Rooms)
  const roomLobby = await prisma.room.create({
    data: { name: 'Lobby Hall', floorId: floor1.id }
  })
  const roomServer = await prisma.room.create({
    data: { name: 'Server Room', floorId: floor1.id }
  })

  // 8. สร้างแอร์ (Assets) - เสกมา 5 ตัว
  const airBrands = ['Daikin', 'Carrier', 'Mitsubishi']
  
  for (let i = 1; i <= 5; i++) {
    await prisma.asset.create({
      data: {
        qrCode: `AC-2024-00${i}`, // รหัส QR
        brand: airBrands[i % 3],
        model: `Model-X${i}`,
        btu: 18000 + (i * 1000),
        serialNo: `SN-0000${i}`,
        status: 'ACTIVE',
        roomId: i <= 2 ? roomServer.id : roomLobby.id // แบ่งห้องกันอยู่
      }
    })
  }

  // 9. สร้างข้อมูลการติดต่อ (Contact Info)
  const existingContactInfo = await prisma.contactInfo.findFirst()
  if (!existingContactInfo) {
    await prisma.contactInfo.create({
      data: {
        email: 'support@airservice.com',
        phone: '02-XXX-XXXX',
        hours: 'จันทร์-ศุกร์ 08:00-17:00 น.',
      },
    })
  }

  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })