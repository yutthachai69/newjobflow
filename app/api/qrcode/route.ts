import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { sanitizeString } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const text = sanitizeString(searchParams.get('text'))

  if (!text) {
    return new NextResponse('Invalid request', { status: 400 })
  }

  // Limit text length to prevent DoS
  if (text.length > 1000) {
    return new NextResponse('Text too long', { status: 400 })
  }

  try {
    // Generate QR Code as Data URL (base64)
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    // Convert Data URL to Buffer
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Return as PNG image
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

