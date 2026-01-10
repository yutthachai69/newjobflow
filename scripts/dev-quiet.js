/**
 * Custom dev script ที่ filter Next.js request logs ทั้งหมด
 * ใช้งาน: node scripts/dev-quiet.js
 * 
 * วิธีใช้งาน:
 *   npm run dev:quiet
 * 
 * หรือรันโดยตรง:
 *   node scripts/dev-quiet.js
 */

const { spawn } = require('child_process')

// แสดง startup message แค่ครั้งเดียว
console.log('🚀 Starting Next.js in quiet mode (all request logs filtered)...\n')

const nextDev = spawn('npx', ['next', 'dev'], {
  cwd: process.cwd(),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    // ตั้งค่า quiet mode
    QUIET_MODE: 'true',
    // ลองปิด Next.js internal logging
    NEXT_PRIVATE_STANDALONE: 'true',
  },
})

// Buffer สำหรับเก็บ lines ที่ไม่สมบูรณ์
let stdoutBuffer = ''
let stderrBuffer = ''

// Filter stdout (request logs) - กรองทุกอย่างที่เกี่ยวกับ requests
nextDev.stdout.on('data', (data) => {
  const output = data.toString()
  stdoutBuffer += output
  
  // แบ่งเป็น lines โดยคำนึงถึง carriage return
  const lines = stdoutBuffer.split(/\r?\n/)
  
  // เก็บ line สุดท้ายไว้ใน buffer (อาจยังไม่สมบูรณ์)
  stdoutBuffer = lines.pop() || ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // ข้าม request logs (GET / POST / PUT / DELETE / PATCH / OPTIONS / HEAD)
    // Pattern: GET / 200 in 662ms
    // Pattern: GET /work-orders/new 200 in 199ms
    if (/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD|PUT)\s+\//.test(trimmed)) {
      continue
    }
    
    // ข้าม compile/render/proxy logs ที่เป็นส่วนหนึ่งของ request logs
    // Pattern: (compile: 301ms, proxy.ts: 60ms, render: 301ms)
    if (/\(compile:|proxy\.ts:|render:|proxy:/i.test(trimmed)) {
      continue
    }
    
    // ข้าม Compiled message
    // Pattern: ✓ Compiled in 113ms
    if (/^✓\s+Compiled|^Compiled/.test(trimmed)) {
      continue
    }
    
    // ข้าม Ready message (แสดงแค่ครั้งแรก)
    // Pattern: ✓ Ready in 1296ms
    if (/^✓\s+Ready|^Ready/.test(trimmed)) {
      continue
    }
    
    // ข้าม Local/Network URLs (แสดงแค่ครั้งแรก)
    // Pattern: - Local: http://localhost:3000
    if (/^- (Local|Network):/.test(trimmed)) {
      continue
    }
    
    // ข้าม Environments message
    // Pattern: Environments: .env
    if (/^Environments:/i.test(trimmed)) {
      continue
    }
    
    // แสดงเฉพาะ warnings และ errors สำคัญ (startup messages ถูกกรองหมดแล้ว)
    if (trimmed && (trimmed.includes('⚠') || trimmed.includes('Error') || trimmed.includes('ERROR'))) {
      process.stdout.write(line + '\n')
    }
    // ไม่แสดง logs อื่นๆ (เงียบหมด)
  }
})

// Filter stderr (errors และ warnings) - แสดงเฉพาะ errors จริงๆ
nextDev.stderr.on('data', (data) => {
  const output = data.toString()
  stderrBuffer += output
  
  // แบ่งเป็น lines โดยคำนึงถึง carriage return
  const lines = stderrBuffer.split(/\r?\n/)
  
  // เก็บ line สุดท้ายไว้ใน buffer (อาจยังไม่สมบูรณ์)
  stderrBuffer = lines.pop() || ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // ข้าม request logs ที่อาจมาใน stderr
    if (/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+\//.test(trimmed)) {
      continue
    }
    
    // ข้าม compile/render/proxy logs ใน stderr
    if (/\(compile:|proxy\.ts:|render:|proxy:/i.test(trimmed)) {
      continue
    }
    
    // แสดงเฉพาะ errors จริงๆ (ไม่แสดง warnings ธรรมดา)
    if (trimmed && (
      trimmed.includes('Error:') || 
      trimmed.includes('ERROR') || 
      trimmed.includes('✗') ||
      /^Error/i.test(trimmed)
    )) {
      process.stderr.write(line + '\n')
    }
    // ไม่แสดง warnings ธรรมดา (เงียบหมด)
  }
})

nextDev.on('close', (code) => {
  process.exit(code || 0)
})

nextDev.on('error', (error) => {
  // แสดงเฉพาะ errors ที่เกิดตอน start
  console.error('❌ Error starting Next.js:', error.message)
  process.exit(1)
})

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping Next.js...')
  nextDev.kill('SIGINT')
  setTimeout(() => {
    nextDev.kill('SIGTERM')
    process.exit(0)
  }, 2000)
})

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM')
  process.exit(0)
})

