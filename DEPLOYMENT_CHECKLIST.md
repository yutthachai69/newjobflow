# 🚀 Deployment Checklist

## ✅ Build Status

**✅ Build สำเร็จแล้ว!** (`npm run build` ผ่าน)

---

## 📋 Pre-Deployment Checklist

### 1. **Environment Variables (Required)**

#### Required (ต้องมี):
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NODE_ENV="production"
```

#### Recommended (แนะนำให้มี):
```env
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"  # สำหรับ image uploads (ถ้าไม่มีจะไม่สามารถอัปโหลดรูปได้)
SESSION_SECRET="random-secret-key-here"  # สำหรับ session encryption (ถ้าไม่มีจะใช้ default)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"  # สำหรับ SEO meta tags
```

#### Optional (ไม่บังคับ):
```env
SENTRY_DSN="sentry_dsn_here"  # สำหรับ error tracking
NEXT_PUBLIC_GA_ID="ga-id-here"  # สำหรับ Google Analytics
```

---

### 2. **Database Setup**

#### สำหรับ Production (แนะนำ PostgreSQL):

**A. สร้าง PostgreSQL Database:**
```sql
CREATE DATABASE airservice;
CREATE USER airservice_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE airservice TO airservice_user;
```

**B. Update DATABASE_URL:**
```env
DATABASE_URL="postgresql://airservice_user:your_secure_password@localhost:5432/airservice?schema=public"
```

**C. Run Migrations:**
```bash
# Generate Prisma Client
npm run db:generate

# Deploy migrations (สำหรับ production)
npm run db:migrate:deploy
```

**D. Seed Data (ถ้าต้องการ):**
```bash
npm run db:seed
```

---

### 3. **Vercel Blob Storage (สำหรับ Image Uploads)**

**A. สร้าง Vercel Blob Store:**
1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. เปิดโปรเจกต์
3. ไปที่ Storage → Create Blob Store
4. Copy `BLOB_READ_WRITE_TOKEN`

**B. Update Environment Variable:**
```env
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"
```

**⚠️ Warning:** ถ้าไม่มี `BLOB_READ_WRITE_TOKEN` การอัปโหลดรูปภาพจะไม่ทำงาน

---

### 4. **Session Secret (สำหรับ Security)**

**สร้าง Random Secret:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# หรือใช้ online generator
```

**Update Environment Variable:**
```env
SESSION_SECRET="your-random-secret-here"
```

---

### 5. **Next.js Configuration**

✅ `next.config.ts` - ไม่ต้องแก้ไข (ใช้งานได้แล้ว)

⚠️ **Note:** มี warning เกี่ยวกับ `middleware` → `proxy` แต่ไม่กระทบการใช้งาน

---

### 6. **Build & Test Locally (ก่อน Deploy)**

```bash
# 1. Build
npm run build

# 2. Test Production Build Locally
npm start

# 3. ทดสอบ:
# - Login
# - Create/Read/Update/Delete operations
# - Image uploads
# - Work order workflow
```

---

## 🚀 Deployment Options

### Option 1: **Vercel** (แนะนำ)

**ขั้นตอน:**
1. Push code ไป GitHub/GitLab/Bitbucket
2. ไปที่ [Vercel](https://vercel.com)
3. Import Project
4. ตั้งค่า Environment Variables:
   - `DATABASE_URL`
   - `BLOB_READ_WRITE_TOKEN`
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_URL`
   - `SESSION_SECRET` (optional)
5. Deploy

**Vercel จะ:**
- ✅ Run `npm run build` อัตโนมัติ
- ✅ Run `prisma generate` อัตโนมัติ (ถ้ามี postinstall script)
- ✅ ตั้งค่า production environment

**Post-Deploy:**
```bash
# Connect to Vercel database และ run migrations
vercel env pull  # ดึง environment variables
npm run db:migrate:deploy
```

---

### Option 2: **Docker** (Self-Hosted)

**สร้าง Dockerfile:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

**Build & Run:**
```bash
docker build -t jobflow2 .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e BLOB_READ_WRITE_TOKEN="..." \
  -e NODE_ENV=production \
  jobflow2
```

---

### Option 3: **PM2** (Node.js Server)

**Setup:**
```bash
# 1. Install PM2
npm install -g pm2

# 2. Build
npm run build

# 3. Run with PM2
pm2 start npm --name "jobflow2" -- start

# 4. Save PM2 configuration
pm2 save
pm2 startup
```

**Environment Variables:**
```bash
# สร้างไฟล์ ecosystem.config.js
module.exports = {
  apps: [{
    name: 'jobflow2',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://...',
      BLOB_READ_WRITE_TOKEN: '...',
      NEXT_PUBLIC_APP_URL: 'https://yourdomain.com',
    }
  }]
}
```

---

## 📊 Post-Deployment Checklist

### 1. **Verify Environment Variables**
- ✅ `DATABASE_URL` ถูกต้อง
- ✅ `BLOB_READ_WRITE_TOKEN` ถูกต้อง (ถ้าใช้ image uploads)
- ✅ `NODE_ENV=production`
- ✅ `NEXT_PUBLIC_APP_URL` ถูกต้อง

### 2. **Database Migrations**
```bash
npm run db:migrate:deploy
```

### 3. **Test Core Features**
- ✅ Login/Logout
- ✅ Create Work Order
- ✅ Upload Images
- ✅ Technician Workflow
- ✅ User Management
- ✅ Location Management

### 4. **Monitor Logs**
- ✅ ตรวจสอบ errors ใน logs
- ✅ ตรวจสอบ performance
- ✅ ตรวจสอบ security incidents

### 5. **Security**
- ✅ HTTPS enabled
- ✅ Environment variables ไม่ leak
- ✅ Database credentials ปลอดภัย
- ✅ Rate limiting ทำงาน

---

## ⚠️ Known Issues / Warnings

### 1. **Middleware Warning**
```
⚠️ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Status:** ⚠️ Warning only - ไม่กระทบการใช้งาน  
**Fix:** จะต้องเปลี่ยน `middleware.ts` → `proxy.ts` ในอนาคต (Next.js 17+)

### 2. **BLOB_READ_WRITE_TOKEN Warning**
```
⚠️ WARNING: BLOB_READ_WRITE_TOKEN is not set. Image uploads may fail.
```

**Status:** ⚠️ Warning - Image uploads จะไม่ทำงาน  
**Fix:** ตั้งค่า `BLOB_READ_WRITE_TOKEN` ใน environment variables

---

## 📝 Quick Deploy Commands

### Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add NODE_ENV production
```

### Docker:
```bash
docker build -t jobflow2 .
docker run -p 3000:3000 --env-file .env.production jobflow2
```

### PM2:
```bash
npm run build
pm2 start ecosystem.config.js
```

---

## ✅ Ready to Deploy?

**✅ Build:** สำเร็จ  
**✅ Dependencies:** ติดตั้งแล้ว  
**✅ Configuration:** ใช้งานได้  

**สิ่งที่ต้องเตรียม:**
1. ⚠️ **Database** (PostgreSQL recommended)
2. ⚠️ **BLOB_READ_WRITE_TOKEN** (สำหรับ image uploads)
3. ⚠️ **SESSION_SECRET** (optional but recommended)
4. ⚠️ **NEXT_PUBLIC_APP_URL** (สำหรับ SEO)

**เมื่อพร้อมแล้ว:**
```bash
# 1. ตั้งค่า environment variables
# 2. Run migrations
npm run db:migrate:deploy

# 3. Deploy!
```

---

## 🎉 Success!

เมื่อ deploy สำเร็จแล้ว คุณจะได้:
- ✅ Production-ready application
- ✅ Optimized build
- ✅ ไม่มี development logs
- ✅ Fast performance
- ✅ SEO-ready

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Prisma Production Checklist](https://www.prisma.io/docs/guides/deployment)
- [Database Migration Guide](./DATABASE_MIGRATION.md)

