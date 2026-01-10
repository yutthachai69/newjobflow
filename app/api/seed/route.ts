/**
 * API Route สำหรับ seed database
 * ใช้สำหรับ seed database หลัง deploy (Vercel)
 * 
 * ⚠️ ควรใช้เฉพาะสำหรับ development หรือ initial setup
 * สำหรับ production ควรปิดหรือใช้ authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบว่าเป็น production หรือไม่
    if (process.env.NODE_ENV === 'production') {
      // ใน production ต้องมี secret key เพื่อป้องกันการ seed ผิดพลาด
      const authHeader = request.headers.get('authorization')
      const expectedSecret = process.env.SEED_SECRET || 'default-secret-change-in-production'
      
      if (authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized. Set SEED_SECRET environment variable and use: Authorization: Bearer <secret>' },
          { status: 401 }
        )
      }
    }

    // Import และ run seed function
    const seedModule = await import('@/prisma/seed')
    
    // Seed function จะ run อัตโนมัติเมื่อ import
    // แต่เราต้อง call main() manually
    const { PrismaClient } = await import('@prisma/client')
    const bcrypt = (await import('bcryptjs')).default
    const seedPrisma = new PrismaClient()

    console.log('🌱 Starting database seed via API...')

    // Run seed logic
    await seedPrisma.jobPhoto.deleteMany()
    await seedPrisma.jobItem.deleteMany()
    await seedPrisma.workOrder.deleteMany()
    await seedPrisma.asset.deleteMany()
    await seedPrisma.room.deleteMany()
    await seedPrisma.floor.deleteMany()
    await seedPrisma.building.deleteMany()
    await seedPrisma.site.deleteMany()
    await seedPrisma.client.deleteMany()
    await seedPrisma.user.deleteMany()

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10)
    const techPasswordHash = await bcrypt.hash('password123', 10)
    const clientPasswordHash = await bcrypt.hash('client123', 10)

    // Create users
    const adminUser = await seedPrisma.user.create({
      data: {
        username: 'admin',
        password: adminPasswordHash,
        fullName: 'ผู้ดูแลระบบ',
        role: 'ADMIN'
      }
    })

    const techUser = await seedPrisma.user.create({
      data: {
        username: 'tech1',
        password: techPasswordHash,
        fullName: 'สมชาย งานดี',
        role: 'TECHNICIAN'
      }
    })

    // Create client and site
    const client = await seedPrisma.client.create({
      data: {
        name: 'Grand Hotel Group',
        contactInfo: '02-999-9999'
      }
    })

    const site = await seedPrisma.site.create({
      data: {
        name: 'สาขาสุขุมวิท',
        clientId: client.id,
        address: 'สุขุมวิท 21 กทม.'
      }
    })

    const clientUser = await seedPrisma.user.create({
      data: {
        username: 'client1',
        password: clientPasswordHash,
        fullName: 'ผู้จัดการสาขาสุขุมวิท',
        role: 'CLIENT',
        siteId: site.id
      }
    })

    // Create building, floors, rooms
    const building = await seedPrisma.building.create({
      data: {
        name: 'อาคาร A (Main Wing)',
        siteId: site.id
      }
    })

    const floor1 = await seedPrisma.floor.create({
      data: { name: 'ชั้น 1 Lobby', buildingId: building.id }
    })
    const floor2 = await seedPrisma.floor.create({
      data: { name: 'ชั้น 2 Meeting', buildingId: building.id }
    })

    const roomLobby = await seedPrisma.room.create({
      data: { name: 'Lobby Hall', floorId: floor1.id }
    })
    const roomServer = await seedPrisma.room.create({
      data: { name: 'Server Room', floorId: floor1.id }
    })

    // Create assets
    const airBrands = ['Daikin', 'Carrier', 'Mitsubishi']
    for (let i = 1; i <= 5; i++) {
      await seedPrisma.asset.create({
        data: {
          qrCode: `AC-2024-00${i}`,
          brand: airBrands[i % 3],
          model: `Model-X${i}`,
          btu: 18000 + (i * 1000),
          serialNo: `SN-0000${i}`,
          status: 'ACTIVE',
          roomId: i <= 2 ? roomServer.id : roomLobby.id
        }
      })
    }

    // Create contact info
    const existingContactInfo = await seedPrisma.contactInfo.findFirst()
    if (!existingContactInfo) {
      await seedPrisma.contactInfo.create({
        data: {
          email: 'support@airservice.com',
          phone: '02-XXX-XXXX',
          hours: 'จันทร์-ศุกร์ 08:00-17:00 น.',
        },
      })
    }

    await seedPrisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      users: {
        admin: { username: 'admin', password: 'admin123' },
        technician: { username: 'tech1', password: 'password123' },
        client: { username: 'client1', password: 'client123' }
      }
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed database',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// สำหรับ GET request - แสดง info
export async function GET() {
  return NextResponse.json({
    message: 'Database Seed API',
    usage: {
      method: 'POST',
      endpoint: '/api/seed',
      production: 'Requires Authorization header: Bearer <SEED_SECRET>',
      development: 'No auth required'
    },
    defaultAccounts: {
      admin: { username: 'admin', password: 'admin123' },
      technician: { username: 'tech1', password: 'password123' },
      client: { username: 'client1', password: 'client123' }
    }
  })
}

