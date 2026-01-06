'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sanitizeString } from "@/lib/validation"
import { requireAdmin, requireAuth } from "@/lib/auth-helpers"
import { logSecurityEvent } from "@/lib/security"
import { checkRateLimit as checkApiRateLimit } from "@/lib/rate-limit"
import { handleServerActionError } from "@/lib/error-handler"
import { getCurrentUser } from "@/lib/auth"

export async function updateContactInfo(formData: FormData) {
  try {
    const user = await requireAdmin()

    const contactInfoId = sanitizeString(formData.get('contactInfoId') as string)
    const email = sanitizeString(formData.get('email') as string)
    const phone = sanitizeString(formData.get('phone') as string)
    const hours = sanitizeString(formData.get('hours') as string)

    if (!contactInfoId) {
      throw new Error('Contact Info ID is required')
    }

    // Validation
    if (!email) {
      throw new Error('Email is required')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format')
    }
    if (!phone) {
      throw new Error('Phone is required')
    }
    if (!hours) {
      throw new Error('Hours is required')
    }

    // Update contact info
    await prisma.contactInfo.update({
      where: { id: contactInfoId },
      data: {
        email,
        phone,
        hours,
      },
    })

    logSecurityEvent('CONTACT_INFO_UPDATED', {
      updatedBy: user.id,
      timestamp: new Date().toISOString(),
    })

    revalidatePath('/contact')
  } catch (error) {
    await handleServerActionError(error, await getCurrentUser().catch(() => null))
    throw error
  }
}

export async function submitContactMessage(formData: FormData) {
  try {
    const user = await requireAuth()

    // Rate limiting for contact form submissions
    const identifier = user.id
    const rateLimitResult = checkApiRateLimit(identifier, 'CONTACT')

    if (!rateLimitResult.allowed) {
      logSecurityEvent('CONTACT_FORM_RATE_LIMIT_EXCEEDED', {
        userId: user.id,
        username: user.username,
      })
      throw new Error(`Too many submissions. Please try again after ${rateLimitResult.retryAfter || 60} seconds.`)
    }

    const phone = sanitizeString(formData.get('phone') as string)
    const message = sanitizeString(formData.get('message') as string)

    if (!phone || !message) {
      throw new Error('Phone and message are required')
    }

    // เก็บข้อความใน database
    await prisma.contactMessage.create({
      data: {
        userId: user.id,
        phone,
        message,
        isRead: false,
      },
    })

    logSecurityEvent('CONTACT_MESSAGE_SUBMITTED', {
      submittedBy: user.id,
      phone,
      timestamp: new Date().toISOString(),
    })

    revalidatePath('/messages')
    revalidatePath('/contact')
  } catch (error) {
    await handleServerActionError(error, await getCurrentUser().catch(() => null))
    throw error
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    await requireAdmin()

    await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
      },
    })

    revalidatePath('/messages')
  } catch (error) {
    await handleServerActionError(error, await getCurrentUser().catch(() => null))
    throw error
  }
}
