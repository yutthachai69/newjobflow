'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from 'bcryptjs'
import { getCurrentUser } from "@/lib/auth"
import { sanitizeString, validateUsername, validatePassword } from "@/lib/validation"
import { 
  checkRateLimit, 
  recordFailedLogin, 
  clearFailedLogins, 
  logSecurityEvent, 
  isPasswordCompromised 
} from "@/lib/security"

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
  // Authorization: Only ADMIN can create work orders
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const siteId = sanitizeString(formData.get('siteId') as string)
  const jobType = formData.get('jobType') as 'PM' | 'CM' | 'INSTALL'
  const scheduledDateStr = formData.get('scheduledDate') as string
  const assignedTeam = sanitizeString(formData.get('assignedTeam') as string)
  const assetIds = formData.getAll('assetIds') as string[]

  // Validation
  if (!siteId) {
    throw new Error('Site ID is required')
  }
  if (!jobType || !['PM', 'CM', 'INSTALL'].includes(jobType)) {
    throw new Error('Invalid job type')
  }
  if (!scheduledDateStr) {
    throw new Error('Scheduled date is required')
  }
  if (assetIds.length === 0) {
    throw new Error('At least one asset is required')
  }

  const scheduledDate = new Date(scheduledDateStr)
  if (isNaN(scheduledDate.getTime())) {
    throw new Error('Invalid date format')
  }

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
  // Authorization: Only TECHNICIAN or ADMIN can update job item status
  const user = await getCurrentUser()
  if (!user || (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN')) {
    logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', { 
      userId: user?.id, 
      username: user?.username, 
      action: `UPDATE_JOB_ITEM_STATUS:${jobItemId}` 
    })
    throw new Error('Unauthorized')
  }

  const jobItem = await prisma.jobItem.findUnique({
    where: { id: jobItemId },
    include: { 
      workOrder: true,
      photos: true,
    },
  })

  if (!jobItem) {
    throw new Error('Job item not found')
  }

  // Authorization: TECHNICIAN can update their own job items or unassigned job items (unless ADMIN)
  if (user.role === 'TECHNICIAN') {
    // Allow if job item is unassigned (null) or assigned to this technician
    if (jobItem.technicianId !== null && jobItem.technicianId !== user.id) {
      throw new Error('Unauthorized')
    }
  }

  // Validation: Must have BEFORE and AFTER photos before completing (unless ADMIN)
  if (status === 'DONE' && user.role === 'TECHNICIAN') {
    const hasBefore = jobItem.photos.some(photo => photo.type === 'BEFORE')
    const hasAfter = jobItem.photos.some(photo => photo.type === 'AFTER')
    
    if (!hasBefore || !hasAfter) {
      throw new Error('กรุณาอัปโหลดรูปภาพก่อนทำ (BEFORE) และหลังทำ (AFTER) ก่อนเสร็จสิ้นงาน')
    }
  }

  const updateData: any = { status }
  
  if (status === 'IN_PROGRESS' && !jobItem.startTime) {
    updateData.startTime = new Date()
    // Auto-assign technician if not assigned
    if (!jobItem.technicianId && user.role === 'TECHNICIAN') {
      updateData.technicianId = user.id
    }
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

export async function createJobPhoto(jobItemId: string, formData: FormData) {
  // Authorization: Only TECHNICIAN or ADMIN can upload photos
  const user = await getCurrentUser()
  if (!user || (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN')) {
    logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', { 
      userId: user?.id, 
      username: user?.username, 
      action: `CREATE_JOB_PHOTO:${jobItemId}` 
    })
    throw new Error('Unauthorized')
  }

  const jobItem = await prisma.jobItem.findUnique({
    where: { id: jobItemId },
  })

  if (!jobItem) {
    throw new Error('Job item not found')
  }

  // Cannot upload photos if job item is already DONE (unless ADMIN)
  if (jobItem.status === 'DONE' && user.role !== 'ADMIN') {
    throw new Error('ไม่สามารถเพิ่มรูปภาพได้ เนื่องจากงานเสร็จสิ้นแล้ว')
  }

  // Authorization: TECHNICIAN can only upload photos to their own job items (unless ADMIN)
  if (user.role === 'TECHNICIAN') {
    if (jobItem.technicianId !== null && jobItem.technicianId !== user.id) {
      throw new Error('Unauthorized')
    }
  }

  const photoType = formData.get('photoType') as 'BEFORE' | 'AFTER' | 'DEFECT' | 'METER'
  const imageData = formData.get('imageData') as string // Base64 encoded image

  if (!photoType || !['BEFORE', 'AFTER', 'DEFECT', 'METER'].includes(photoType)) {
    throw new Error('Invalid photo type')
  }

  if (!imageData || !imageData.startsWith('data:image/')) {
    throw new Error('Invalid image data')
  }

  // Store image as base64 data URL (in production, upload to cloud storage like S3, Cloudinary, etc.)
  const photoUrl = imageData

  await prisma.jobPhoto.create({
    data: {
      jobItemId,
      type: photoType,
      url: photoUrl,
    },
  })

  logSecurityEvent('JOB_PHOTO_UPLOADED', {
    uploadedBy: user.id,
    jobItemId,
    photoType,
    timestamp: new Date().toISOString(),
  })

  revalidatePath(`/technician/job-item/${jobItemId}`)
  revalidatePath(`/technician/work-order/${jobItem.workOrderId}`)
  revalidatePath(`/work-orders/${jobItem.workOrderId}`)
}

export async function updateJobItemNote(jobItemId: string, formData: FormData) {
  // Authorization: Only TECHNICIAN or ADMIN can update job item note
  const user = await getCurrentUser()
  if (!user || (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN')) {
    logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', { 
      userId: user?.id, 
      username: user?.username, 
      action: `UPDATE_JOB_ITEM_NOTE:${jobItemId}` 
    })
    throw new Error('Unauthorized')
  }

  const techNote = sanitizeString(formData.get('techNote') as string)

  const jobItem = await prisma.jobItem.findUnique({
    where: { id: jobItemId },
  })

  if (!jobItem) {
    throw new Error('Job item not found')
  }

  // Cannot update note if job item is already DONE (unless ADMIN)
  if (jobItem.status === 'DONE' && user.role !== 'ADMIN') {
    throw new Error('ไม่สามารถแก้ไขบันทึกได้ เนื่องจากงานเสร็จสิ้นแล้ว')
  }

  // Authorization: TECHNICIAN can update their own job items or unassigned job items (unless ADMIN)
  if (user.role === 'TECHNICIAN') {
    // Allow if job item is unassigned (null) or assigned to this technician
    if (jobItem.technicianId !== null && jobItem.technicianId !== user.id) {
      throw new Error('Unauthorized')
    }
    // Auto-assign technician if not assigned
    if (jobItem.technicianId === null) {
      await prisma.jobItem.update({
        where: { id: jobItemId },
        data: { technicianId: user.id },
      })
    }
  }

  await prisma.jobItem.update({
    where: { id: jobItemId },
    data: { techNote },
  })

  revalidatePath(`/technician/job-item/${jobItemId}`)
}

export async function createClient(formData: FormData) {
  // Authorization: Only ADMIN can create clients
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const name = sanitizeString(formData.get('name') as string)
  const contactInfo = sanitizeString(formData.get('contactInfo') as string)

  if (!name) {
    throw new Error('Client name is required')
  }

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
  // Authorization: Only ADMIN can create sites
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const clientId = sanitizeString(formData.get('clientId') as string)
  const name = sanitizeString(formData.get('name') as string)
  const address = sanitizeString(formData.get('address') as string)

  if (!clientId) {
    throw new Error('Client ID is required')
  }
  if (!name) {
    throw new Error('Site name is required')
  }

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
  // Authorization: Only ADMIN can create buildings
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const siteId = sanitizeString(formData.get('siteId') as string)
  const name = sanitizeString(formData.get('name') as string)

  if (!siteId) {
    throw new Error('Site ID is required')
  }
  if (!name) {
    throw new Error('Building name is required')
  }

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
  // Authorization: Only ADMIN can create floors
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const buildingId = sanitizeString(formData.get('buildingId') as string)
  const name = sanitizeString(formData.get('name') as string)

  if (!buildingId) {
    throw new Error('Building ID is required')
  }
  if (!name) {
    throw new Error('Floor name is required')
  }

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
  // Authorization: Only ADMIN can create rooms
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const floorId = sanitizeString(formData.get('floorId') as string)
  const name = sanitizeString(formData.get('name') as string)

  if (!floorId) {
    throw new Error('Floor ID is required')
  }
  if (!name) {
    throw new Error('Room name is required')
  }

  await prisma.room.create({
    data: {
      floorId,
      name,
    },
  })

  revalidatePath('/locations')
  redirect('/locations')
}

export async function createAsset(formData: FormData) {
  // Authorization: Only ADMIN can create assets
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const roomId = sanitizeString(formData.get('roomId') as string)
  const serialNo = sanitizeString(formData.get('serialNo') as string)
  const brand = sanitizeString(formData.get('brand') as string)
  const model = sanitizeString(formData.get('model') as string)
  const btuStr = formData.get('btu') as string
  const installDateStr = formData.get('installDate') as string

  // Validation
  if (!roomId) {
    throw new Error('Room ID is required')
  }
  if (!serialNo) {
    throw new Error('Serial Number is required')
  }

  // Check if QR Code (serialNo) already exists
  const existingAsset = await prisma.asset.findUnique({
    where: { qrCode: serialNo },
  })
  if (existingAsset) {
    throw new Error('QR Code already exists')
  }

  const btu = btuStr ? parseInt(btuStr, 10) : null
  if (btuStr && (isNaN(btu!) || btu! < 0 || btu! > 1000000)) {
    throw new Error('Invalid BTU value')
  }

  const installDate = installDateStr ? new Date(installDateStr) : null
  if (installDateStr && (!installDate || isNaN(installDate.getTime()))) {
    throw new Error('Invalid date format')
  }

  await prisma.asset.create({
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
  redirect('/assets')
}

export async function createUser(formData: FormData) {
  // Authorization: Only ADMIN can create users
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const username = sanitizeString(formData.get('username') as string)
  const password = formData.get('password') as string
  const fullName = sanitizeString(formData.get('fullName') as string)
  const role = formData.get('role') as 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
  const siteId = sanitizeString(formData.get('siteId') as string)

  // Validation
  const usernameValidation = validateUsername(username || '')
  if (!usernameValidation.valid) {
    throw new Error(usernameValidation.error || 'Invalid username')
  }

  const passwordValidation = validatePassword(password || '')
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error || 'Invalid password')
  }

  if (!role || !['ADMIN', 'TECHNICIAN', 'CLIENT'].includes(role)) {
    throw new Error('Invalid role')
  }

  // Check if username already exists
  const existingUser = await prisma.user.findUnique({
    where: { username: username! },
  })

  if (existingUser) {
    throw new Error('Username already exists')
  }

  // สำหรับ CLIENT role ต้องมี siteId
  if (role === 'CLIENT' && !siteId) {
    throw new Error('Site ID is required for CLIENT role')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  await prisma.user.create({
    data: {
      username: username!,
      password: hashedPassword,
      fullName: fullName || null,
      role,
      siteId: role === 'CLIENT' ? siteId : null,
    },
  })

  revalidatePath('/users')
  redirect('/users')
}

export async function updateUser(formData: FormData) {
  // Authorization: Only ADMIN can update users
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const userId = sanitizeString(formData.get('userId') as string)
  const username = sanitizeString(formData.get('username') as string)
  const password = formData.get('password') as string
  const fullName = sanitizeString(formData.get('fullName') as string)
  const role = formData.get('role') as 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
  const siteId = sanitizeString(formData.get('siteId') as string)

  if (!userId) {
    throw new Error('User ID is required')
  }

  // Validation
  const usernameValidation = validateUsername(username || '')
  if (!usernameValidation.valid) {
    throw new Error(usernameValidation.error || 'Invalid username')
  }

  // Password is optional when updating (only validate if provided)
  if (password && password.length > 0) {
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error || 'Invalid password')
    }
  }

  if (!role || !['ADMIN', 'TECHNICIAN', 'CLIENT'].includes(role)) {
    throw new Error('Invalid role')
  }

  // Check if username already exists (excluding current user)
  const existingUser = await prisma.user.findUnique({
    where: { username: username! },
  })

  if (existingUser && existingUser.id !== userId) {
    throw new Error('Username already exists')
  }

  // สำหรับ CLIENT role ต้องมี siteId
  if (role === 'CLIENT' && !siteId) {
    throw new Error('Site ID is required for CLIENT role')
  }

  // Prepare update data
  const updateData: any = {
    username: username!,
    fullName: fullName || null,
    role,
    siteId: role === 'CLIENT' ? siteId : null,
  }

  // Only update password if provided
  if (password && password.length > 0) {
    const hashedPassword = await bcrypt.hash(password, 10)
    updateData.password = hashedPassword
  }

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  })

  logSecurityEvent('USER_UPDATED', {
    updatedBy: user.id,
    updatedUserId: userId,
    updatedUsername: username,
    timestamp: new Date().toISOString(),
  })

  revalidatePath('/users')
  redirect('/users')
}

export async function updateContactInfo(formData: FormData) {
  // Authorization: Only ADMIN can update contact info
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

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

  if (!user) {
    redirect('/login?error=invalid')
  }

  // Verify password with bcrypt
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
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