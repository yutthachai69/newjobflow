/**
 * Authorization helper functions
 * เพื่อลด code duplication ของ authorization checks
 */

import { getCurrentUser } from "@/lib/auth"

export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CLIENT'

/**
 * ตรวจสอบว่า user เป็น ADMIN หรือไม่
 */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * ตรวจสอบว่า user login แล้วหรือไม่
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * ตรวจสอบว่า user มี role ที่กำหนดหรือไม่
 */
export async function requireRole(roles: UserRole[]) {
  const user = await getCurrentUser()
  if (!user || !roles.includes(user.role)) {
    throw new Error('Unauthorized')
  }
  return user
}
