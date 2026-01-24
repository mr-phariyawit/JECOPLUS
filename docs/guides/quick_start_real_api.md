# 🚀 Quick Start: ใช้ Frontend กับ Real Backend API

## เริ่มต้นด้วย 3 ขั้นตอน

### 1️⃣ Start Backend
```bash
cd backend
npm run dev
```
✅ Backend จะรันที่ `http://localhost:3002`

---

### 2️⃣ Configure Frontend

**วิธีที่ 1: แก้ไข .env**
```bash
# แก้ไขไฟล์ .env
VITE_MOCKUP_MODE=false
```

**วิธีที่ 2: ใช้ .env.local (แนะนำ)**
```bash
echo "VITE_MOCKUP_MODE=false" > .env.local
echo "VITE_API_URL=http://localhost:3002/api/v1" >> .env.local
```

---

### 3️⃣ Start Frontend
```bash
npm run dev
```

---

## ✅ Verify Connection

เปิด Browser Console จะเห็น:
```
🌐 Running in API MODE
   → Using real API: http://localhost:3002/api/v1
```

---

## 🧪 Test Login

### ตัวเลือก 1: ใช้ Demo Mode (ง่ายที่สุด)

ถ้า backend มี `DEMO_MODE=true`:

```
Phone: 0999999999
Password: demo123
```

### ตัวเลือก 2: ใช้ Real User

```
Phone: 0812345678
OTP: (รับจาก Firebase/SMS)
```

---

## 🔄 สลับกลับไป Mock Mode

```bash
# แก้ไข .env.local
VITE_MOCKUP_MODE=true
```

```bash
# Restart
npm run dev
```

---

## 📖 Documentation เพิ่มเติม

- [SWITCHING_MODES.md](SWITCHING_MODES.md) - คู่มือสลับโหมดแบบละเอียด
- [env_setup.md](env_setup.md) - Environment setup guide

---

## ⚡ One-Line Commands

### Start ทั้ง Backend + Frontend (Real API Mode)
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend with Real API
VITE_MOCKUP_MODE=false npm run dev
```

### Start Frontend (Mock Mode)
```bash
VITE_MOCKUP_MODE=true npm run dev
```

---

## 🐛 Troubleshooting

| ปัญหา | แก้ไข |
|-------|--------|
| Network Error | ตรวจสอบ backend รันอยู่ที่ port 3002 |
| ยังใช้ mock data | Restart frontend server |
| CORS Error | เช็ค `CORS_ORIGINS` ใน backend/.env |
| 401 Error | Login ใหม่หรือ clear localStorage |

---

**สร้างเมื่อ:** 2026-01-24
**สำหรับ:** JECOPLUS Frontend Development
