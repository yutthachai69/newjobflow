import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { handleApiError } from '@/lib/error-handler'
import { createLogContext } from '@/lib/logger'
import { logger } from '@/lib/logger'
import { resolveSecurityIncident } from '@/lib/security-incident'

/**
 * Resolve Security Incident Endpoint
 * POST /api/security/incident
 * Only accessible by ADMIN
 */
export async function POST(request: NextRequest) {
  try {
    // Authorization check
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { action, incidentId } = body

    // Validate action
    if (action !== 'resolve') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Validate incidentId
    if (!incidentId) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 })
    }

    // Resolve the incident
    await resolveSecurityIncident(incidentId, user.id)

    logger.security('Security incident resolved', {
      incidentId,
      resolvedBy: user.id,
      username: user.username,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Incident resolved successfully' 
    })
  } catch (error) {
    const currentUser = await getCurrentUser().catch(() => null)
    const context = await createLogContext(request, currentUser)
    const errorResponse = await handleApiError(error, request, currentUser)
    
    logger.error('Failed to resolve security incident', context, error as Error)
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
}


