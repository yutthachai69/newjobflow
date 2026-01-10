# 🚀 Deploy ไป Vercel ผ่าน GitHub

## 📋 ขั้นตอนการ Deploy

### 1. **เตรียม Code และ Commit**

**A. Add ไฟล์ที่เปลี่ยนแปลง:**
```bash
git add .
```

**B. Commit changes:**
```bash
git commit -m "Prepare for deployment"
```

**C. Push ไป GitHub:**
```bash
git push origin main
```

---

### 2. **Deploy ผ่าน Vercel**

**A. ไปที่ [Vercel](https://vercel.com)**

**B. Sign in ด้วย GitHub:**
- คลิก "Continue with GitHub"
- Authorize Vercel

**C. Import Project:**
- คลิก "Add New..." → "Project"
- เลือก GitHub repository (`jobflow2`)
- Vercel จะ detect Next.js อัตโนมัติ

**D. ตั้งค่า Project:**

**Framework Preset:** Next.js (อัตโนมัติ)  
**Root Directory:** `./` (default)  
**Build Command:** `npm run build` (default)  
**Output Directory:** `.next` (default)  
**Install Command:** `npm install` (default)

**E. ตั้งค่า Environment Variables:**

คลิก "Environment Variables" แล้วเพิ่ม:

```env
# Required
DATABASE_URL=file:./prisma/dev.db
NODE_ENV=production

# Recommended (สำหรับ image uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Recommended (สำหรับ SEO)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# Optional
SESSION_SECRET=your-random-secret-key
```

**⚠️ หมายเหตุ:**
- `DATABASE_URL` สำหรับ SQLite: `file:./prisma/dev.db` (สำหรับทดสอบ)
- สำหรับ production จริง ควรใช้ PostgreSQL (Vercel Postgres)

**F. Deploy!**
- คลิก "Deploy"
- รอประมาณ 2-5 นาที
- ได้ URL: `https://your-project.vercel.app`

---

### 3. **Post-Deploy Setup**

**A. Run Database Migrations (ถ้าใช้ SQLite):**

SQLite ใน Vercel จะ reset ทุกครั้งที่ deploy ใหม่ (ไม่ persist)

**สำหรับ Production จริง ควรใช้:**
- Vercel Postgres (แนะนำ)
- หรือ External PostgreSQL (Supabase, Neon, etc.)

**B. Seed Database (ถ้าต้องการ):**

สร้าง API route สำหรับ seed หรือใช้ Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run seed
vercel env pull
npm run db:seed
```

---

## ⚠️ หมายเหตุสำคัญ

### 1. **SQLite ไม่เหมาะสำหรับ Vercel**

**ปัญหา:**
- SQLite ใน Vercel จะ reset ทุกครั้งที่ deploy ใหม่
- ไม่ persist data ระหว่าง deployments
- เหมาะสำหรับทดสอบเท่านั้น

**วิธีแก้ (Production):**
- ใช้ Vercel Postgres (แนะนำ)
- หรือ External PostgreSQL

### 2. **Environment Variables**

**ต้องตั้งค่าใน Vercel Dashboard:**
- `DATABASE_URL` (required)
- `NODE_ENV=production` (required)
- `BLOB_READ_WRITE_TOKEN` (recommended)
- `NEXT_PUBLIC_APP_URL` (recommended)

**ไม่ต้อง commit `.env` ไป GitHub** (ถูก ignore แล้ว)

### 3. **Prisma Setup**

Vercel จะ run `prisma generate` อัตโนมัติระหว่าง build

**สำหรับ migrations:**
- ใช้ `prisma migrate deploy` สำหรับ production
- หรือ setup Post-Deploy Hook ใน Vercel

---

## 🎯 Quick Deploy Commands

### ถ้าใช้ Vercel CLI:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod
```

---

## 📊 Deploy Checklist

### ก่อน Deploy:
- ✅ Code พร้อม (build สำเร็จ)
- ✅ Git committed และ pushed
- ✅ `.env` ไม่ถูก commit (ตรวจสอบ `.gitignore`)
- ✅ Environment variables เตรียมไว้

### หลัง Deploy:
- ✅ ตรวจสอบ URL ทำงาน
- ✅ ตรวจสอบ Database migrations (ถ้ามี)
- ✅ ตรวจสอบ Environment variables
- ✅ ทดสอบ Login
- ✅ ทดสอบ Core Features

---

## 🔧 Troubleshooting

### Build Failed:

**1. ตรวจสอบ Build Logs ใน Vercel Dashboard**

**2. ตรวจสอบ Environment Variables:**
- `DATABASE_URL` ถูกต้อง
- `NODE_ENV=production`

**3. ตรวจสอบ Prisma:**
```bash
# Local test build
npm run build
```

### Database Issues:

**SQLite ไม่ persist:**
- ใช้ Vercel Postgres แทน
- หรือ External PostgreSQL

### Image Upload ไม่ทำงาน:

**ตรวจสอบ `BLOB_READ_WRITE_TOKEN`:**
- สร้าง Blob Store ใน Vercel Dashboard
- Copy token มาใส่ใน Environment Variables

---

## 🎉 Success!

เมื่อ deploy สำเร็จแล้ว:

**✅ URL:** `https://your-project.vercel.app`  
**✅ Production-ready**  
**✅ Accessible จากทุกที่**  

---

## 📚 Next Steps

### สำหรับ Production จริง:

1. **Setup Vercel Postgres:**
   - Vercel Dashboard → Storage → Create Database
   - Copy connection string
   - Update `DATABASE_URL`

2. **Setup Custom Domain:**
   - Vercel Dashboard → Settings → Domains
   - Add custom domain

3. **Enable Analytics:**
   - Vercel Dashboard → Analytics
   - Monitor performance

---

**พร้อม deploy แล้ว! 🚀**

