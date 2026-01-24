# 🔄 วิธีการสลับระหว่าง Mock Data และ Real Backend API

## 📋 Overview

Frontend ของ JECOPLUS รองรับ 2 โหมดการทำงาน:
- **Mockup Mode** (`VITE_MOCKUP_MODE=true`) - ใช้ mock data ไม่เรียก backend
- **Production Mode** (`VITE_MOCKUP_MODE=false`) - ใช้ real backend API

## 🎯 Quick Start

### วิธีที่ 1: ใช้ Real Backend (แนะนำ)

1. **ตรวจสอบว่า backend กำลังรัน**
   ```bash
   cd backend
   npm run dev
   ```
   Backend จะรันที่ `http://localhost:3002`

2. **เปิดใช้งาน Real API Mode**

   **ตัวเลือก A: แก้ไข `.env` โดยตรง**
   ```bash
   # แก้ไขไฟล์ .env
   VITE_MOCKUP_MODE=false
   VITE_API_URL=http://localhost:3002/api/v1
   ```

   **ตัวเลือก B: ใช้ `.env.production.local`**
   ```bash
   # Copy ไฟล์
   cp .env.production.local .env.local
   ```

3. **Restart Frontend**
   ```bash
   npm run dev
   ```

4. **ตรวจสอบ Console**
   เมื่อ app เริ่มทำงาน คุณจะเห็น:
   ```
   🌐 Running in API MODE
      → Using real API: http://localhost:3002/api/v1
   ```

---

### วิธีที่ 2: ใช้ Mock Data

1. **แก้ไข `.env`**
   ```bash
   VITE_MOCKUP_MODE=true
   ```

2. **หรือใช้ `.env.development`**
   ```bash
   cp .env.development .env.local
   ```

3. **Restart Frontend**
   ```bash
   npm run dev
   ```

4. **ตรวจสอบ Console**
   ```
   🎭 Running in MOCKUP MODE
      → Using mock data from scenarios
   ```

---

## 📁 Environment Files

### ไฟล์ที่มีอยู่

| ไฟล์ | โหมด | คำอธิบาย |
|------|------|----------|
| `.env` | Real API | ค่า default สำหรับ production |
| `.env.development` | Mock | สำหรับพัฒนาด้วย mock data |
| `.env.production.local` | Real API | Template สำหรับ local testing กับ real backend |

### ลำดับการอ่านไฟล์ของ Vite

Vite จะอ่านไฟล์ตามลำดับนี้ (ลำดับหลังทับลำดับก่อน):
1. `.env` - ค่า default
2. `.env.local` - ค่า local (git ignored)
3. `.env.[mode]` - ค่าเฉพาะ mode
4. `.env.[mode].local` - ค่า local เฉพาะ mode (git ignored)

---

## 🔍 การตรวจสอบโหมดปัจจุบัน

### ในเบราว์เซอร์

เปิด **Browser Console** จะเห็น log:

**Mock Mode:**
```
🎭 Running in MOCKUP MODE
   → Using mock data from scenarios
   → Set VITE_MOCKUP_MODE=false to use real API
```

**Real API Mode:**
```
🌐 Running in API MODE
   → Using real API: http://localhost:3002/api/v1
```

### ใน Code

```javascript
import { isMockupMode } from '@/services/dataService'

if (isMockupMode()) {
  console.log('Currently in mockup mode')
} else {
  console.log('Currently in API mode')
}
```

---

## 🛠️ Configuration Variables

### Required Variables

| Variable | Type | Description |
|----------|------|-------------|
| `VITE_MOCKUP_MODE` | `true/false` | เปิด/ปิด mockup mode |
| `VITE_API_URL` | string | Backend API base URL |

### Example Configuration

**Local Development with Real Backend:**
```env
VITE_MOCKUP_MODE=false
VITE_API_URL=http://localhost:3002/api/v1
```

**Staging Server:**
```env
VITE_MOCKUP_MODE=false
VITE_API_URL=https://api-staging.jecoplus.com/api/v1
```

**Production:**
```env
VITE_MOCKUP_MODE=false
VITE_API_URL=https://api.jecoplus.com/api/v1
```

---

## 🧪 Testing the Connection

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Check Network Tab

เปิด **Browser DevTools** → **Network Tab**

- **Mock Mode:** ไม่มี API requests ออกไป
- **Real API Mode:** จะเห็น requests ไปที่ `localhost:3002/api/v1/*`

### 4. Test Login

ทดสอบ login เพื่อยืนยันว่าเชื่อมต่อได้:

```bash
# Real Backend
Phone: 0812345678
OTP: (รับจาก Firebase/SMS)

# หรือใช้ Demo Mode (ถ้า backend เปิด DEMO_MODE=true)
Phone: 0999999999
Password: demo123
```

---

## 📊 Comparison: Mock vs Real API

| Feature | Mock Mode | Real API Mode |
|---------|-----------|---------------|
| ความเร็ว | 🚀 Instant | ⏱️ ตาม network |
| Data | 📦 Fixed scenarios | 💾 Database |
| Authentication | ❌ ไม่ต้อง | ✅ ต้อง login |
| Backend Required | ❌ No | ✅ Yes |
| Scenarios | ✅ รองรับ | ❌ ไม่รองรับ |

---

## 🐛 Troubleshooting

### ปัญหา: "Network Error" หรือ "Connection Refused"

**สาเหตุ:** Backend ไม่ได้รัน หรือรันคนละ port

**แก้ไข:**
1. ตรวจสอบว่า backend รันอยู่:
   ```bash
   curl http://localhost:3002/api/v1/health
   ```

2. ตรวจสอบ port ใน `backend/.env`:
   ```env
   PORT=3002
   ```

3. ตรวจสอบ CORS settings ใน `backend/.env`:
   ```env
   CORS_ORIGINS=http://localhost:5173
   ```

---

### ปัญหา: ยังใช้ mock data อยู่แม้จะตั้ง `VITE_MOCKUP_MODE=false`

**สาเหตุ:** ไม่ได้ restart dev server

**แก้ไข:**
1. Stop frontend server (Ctrl+C)
2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```
3. Restart:
   ```bash
   npm run dev
   ```

---

### ปัญหา: API calls ติด CORS error

**สาเหตุ:** Backend CORS configuration ไม่ถูกต้อง

**แก้ไข:**
ตรวจสอบ `backend/.env`:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

### ปัญหา: 401 Unauthorized

**สาเหตุ:** Token หมดอายุ หรือไม่ได้ login

**แก้ไข:**
1. Clear tokens และ login ใหม่:
   ```javascript
   localStorage.clear()
   // Reload page และ login ใหม่
   ```

2. หรือเปิด Demo Mode ใน backend:
   ```env
   # backend/.env
   DEMO_MODE=true
   DEMO_PHONE=0999999999
   ```

---

## 📚 Related Documentation

- [API Service Structure](../technical/api_service.md)
- [Mock Data Scenarios](../testing/scenarios.md)
- [Backend Setup](../../backend/README.md)

---

## 💡 Best Practices

### Development
- ใช้ **Mock Mode** สำหรับ UI development และ testing scenarios
- ใช้ **Real API Mode** สำหรับทดสอบ integration

### Testing
- ทดสอบทั้ง 2 โหมดก่อน deploy
- ใช้ `.env.local` สำหรับ local config (ไม่ commit ลง git)

### Production
- **ห้าม** ใช้ Mock Mode ใน production
- ตรวจสอบว่า `VITE_MOCKUP_MODE=false` ใน production build

---

## 🎓 Example Workflows

### Workflow 1: UI Development
```bash
# 1. ใช้ Mock Mode
echo "VITE_MOCKUP_MODE=true" > .env.local

# 2. Start frontend only
npm run dev

# 3. พัฒนา UI โดยไม่ต้องรอ backend
```

### Workflow 2: Integration Testing
```bash
# 1. Start backend
cd backend && npm run dev &

# 2. ใช้ Real API Mode
echo "VITE_MOCKUP_MODE=false" > .env.local
echo "VITE_API_URL=http://localhost:3002/api/v1" >> .env.local

# 3. Start frontend
npm run dev

# 4. ทดสอบการเชื่อมต่อจริง
```

### Workflow 3: Demo/Presentation
```bash
# 1. ใช้ Mock Mode กับ specific scenario
echo "VITE_MOCKUP_MODE=true" > .env.local
echo "VITE_DEFAULT_SCENARIO=PERFECT_BORROWER" >> .env.local

# 2. Start frontend
npm run dev

# 3. นำเสนอโดยไม่ต้องกังวลเรื่อง backend
```

---

## ✅ Checklist: สลับไป Real API Mode

- [ ] Backend server กำลังรันอยู่ที่ `http://localhost:3002`
- [ ] ตั้ง `VITE_MOCKUP_MODE=false` ใน `.env` หรือ `.env.local`
- [ ] ตั้ง `VITE_API_URL=http://localhost:3002/api/v1`
- [ ] Restart frontend dev server
- [ ] เช็ค console แสดง "🌐 Running in API MODE"
- [ ] เช็ค Network tab เห็น API requests
- [ ] ทดสอบ login และ basic features

---

**Last Updated:** 2026-01-24
**Maintained by:** JECOPLUS Development Team
