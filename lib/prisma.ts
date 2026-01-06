import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ใน development mode ให้ clear cache ถ้า instance เก่าไม่มี contactMessage หรือ securityIncident
if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
  try {
    // Test ว่า instance เก่ามี contactMessage และ securityIncident หรือไม่
    if (!('contactMessage' in globalForPrisma.prisma) || !('securityIncident' in globalForPrisma.prisma)) {
      // Clear cache เพื่อให้สร้าง instance ใหม่
      globalForPrisma.prisma = undefined
    }
  } catch (e) {
    // ถ้า error ให้ clear cache
    globalForPrisma.prisma = undefined
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // ปรับ logging ให้เหมาะสม:
    // - Development: แสดง errors และ warnings เท่านั้น (ไม่แสดง query เพราะมันเยอะเกินไป)
    // - Production: แสดงเฉพาะ errors
    log: process.env.NODE_ENV === 'production' 
      ? ['error'] 
      : ['error', 'warn'],
    // ถ้าต้องการดู query logs ใน development สามารถเปิดได้โดย:
    // log: process.env.NODE_ENV === 'production' 
    //   ? ['error'] 
    //   : ['error', 'warn', 'query'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}