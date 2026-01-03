import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // ให้มันโชว์ SQL ใน Terminal เวลาเราเรียกใช้ (เอาไว้ Debug)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma