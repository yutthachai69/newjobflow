import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { lockAccount, unlockAccount } from '@/lib/account-lock'
import { handleApiError } from '@/lib/error-handler'
import { createLogContext } from '@/lib/logger'
import { logger } from '@/lib/logger'

/**
 * PUT /api/security/accounts/[id]
 * Lock or unlock user account (ADMIN only)
 * Body: { action: 'lock' | 'unlock', reason?: string, durationMinutes?: number }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authorization check
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, reason, durationMinutes } = body

    if (!action || !['lock', 'unlock'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "lock" or "unlock"' }, { status: 400 })
    }

    // Find user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent locking yourself
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot lock your own account' }, { status: 400 })
    }

    // Prevent locking other admins (optional - can be removed if needed)
    if (targetUser.role === 'ADMIN' && user.id !== id) {
      return NextResponse.json({ error: 'Cannot lock another admin account' }, { status: 403 })
    }

    // Handle lock/unlock action
    if (action === 'unlock') {
      await unlockAccount({
        userId: id,
        unlockedBy: user.id,
      })

      return NextResponse.json({ 
        success: true, 
        message: `Account ${targetUser.username} has been unlocked`,
      })
    } else {
      // Lock account
      await lockAccount({
        userId: id,
        reason: reason || 'Security incident',
        durationMinutes: durationMinutes || 15,
        lockedBy: user.id,
      })

      return NextResponse.json({ 
        success: true, 
        message: `Account ${targetUser.username} has been locked`,
      })
    }
  } catch (error) {
    const currentUser = await getCurrentUser().catch(() => null)
    const context = await createLogContext(request, currentUser)
    const errorResponse = await handleApiError(error, request, currentUser)
    
    logger.error('Failed to lock/unlock account', context, error as Error)
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
}


