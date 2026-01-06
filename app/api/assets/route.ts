import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/error-handler'
import { createLogContext } from '@/lib/logger'
import { logger } from '@/lib/logger'
import { sanitizeString } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

/**
 * POST /api/assets
 * Create new asset (ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    const roomId = sanitizeString(body.roomId)
    const serialNo = sanitizeString(body.serialNo)
    const brand = sanitizeString(body.brand)
    const model = sanitizeString(body.model)
    const btuStr = body.btu
    const installDateStr = body.installDate

    // Validation
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }
    if (!serialNo) {
      return NextResponse.json({ error: 'Serial Number is required' }, { status: 400 })
    }

    // Check if QR Code (serialNo) already exists
    const existingAsset = await prisma.asset.findUnique({
      where: { qrCode: serialNo },
    })
    if (existingAsset) {
      return NextResponse.json({ error: 'QR Code already exists' }, { status: 400 })
    }

    const btu = btuStr ? parseInt(btuStr, 10) : null
    if (btuStr && (isNaN(btu!) || btu! < 0 || btu! > 1000000)) {
      return NextResponse.json({ error: 'Invalid BTU value' }, { status: 400 })
    }

    const installDate = installDateStr ? new Date(installDateStr) : null
    if (installDateStr && (!installDate || isNaN(installDate.getTime()))) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const newAsset = await prisma.asset.create({
      data: {
        roomId,
        qrCode: serialNo, // ใช้ Serial Number เป็น QR Code
        brand: brand || null,
        model: model || null,
        serialNo: serialNo || null,
        btu: btu || null,
        installDate: installDate || null,
        status: 'ACTIVE',
      },
    })

    revalidatePath('/assets')
    return NextResponse.json({ 
      success: true, 
      message: 'Asset created successfully',
      asset: {
        id: newAsset.id,
        qrCode: newAsset.qrCode,
        brand: newAsset.brand,
        model: newAsset.model,
      },
    }, { status: 201 })
  } catch (error) {
    const currentUser = await getCurrentUser().catch(() => null)
    const context = await createLogContext(request, currentUser)
    const errorResponse = await handleApiError(error, request, currentUser)
    
    logger.error('Failed to create asset', context, error as Error)
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
}

