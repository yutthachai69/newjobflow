'use server'

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import bcrypt from 'bcryptjs'
import { 
  checkRateLimit, 
  recordFailedLogin, 
  clearFailedLogin, 
  logSecurityEvent,
} from "@/lib/security"
import { handleServerActionError } from "@/lib/error-handler"
import { getCurrentUser } from "@/lib/auth"

export async function login(formData: FormData) {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
      redirect('/login?error=missing')
    }

    // Rate limiting: Check both IP and username
    // Note: In server actions, we need to get IP from headers
    // For now, we'll use username as identifier (can be enhanced with request headers)
    const rateLimitResult = checkRateLimit(username)

    if (!rateLimitResult.allowed) {
      logSecurityEvent('LOGIN_RATE_LIMIT_EXCEEDED', {
        username,
        lockoutUntil: rateLimitResult.lockoutUntil,
      })
      redirect(`/login?error=rate_limit&retryAfter=${rateLimitResult.lockoutUntil ? Math.ceil((rateLimitResult.lockoutUntil.getTime() - Date.now()) / 1000) : 900}`)
    }

    // ค้นหา User - เพิ่ม error handling สำหรับ database errors
    let user
    try {
      user = await prisma.user.findUnique({
        where: { username },
      })
    } catch (dbError: any) {
      console.error('Database error during login:', dbError)
      // ถ้า database ยังไม่มี table หรือ connection error
      redirect('/login?error=database')
    }

    if (!user) {
      recordFailedLogin(username)
      redirect('/login?error=invalid')
    }

    // Auto-unlock expired accounts before checking
    const { autoUnlockExpiredAccounts } = await import('@/lib/account-lock')
    await autoUnlockExpiredAccounts()

    // Refresh user data after auto-unlock
    const refreshedUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!refreshedUser) {
      redirect('/login?error=invalid')
    }

    // Check if account is locked
    const now = new Date()
    const isLocked = refreshedUser.locked || (refreshedUser.lockedUntil && refreshedUser.lockedUntil > now)

    if (isLocked) {
      const lockoutMessage = refreshedUser.lockedUntil && refreshedUser.lockedUntil > now
        ? `บัญชีถูกล็อกจนถึง ${refreshedUser.lockedUntil.toLocaleString('th-TH')}`
        : 'บัญชีถูกล็อก กรุณาติดต่อ Admin'

      logSecurityEvent('LOGIN_ATTEMPT_LOCKED_ACCOUNT', {
        username: refreshedUser.username,
        userId: refreshedUser.id,
        lockedReason: refreshedUser.lockedReason,
        lockedUntil: refreshedUser.lockedUntil?.toISOString(),
      })

      redirect(`/login?error=locked&message=${encodeURIComponent(lockoutMessage)}`)
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, refreshedUser.password)
    if (!isValidPassword) {
      recordFailedLogin(username)

      // Check if we should lock the account after failed attempts
      const rateLimitResult = checkRateLimit(username)
      if (!rateLimitResult.allowed && rateLimitResult.lockoutUntil) {
        // Lock the account
        await prisma.user.update({
          where: { id: refreshedUser.id },
          data: {
            locked: true,
            lockedUntil: rateLimitResult.lockoutUntil,
            lockedReason: 'Too many failed login attempts',
          },
        })

        logSecurityEvent('ACCOUNT_AUTO_LOCKED', {
          userId: refreshedUser.id,
          username: refreshedUser.username,
          lockoutUntil: rateLimitResult.lockoutUntil.toISOString(),
        })
      }

      redirect('/login?error=invalid')
    }

    // Successful login: Clear failed attempts
    clearFailedLogin(username)

    // ตั้ง Session
    const { setSession } = await import('@/lib/auth')
    await setSession(refreshedUser.id)

    logSecurityEvent('LOGIN_SUCCESS', {
      userId: refreshedUser.id,
      username: refreshedUser.username,
      role: refreshedUser.role,
    })

    // Redirect ตาม Role
    const role = String(refreshedUser.role)
    if (role === 'ADMIN') {
      redirect('/')
    } else if (role === 'TECHNICIAN') {
      redirect('/technician')
    } else if (role === 'CLIENT') {
      redirect('/')
    }

    redirect('/')
  } catch (error) {
    await handleServerActionError(error, await getCurrentUser().catch(() => null))
    throw error
  }
}

export async function logout() {
  try {
    const { clearSession } = await import('@/lib/auth')
    await clearSession()
    redirect('/login')
  } catch (error) {
    await handleServerActionError(error, await getCurrentUser().catch(() => null))
    throw error
  }
}
