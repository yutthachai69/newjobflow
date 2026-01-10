import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/error-handler'
import { createLogContext } from '@/lib/logger'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import { sanitizeString, validateUsername, validatePassword } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

/**
 * POST /api/users
 * Create new user (ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    const username = sanitizeString(body.username)
    const password = body.password
    const fullName = sanitizeString(body.fullName)
    const role = body.role as 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
    const siteId = sanitizeString(body.siteId)

    // Validation
    const usernameValidation = validateUsername(username || '')
    if (!usernameValidation.valid) {
      return NextResponse.json({ error: usernameValidation.error || 'Invalid username' }, { status: 400 })
    }

    const passwordValidation = validatePassword(password || '')
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error || 'Invalid password' }, { status: 400 })
    }

    if (!role || !['ADMIN', 'TECHNICIAN', 'CLIENT'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username! },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // สำหรับ CLIENT role ต้องมี siteId
    if (role === 'CLIENT' && !siteId) {
      return NextResponse.json({ error: 'Site ID is required for CLIENT role' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: username!,
        password: hashedPassword,
        fullName: fullName || null,
        role,
        siteId: role === 'CLIENT' ? siteId : null,
      },
    })

    revalidatePath('/users')
    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    }, { status: 201 })
  } catch (error) {
    const currentUser = await getCurrentUser().catch(() => null)
    const context = await createLogContext(request, currentUser)
    const errorResponse = await handleApiError(error, request, currentUser)
    
    logger.error('Failed to create user', context, error as Error)
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
}


