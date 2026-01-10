/**
 * Post-install script สำหรับ Vercel
 * Run database migrations และ seed data อัตโนมัติหลังจาก deploy
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🔧 Running post-install setup...')

try {
  // 1. Generate Prisma Client
  console.log('📦 Generating Prisma Client...')
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: process.cwd(),
  })

  // 2. Run migrations (สำหรับ SQLite จะสร้าง database ใหม่)
  console.log('🚀 Running database migrations...')
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
  } catch (migrateError) {
    // ถ้าไม่มี migrations ใช้ db:push แทน (สำหรับ SQLite)
    console.log('⚠️  migrate deploy failed, trying db push...')
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
  }

  // 3. Seed database (run ทุกครั้ง เพราะ SQLite reset ทุก deploy)
  console.log('🌱 Seeding database...')
  try {
    execSync('npm run db:seed', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    console.log('✅ Database seeded successfully!')
  } catch (seedError) {
    console.warn('⚠️  Seed failed (may already be seeded):', seedError.message)
  }

  console.log('✅ Post-install setup completed!')
} catch (error) {
  console.error('❌ Post-install setup failed:', error.message)
  // ไม่ throw error เพื่อไม่ให้ build fail
  console.warn('⚠️  Continuing... (you may need to seed manually)')
}

