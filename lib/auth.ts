import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        site: {
          include: {
            client: true,
          },
        },
      },
    })
    return user
  } catch (error) {
    return null
  }
}

export async function setSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set('user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
}

