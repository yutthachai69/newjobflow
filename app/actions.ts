'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createMockMaintenance(assetId: string) {
  // 1. สร้างใบงาน
  const wo = await prisma.workOrder.create({
    data: {
      jobType: 'PM',
      scheduledDate: new Date(),
      status: 'COMPLETED',
      siteId: (await prisma.asset.findUnique({ where: { id: assetId }, include: { room: { include: { floor: { include: { building: true } } } } } }))?.room.floor.building.siteId!,
    }
  })

  // 2. สร้างรายการซ่อม (เก็บใส่ตัวแปร job)
  const job = await prisma.jobItem.create({
    data: {
      workOrderId: wo.id,
      assetId: assetId,
      status: 'DONE',
      startTime: new Date(),
      endTime: new Date(),
      techNote: 'ล้างทำความสะอาดแผ่นกรอง คอยล์เย็น และเช็คกระแสไฟเรียบร้อย (Demo with Photos)',
      technicianId: (await prisma.user.findFirst())?.id,
    }
  })

  // 3. (เพิ่มใหม่) สร้างรูปภาพจำลอง Before / After
  await prisma.jobPhoto.createMany({
    data: [
        {
            jobItemId: job.id,
            type: 'BEFORE',
            url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80', // รูปแอร์สกปรก (สมมติ)
        },
        {
            jobItemId: job.id,
            type: 'AFTER',
            url: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=400&q=80', // รูปแอร์สะอาด (สมมติ)
        }
    ]
  })

  // 4. รีเฟรชหน้า
  revalidatePath(`/assets/${assetId}`)
}

export async function createWorkOrder(formData: FormData) {
  const siteId = formData.get('siteId') as string
  const jobType = formData.get('jobType') as 'PM' | 'CM' | 'INSTALL'
  const scheduledDate = new Date(formData.get('scheduledDate') as string)
  const assignedTeam = formData.get('assignedTeam') as string | null
  const assetIds = formData.getAll('assetIds') as string[]

  // สร้าง Work Order
  const workOrder = await prisma.workOrder.create({
    data: {
      siteId,
      jobType,
      scheduledDate,
      assignedTeam: assignedTeam || null,
      status: 'OPEN',
    },
  })

  // สร้าง Job Items สำหรับแต่ละ Asset
  await prisma.jobItem.createMany({
    data: assetIds.map((assetId) => ({
      workOrderId: workOrder.id,
      assetId,
      status: 'PENDING',
    })),
  })

  revalidatePath('/work-orders')
  redirect(`/work-orders/${workOrder.id}`)
}

export async function updateWorkOrderStatus(workOrderId: string, status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status },
  })

  revalidatePath(`/work-orders/${workOrderId}`)
  revalidatePath('/work-orders')
  revalidatePath('/')
}

export async function updateJobItemStatus(jobItemId: string, status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ISSUE_FOUND') {
  const jobItem = await prisma.jobItem.findUnique({
    where: { id: jobItemId },
    include: { workOrder: true },
  })

  if (!jobItem) {
    throw new Error('Job item not found')
  }

  const updateData: any = { status }
  
  if (status === 'IN_PROGRESS' && !jobItem.startTime) {
    updateData.startTime = new Date()
  }
  
  if (status === 'DONE' && !jobItem.endTime) {
    updateData.endTime = new Date()
  }

  await prisma.jobItem.update({
    where: { id: jobItemId },
    data: updateData,
  })

  revalidatePath(`/technician/job-item/${jobItemId}`)
  revalidatePath(`/technician/work-order/${jobItem.workOrderId}`)
  revalidatePath(`/work-orders/${jobItem.workOrderId}`)
}

export async function updateJobItemNote(jobItemId: string, formData: FormData) {
  const techNote = formData.get('techNote') as string

  const jobItem = await prisma.jobItem.findUnique({
    where: { id: jobItemId },
  })

  if (!jobItem) {
    throw new Error('Job item not found')
  }

  await prisma.jobItem.update({
    where: { id: jobItemId },
    data: { techNote },
  })

  revalidatePath(`/technician/job-item/${jobItemId}`)
}

export async function createClient(formData: FormData) {
  const name = formData.get('name') as string
  const contactInfo = formData.get('contactInfo') as string | null

  await prisma.client.create({
    data: {
      name,
      contactInfo: contactInfo || null,
    },
  })

  revalidatePath('/locations')
  redirect('/locations')
}

export async function createSite(formData: FormData) {
  const clientId = formData.get('clientId') as string
  const name = formData.get('name') as string
  const address = formData.get('address') as string | null

  await prisma.site.create({
    data: {
      clientId,
      name,
      address: address || null,
    },
  })

  revalidatePath('/locations')
  redirect('/locations')
}

export async function createBuilding(formData: FormData) {
  const siteId = formData.get('siteId') as string
  const name = formData.get('name') as string

  await prisma.building.create({
    data: {
      siteId,
      name,
    },
  })

  revalidatePath('/locations')
  redirect('/locations')
}

export async function createFloor(formData: FormData) {
  const buildingId = formData.get('buildingId') as string
  const name = formData.get('name') as string

  await prisma.floor.create({
    data: {
      buildingId,
      name,
    },
  })

  revalidatePath('/locations')
  redirect('/locations')
}

export async function createRoom(formData: FormData) {
  const floorId = formData.get('floorId') as string
  const name = formData.get('name') as string

  await prisma.room.create({
    data: {
      floorId,
      name,
    },
  })

  revalidatePath('/locations')
  redirect('/locations')
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    redirect('/login?error=missing')
  }

  // ค้นหา User
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user || user.password !== password) {
    redirect('/login?error=invalid')
  }

  // ตั้ง Session
  const { setSession } = await import('@/lib/auth')
  await setSession(user.id)

  // Redirect ตาม Role
  const role = String(user.role)
  if (role === 'ADMIN') {
    redirect('/')
  } else if (role === 'TECHNICIAN') {
    redirect('/technician')
  } else if (role === 'CLIENT') {
    redirect('/')
  }

  redirect('/')
}

export async function logout() {
  const { clearSession } = await import('@/lib/auth')
  await clearSession()
  redirect('/welcome')
}