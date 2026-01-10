# 🌱 คู่มือ Seed Database ใน Vercel

## ⚠️ ปัญหา: Login ไม่ได้หลังจาก Deploy

**สาเหตุ:** Database ไม่มีข้อมูล (SQLite ใน Vercel จะ reset ทุกครั้งที่ deploy ใหม่)

---

## ✅ วิธีแก้ไข: Seed Database

### วิธีที่ 1: ใช้ API Route (ง่ายที่สุด - แนะนำ)

**A. Seed Database ผ่าน Browser:**

```
POST https://newjobflow.vercel.app/api/seed
```

**หรือใช้ curl:**
```bash
curl -X POST https://newjobflow.vercel.app/api/seed
```

**B. Seed Database ผ่าน Browser (GET เพื่อดูข้อมูล):**
```
https://newjobflow.vercel.app/api/seed
```

**C. Seed Database ผ่าน Postman/Thunder Client:**
- Method: `POST`
- URL: `https://newjobflow.vercel.app/api/seed`
- Headers: (ถ้า production ต้องมี `Authorization: Bearer <SEED_SECRET>`)

---

### วิธีที่ 2: ใช้ Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Pull environment variables
vercel env pull

# 5. Run seed locally (ต่อกับ Vercel database)
npm run db:seed
```

---

### วิธีที่ 3: ใช้ Vercel Post-Deploy Hook (อัตโนมัติ)

สร้างไฟล์ `vercel.json` และเพิ่ม `postinstall` script:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install && npm run db:generate && npm run db:push && npm run db:seed"
}
```

**⚠️ หมายเหตุ:** วิธีนี้จะ seed ทุกครั้งที่ deploy (อาจจะไม่ต้องการ)

---

## 📋 Default Accounts (หลังจาก Seed)

### ADMIN:
- **Username:** `admin`
- **Password:** `admin123`

### TECHNICIAN:
- **Username:** `tech1`
- **Password:** `password123`

### CLIENT:
- **Username:** `client1`
- **Password:** `client123`

---

## 🚀 Quick Fix (ตอนนี้)

### ขั้นตอนที่ 1: Seed Database

**Option A: ใช้ Browser/Postman:**
```
POST https://newjobflow.vercel.app/api/seed
```

**Option B: ใช้ Terminal:**
```bash
curl -X POST https://newjobflow.vercel.app/api/seed
```

### ขั้นตอนที่ 2: ลอง Login อีกครั้ง

ใช้ credentials:
- Username: `admin`
- Password: `admin123`

---

## ⚠️ Security Note

**สำหรับ Production:**
- ควรตั้งค่า `SEED_SECRET` ใน Environment Variables
- ใช้ Authorization header: `Authorization: Bearer <SEED_SECRET>`
- หรือปิด API route นี้หลังจาก seed แล้ว

---

## 📝 สรุป

**ปัญหาหลัก:** Database ไม่มีข้อมูล

**วิธีแก้:**
1. ✅ Seed ผ่าน API: `POST /api/seed`
2. ✅ หรือใช้ Vercel CLI
3. ✅ หรือใช้ postinstall script

**หลังจาก Seed:**
- ✅ Database มีข้อมูลแล้ว
- ✅ สามารถ login ได้

---

**ลอง Seed Database ผ่าน API route แล้วลอง Login อีกครั้งครับ!**

