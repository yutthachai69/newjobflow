/**
 * Setup API Route - สร้าง Schema + Seed Database
 * ใช้สำหรับ setup database ทั้งหมดในตัวเดียว (สำหรับ Vercel deployment)
 * 
 * วิธีใช้: POST /api/setup
 * - สร้าง database schema (db push)
 * - Seed database
 */

import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // อนุญาตให้เรียกได้ใน production (สำหรับ initial setup)
    if (process.env.NODE_ENV === 'production' && process.env.SEED_SECRET) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('🔧 Starting complete database setup...')
    
    const results: string[] = []
    let schemaCreated = false
    let seedCompleted = false

    // Step 1: Generate Prisma Client (ถ้ายังไม่มี)
    try {
      console.log('📦 Step 1: Generating Prisma Client...')
      execSync('npx prisma generate', {
        stdio: 'pipe',
        cwd: process.cwd(),
      })
      results.push('✅ Prisma Client generated')
    } catch (generateError: any) {
      console.warn('⚠️  Prisma generate warning:', generateError.message)
      results.push('⚠️  Prisma Client may already be generated')
    }

    // Step 2: Create Database Schema (db push)
    try {
      console.log('🚀 Step 2: Creating database schema...')
      
      // เช็คว่า schema มีอยู่แล้วหรือยัง
      const testPrisma = new PrismaClient()
      try {
        await testPrisma.$connect()
        await testPrisma.user.findFirst({ take: 1 })
        await testPrisma.$disconnect()
        results.push('✅ Database schema already exists')
        schemaCreated = true
      } catch (schemaError: any) {
        // Schema ยังไม่มี = ต้องสร้าง
        await testPrisma.$disconnect()
        
        console.log('📝 Creating schema with db push...')
        execSync('npx prisma db push --accept-data-loss --skip-generate', {
          stdio: 'pipe',
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:/tmp/prisma/dev.db' }
        })
        
        // Re-generate client หลังสร้าง schema
        execSync('npx prisma generate', {
          stdio: 'pipe',
          cwd: process.cwd(),
        })
        
        results.push('✅ Database schema created successfully')
        schemaCreated = true
      }
    } catch (pushError: any) {
      console.error('❌ Schema creation failed:', pushError.message)
      results.push(`❌ Schema creation failed: ${pushError.message}`)
      
      return NextResponse.json(
        {
          error: 'Database setup failed at schema creation',
          message: pushError.message,
          results,
          code: 'SCHEMA_CREATION_FAILED'
        },
        { status: 500 }
      )
    }

    // Step 3: Seed Database
    if (schemaCreated) {
      try {
        console.log('🌱 Step 3: Seeding database...')
        const seedPrisma = new PrismaClient()

        // Clear existing data (if any)
        await seedPrisma.jobPhoto.deleteMany().catch(() => {})
        await seedPrisma.jobItem.deleteMany().catch(() => {})
        await seedPrisma.workOrder.deleteMany().catch(() => {})
        await seedPrisma.asset.deleteMany().catch(() => {})
        await seedPrisma.room.deleteMany().catch(() => {})
        await seedPrisma.floor.deleteMany().catch(() => {})
        await seedPrisma.building.deleteMany().catch(() => {})
        await seedPrisma.site.deleteMany().catch(() => {})
        await seedPrisma.client.deleteMany().catch(() => {})
        await seedPrisma.user.deleteMany().catch(() => {})

        // Hash passwords
        const adminPasswordHash = await bcrypt.hash('admin123', 10)
        const techPasswordHash = await bcrypt.hash('password123', 10)
        const clientPasswordHash = await bcrypt.hash('client123', 10)

        // Create users
        await seedPrisma.user.create({
          data: {
            username: 'admin',
            password: adminPasswordHash,
            fullName: 'ผู้ดูแลระบบ',
            role: 'ADMIN'
          }
        })

        await seedPrisma.user.create({
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

        await seedPrisma.user.create({
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
        results.push('✅ Database seeded successfully')
        seedCompleted = true

      } catch (seedError: any) {
        console.error('❌ Seed failed:', seedError.message)
        results.push(`❌ Seed failed: ${seedError.message}`)
        
        return NextResponse.json(
          {
            error: 'Database setup failed at seeding',
            message: seedError.message,
            results,
            code: 'SEED_FAILED',
            schemaCreated
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      results,
      schemaCreated,
      seedCompleted,
      users: {
        admin: { username: 'admin', password: 'admin123' },
        technician: { username: 'tech1', password: 'password123' },
        client: { username: 'client1', password: 'client123' }
      }
    })

  } catch (error: any) {
    console.error('❌ Setup error:', error)
    return NextResponse.json(
      {
        error: 'Database setup failed',
        message: error.message,
        code: error.code || 'SETUP_ERROR'
      },
      { status: 500 }
    )
  }
}

// สำหรับ GET request - แสดง info
export async function GET() {
  return NextResponse.json({
    message: 'Database Setup API',
    usage: {
      method: 'POST',
      endpoint: '/api/setup',
      description: 'Creates database schema and seeds initial data',
      production: process.env.SEED_SECRET ? 'Requires Authorization header: Bearer <SEED_SECRET>' : 'No auth required',
      development: 'No auth required'
    },
    whatItDoes: [
      '1. Generate Prisma Client',
      '2. Create database schema (db push)',
      '3. Seed initial data (users, clients, sites, assets, etc.)'
    ],
    defaultAccounts: {
      admin: { username: 'admin', password: 'admin123' },
      technician: { username: 'tech1', password: 'password123' },
      client: { username: 'client1', password: 'client123' }
    }
  })
}

