import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeString } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const qrCode = sanitizeString(searchParams.get('qrCode'))

  if (!qrCode) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const asset = await prisma.asset.findUnique({
      where: { qrCode },
      select: {
        id: true,
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ assetId: asset.id })
  } catch (error) {
    console.error('Error finding asset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

