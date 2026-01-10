# 🚀 Quick Deploy Guide - Vercel ผ่าน GitHub

## ✅ ขั้นตอนง่ายๆ (3 ขั้นตอน)

### 1️⃣ **Push Code ขึ้น GitHub**

```bash
# Add ไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Ready for deployment"

# Push
git push origin main
```

---

### 2️⃣ **Deploy ผ่าน Vercel**

**A. ไปที่ [vercel.com](https://vercel.com)**

**B. Sign in ด้วย GitHub**

**C. Import Project:**
- คลิก "Add New..." → "Project"
- เลือก repository `jobflow2`
- คลิก "Import"

**D. ตั้งค่า Environment Variables:**
คลิก "Environment Variables" แล้วเพิ่ม:

```
DATABASE_URL = file:./prisma/dev.db
NODE_ENV = production
```

**E. คลิก "Deploy"! 🚀**

---

### 3️⃣ **รอสักครู่ (2-5 นาที)**

Vercel จะ:
- ✅ Install dependencies
- ✅ Build project
- ✅ Deploy
- ✅ ให้ URL: `https://your-project.vercel.app`

---

## ⚠️ หมายเหตุสำคัญ

### 1. **SQLite ใน Vercel**
- ✅ ใช้ได้สำหรับทดสอบ
- ❌ Data จะ reset ทุกครั้งที่ deploy ใหม่ (ไม่ persist)
- 💡 สำหรับ production ควรใช้ Vercel Postgres

### 2. **Environment Variables**
- ✅ ตั้งค่าใน Vercel Dashboard (ไม่ต้อง commit `.env`)
- ✅ `DATABASE_URL` ต้องมี
- ✅ `NODE_ENV=production` ต้องมี

### 3. **Image Uploads**
ถ้าต้องการอัปโหลดรูป:
- สร้าง Vercel Blob Store
- Copy `BLOB_READ_WRITE_TOKEN`
- ใส่ใน Environment Variables

---

## 🎯 Checklist ก่อน Deploy

- ✅ Code พร้อม (`npm run build` สำเร็จ)
- ✅ Git pushed ขึ้น GitHub
- ✅ Environment Variables เตรียมไว้

---

## 📱 หลังจาก Deploy

**URL ของคุณ:**
```
https://your-project.vercel.app
```

**เข้าจากโทรศัพท์ได้เลย!** 🎉

---

**พร้อมแล้ว! เริ่มจากขั้นตอนที่ 1 เลยครับ! 🚀**

