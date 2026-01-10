# 🌱 วิธี Seed Database (สำหรับ Project เดิม)

## ⚠️ ปัญหา: Database ยังไม่พร้อม

ถ้าเห็น warning: **"ฐานข้อมูลยังไม่พร้อม"** = Database schema หรือ data ยังไม่ถูกสร้าง

---

## 🔧 วิธีแก้ไข (แบบง่ายที่สุด)

### วิธีที่ 1: Seed ผ่าน Browser Console (แนะนำ)

1. เปิด: `https://newjobflow.vercel.app/login`

2. กด `F12` เพื่อเปิด DevTools → ไปที่ tab **"Console"**

3. Copy โค้ดนี้ไปวางใน Console แล้วกด Enter:

```javascript
// Seed Database
fetch('https://newjobflow.vercel.app/api/seed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('📊 Seed Result:', data)
  
  if (data.success) {
    alert('✅ Seed สำเร็จ! ลอง login ใหม่\n\nUsername: admin\nPassword: admin123')
    // Refresh page
    window.location.reload()
  } else if (data.code === 'SCHEMA_NOT_READY') {
    alert('❌ Database schema ยังไม่พร้อม!\n\nต้องรอ postinstall script ทำงานก่อน\nหรือต้อง redeploy project')
    console.error('Error:', data)
  } else {
    alert('❌ Seed ไม่สำเร็จ: ' + data.message)
    console.error('Error:', data)
  }
})
.catch(error => {
  console.error('❌ Fetch Error:', error)
  alert('❌ Error: ' + error.message)
})
```

4. รอสักครู่ (5-10 วินาที) จะเห็นผลลัพธ์ใน Console

5. ถ้าเห็น `success: true` = Seed สำเร็จ! ลอง login ใหม่

---

### วิธีที่ 2: ตรวจสอบ Vercel Logs (ถ้าวิธีที่ 1 ไม่ได้)

1. ไปที่: [Vercel Dashboard](https://vercel.com/dashboard)
2. เปิด Project: `newjobflow`
3. ไปที่: **Deployments** → เปิด deployment ล่าสุด
4. ดูที่: **Functions/Logs** tab
5. ตรวจสอบว่าเห็น logs เหล่านี้หรือไม่:
   - ✅ `🔧 Running post-install setup...`
   - ✅ `📦 Generating Prisma Client...`
   - ✅ `🚀 Setting up database schema...`
   - ✅ `✅ Database schema pushed successfully`
   - ✅ `🌱 Seeding database...`
   - ✅ `✅ Database seeded successfully!`

**ถ้าไม่เห็น logs เหล่านี้** หรือเห็น error → Postinstall script ไม่ทำงาน

---

### วิธีที่ 3: Redeploy Project (ถ้าวิธีที่ 1-2 ไม่ได้)

1. ไปที่: Vercel Dashboard → Project → Deployments
2. กด "..." ที่ deployment ล่าสุด → **"Redeploy"**
3. รอให้ deployment เสร็จ (ประมาณ 2-3 นาที)
4. ตรวจสอบ logs ว่า postinstall script ทำงานหรือไม่
5. ถ้ายังไม่ได้ → ลองวิธีที่ 1 อีกครั้ง

---

## 🔍 Troubleshooting

### Problem: Seed API return error `SCHEMA_NOT_READY`

**สาเหตุ**: Database tables ยังไม่ถูกสร้าง

**วิธีแก้**:
1. ตรวจสอบ Vercel Environment Variables:
   - `DATABASE_URL` = `file:/tmp/prisma/dev.db` ✅
   - `NODE_ENV` = `production` ✅
2. Redeploy project เพื่อให้ postinstall script ทำงานอีกครั้ง
3. ตรวจสอบ Vercel logs ว่ามี error อะไร

---

### Problem: Seed API return error `401 Unauthorized`

**สาเหตุ**: มี `SEED_SECRET` ใน Environment Variables แต่ไม่ได้ส่ง Authorization header

**วิธีแก้**:
1. ลบ `SEED_SECRET` จาก Vercel Environment Variables (สำหรับ initial setup)
2. หรือ seed ด้วย Authorization header:
   ```javascript
   fetch('/api/seed', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer YOUR_SEED_SECRET',
       'Content-Type': 'application/json'
     }
   })
   ```

---

### Problem: Seed API return `500 Internal Server Error`

**สาเหตุ**: อาจเป็น Prisma error หรือ database connection error

**วิธีแก้**:
1. ดู error message ใน Console response
2. ตรวจสอบ `DATABASE_URL` ว่าถูกต้องหรือไม่
3. ตรวจสอบ Vercel logs สำหรับ detailed error

---

## ✅ Test Accounts (หลัง Seed สำเร็จ)

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`

- **Technician**: 
  - Username: `tech1`
  - Password: `password123`

- **Client**: 
  - Username: `client1`
  - Password: `client123`

---

## 📝 Quick Reference

### Seed Database (Copy-paste ใน Browser Console):

```javascript
fetch('https://newjobflow.vercel.app/api/seed', {method: 'POST'})
  .then(r => r.json())
  .then(data => {
    console.log(data)
    if (data.success) {
      alert('✅ Seed สำเร็จ!')
      window.location.reload()
    } else {
      alert('❌ ' + data.message)
    }
  })
```

---

✅ **ลองวิธีที่ 1 ก่อน - ง่ายที่สุด!**

