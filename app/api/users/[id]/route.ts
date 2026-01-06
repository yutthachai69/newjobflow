import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logSecurityEvent } from '@/lib/security'
import { handleApiError } from '@/lib/error-handler'
import { createLogContext } from '@/lib/logger'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { sanitizeString, validateUsername, validatePassword } from '@/lib/validation'

/**
 * GET /api/users/[id]
 * Get user by ID (ADMIN only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        siteId: true,
        site: {
          include: {
            client: true,
          },
        },
        locked: true,
        lockedUntil: true,
        lockedReason: true,
        createdAt: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(targetUser)
  } catch (error) {
    const currentUser = await getCurrentUser().catch(() => null)
    const context = await createLogContext(request, currentUser)
    const errorResponse = await handleApiError(error, request, currentUser)
    
    logger.error('Failed to get user', context, error as Error)
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
}

/**
 * PUT /api/users/[id]
 * Update user (ADMIN only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const username = sanitizeString(body.username)
    const password = body.password
    const fullName = sanitizeString(body.fullName)
    const role = body.role as 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
    const siteId = sanitizeString(body.siteId)

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Validation
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return NextResponse.json({ error: usernameValidation.error || 'Invalid username' }, { status: 400 })
    }

    // Password is optional when updating (only validate if provided)
    if (password && password.length > 0) {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        return NextResponse.json({ error: passwordValidation.error || 'Invalid password' }, { status: 400 })
      }
    }

    if (!role || !['ADMIN', 'TECHNICIAN', 'CLIENT'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if username already exists (excluding current user)
    const duplicateUser = await prisma.user.findUnique({
      where: { username },
    })

    if (duplicateUser && duplicateUser.id !== id) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // สำหรับ CLIENT role ต้องมี siteId
    if (role === 'CLIENT' && !siteId) {
      return NextResponse.json({ error: 'Site ID is required for CLIENT role' }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      username,
      fullName: fullName || null,
      role,
      siteId: role === 'CLIENT' ? siteId : null,
    }

    // Only update password if provided
    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    await prisma.user.update({
      where: { id },
      data: updateData,
    })

    logSecurityEvent('USER_UPDATED', {
      updatedBy: user.id,
      updatedUserId: id,
      updatedUsername: username,
      timestamp: new Date().toISOString(),
    })

    revalidatePath('/users')
    return NextResponse.json({ success: true, message: 'User updated successfully' })
  } catch (error) {
    const currentUser = await getCurrentUser().catch(() => null)
    const context = await createLogContext(request, currentUser)
    const errorResponse = await handleApiError(error, request, currentUser)
    
    logger.error('Failed to update user', context, error as Error)
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user endpoint (ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authorization check
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      redirect('/users?error=unauthorized')
    }

    const { id } = await params

    // Prevent self-deletion
    if (user.id === id) {
      redirect('/users?error=cannot_delete_self')
    }

    // Find user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      include: {
        jobItems: true,
      },
    })

    if (!userToDelete) {
      redirect('/users?error=not_found')
    }

    // Check if user has job items (prevent deletion if has active work)
    if (userToDelete.jobItems.length > 0) {
      redirect('/users?error=has_job_items')
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    // Log security event
    logSecurityEvent('USER_DELETED', {
      deletedBy: user.id,
      deletedUserId: id,
      deletedUsername: userToDelete.username,
      timestamp: new Date().toISOString(),
    })

    revalidatePath('/users')
    redirect('/users?success=deleted')
  } catch (error) {
    const user = await getCurrentUser().catch(() => null)
    const context = createLogContext(request, user)
    const errorResponse = handleApiError(error, request, user)
    
    logger.error('Failed to delete user', context, error as Error)
    redirect('/users?error=server_error')
  }
}

