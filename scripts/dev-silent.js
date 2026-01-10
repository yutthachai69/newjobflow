/**
 * Silent Dev Mode - วิธีที่เงียบที่สุดเท่าที่ทำได้
 * ใช้ redirect output เพื่อปิด logs ทั้งหมด
 * 
 * ⚠️ หมายเหตุ: จะไม่เห็น errors ด้วย (ไม่แนะนำ)
 * 
 * วิธีใช้งาน:
 *   node scripts/dev-silent.js
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// สร้าง log file สำหรับเก็บ errors (ถ้าต้องการดูภายหลัง)
const logDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const errorLogPath = path.join(logDir, `dev-errors-${Date.now()}.log`)
const errorLogStream = fs.createWriteStream(errorLogPath, { flags: 'a' })

console.log('🚀 Starting Next.js in SILENT mode...')
console.log(`📝 Errors will be logged to: ${errorLogPath}\n`)

// ใช้ 'ignore' สำหรับ stdout เพื่อปิด request logs ทั้งหมด
const nextDev = spawn('npx', ['next', 'dev'], {
  cwd: process.cwd(),
  stdio: ['inherit', 'ignore', 'pipe'], // stdin=inherit, stdout=ignore (ปิด logs), stderr=pipe (เก็บ errors)
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    NODE_ENV: 'development',
  },
})

// เก็บ errors ไว้ในไฟล์
nextDev.stderr.on('data', (data) => {
  const output = data.toString()
  
  // เขียน errors ลงไฟล์ (ถ้าต้องการดูภายหลัง)
  errorLogStream.write(output)
  
  // แสดงเฉพาะ errors จริงๆ ใน console (optional)
  const lines = output.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && (
      trimmed.includes('Error:') || 
      trimmed.includes('ERROR') || 
      trimmed.includes('✗') ||
      /^Error/i.test(trimmed)
    )) {
      console.error(trimmed)
    }
  }
})

nextDev.on('close', (code) => {
  errorLogStream.end()
  if (code !== 0 && code !== null) {
    console.error(`\n❌ Next.js exited with code ${code}`)
    console.error(`📝 Check error log: ${errorLogPath}`)
  }
  process.exit(code || 0)
})

nextDev.on('error', (error) => {
  console.error('❌ Error starting Next.js:', error.message)
  errorLogStream.end()
  process.exit(1)
})

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping Next.js...')
  errorLogStream.end()
  nextDev.kill('SIGINT')
  setTimeout(() => {
    nextDev.kill('SIGTERM')
    process.exit(0)
  }, 2000)
})

process.on('SIGTERM', () => {
  errorLogStream.end()
  nextDev.kill('SIGTERM')
  process.exit(0)
})

