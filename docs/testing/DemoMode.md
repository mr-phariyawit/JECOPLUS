# 🎭 JECOPLUS Demo Mode

**⚠️ WARNING: ONLY FOR PRESENTATIONS - NEVER USE IN PRODUCTION!**

## สารบัญ
1. [คำอธิบาย](#คำอธิบาย)
2. [Security Features ที่ถูก Bypass](#security-features-ที่ถูก-bypass)
3. [วิธีการใช้งาน](#วิธีการใช้งาน)
4. [การทดสอบ](#การทดสอบ)
5. [คำเตือน](#คำเตือน)

---

## คำอธิบาย

Demo Mode เป็นโหมดพิเศษที่สร้างขึ้นเพื่อใช้สำหรับการนำเสนอ (Presentation) โดยจะ **bypass security ทั้งหมด** เพื่อให้สามารถ login และใช้งานได้ง่ายและรวดเร็ว โดยไม่ต้องผ่าน OTP, rate limiting, CSRF protection และ security features อื่นๆ

### 🎯 วัตถุประสงค์
- สำหรับการ Demo/Present ระบบให้ผู้บริหาร, นักลงทุน, หรือลูกค้า
- ลดความซับซ้อนในการ login ระหว่างการนำเสนอ
- ไม่ต้องรอ OTP หรือติด rate limiting
- ทำให้การ demo ราบรื่นและรวดเร็ว

---

## Security Features ที่ถูก Bypass

เมื่อเปิด `DEMO_MODE=true` ระบบจะ bypass security features ต่อไปนี้:

### ✅ 1. OTP Verification
- ❌ **ปกติ**: ต้องขอ OTP → รอ SMS → ใส่ OTP 6 หลัก
- ✅ **Demo**: Login ด้วย phone + password ได้เลย (ไม่ต้อง OTP)

### ✅ 2. Rate Limiting
- ❌ **ปกติ**: จำกัด request (10/min สำหรับ auth, 100/min global)
- ✅ **Demo**: ไม่จำกัด request ทุกประเภท

### ✅ 3. CSRF Protection
- ❌ **ปกติ**: ต้องส่ง CSRF token ทุก POST/PUT/DELETE request
- ✅ **Demo**: ไม่ต้องส่ง CSRF token

### ✅ 4. OTP Cooldown & Limits
- ❌ **ปกติ**: OTP จำกัด 5 ครั้ง/ชั่วโมง, cooldown 60 วินาที
- ✅ **Demo**: ไม่มี cooldown, ไม่มี limit

### ⚠️ Security Features ที่ยังคงทำงาน
- JWT Token Verification (ยังคงใช้ token ปกติ)
- Database Parameterized Queries
- Password Hashing (ถ้ามี admin users)
- Input Validation (Joi schemas)

---

## วิธีการใช้งาน

### 📋 ขั้นตอนที่ 1: Setup Environment

```bash
cd backend

# คัดลอกไฟล์ .env.demo ไปเป็น .env
cp .env.demo .env

# หรือเพิ่ม DEMO_MODE ใน .env ที่มีอยู่
echo "DEMO_MODE=true" >> .env
```

### 📋 ขั้นตอนที่ 2: Start Server

```bash
# Install dependencies (ถ้ายังไม่ได้ install)
npm install

# Start server
npm run dev
```

### 📋 ขั้นตอนที่ 3: Demo Login

#### วิธีที่ 1: ใช้ HTML Test Page (แนะนำ)

1. เปิดไฟล์ `backend/test-demo-login.html` ในเบราว์เซอร์
2. กรอกข้อมูล (หรือใช้ค่าเริ่มต้น):
   - Phone: `0999999999`
   - Password: `demo123`
3. กดปุ่ม "เข้าสู่ระบบ (Demo Mode)"
4. รับ Access Token และ Refresh Token

#### วิธีที่ 2: ใช้ Curl/Postman

```bash
curl -X POST http://localhost:3000/api/v1/auth/demo/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0999999999",
    "password": "demo123"
  }'
```

#### วิธีที่ 3: ใช้ Test Script

```bash
# Make script executable
chmod +x backend/test-demo-login.sh

# Run test
./backend/test-demo-login.sh
```

### 📋 ขั้นตอนที่ 4: ใช้งาน API

หลังจาก login สำเร็จ คุณจะได้รับ:
- `accessToken` (อายุ 15 นาที)
- `refreshToken` (อายุ 7 วัน)
- `csrfToken` (ไม่จำเป็นใน demo mode)

ใช้ `accessToken` สำหรับ API requests:

```bash
curl -X GET http://localhost:3000/api/v1/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## การทดสอบ

### ✅ Test 1: Demo Login

```bash
# Expected: Success response with tokens
curl -X POST http://localhost:3000/api/v1/auth/demo/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0999999999","password":"demo123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "csrfToken": "...",
    "user": {
      "id": "...",
      "phone": "0999999999",
      "firstName": "Demo",
      "lastName": "User",
      "kycStatus": "APPROVED"
    },
    "warning": "⚠️  DEMO MODE - All security bypassed!"
  }
}
```

### ✅ Test 2: Rate Limiting Bypassed

```bash
# กดซ้ำๆ หลายครั้ง - ไม่ควรได้ 429 Too Many Requests
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/v1/auth/demo/login \
    -H "Content-Type: application/json" \
    -d '{"phone":"0999999999","password":"demo123"}'
done
```

### ✅ Test 3: CSRF Bypassed

```bash
# ส่ง POST request โดยไม่มี CSRF token - ควรสำเร็จ
curl -X POST http://localhost:3000/api/v1/some-endpoint \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## คำเตือน

### 🚨 อันตรายร้ายแรง - อย่าใช้ใน Production!

#### ❌ อย่าเปิด Demo Mode ใน Production เพราะ:
1. **ไม่มี OTP** → ใครก็ login ได้ถ้ารู้ phone + password
2. **ไม่มี Rate Limiting** → เสี่ยง DDoS attacks
3. **ไม่มี CSRF Protection** → เสี่ยง CSRF attacks
4. **ไม่มี Security Checks** → ระบบเปิดโล่งมาก

#### ✅ ใช้ Demo Mode เมื่อ:
- 🎭 กำลังนำเสนอให้ผู้บริหาร/นักลงทุน
- 🧪 ทดสอบ features ภายใน (local development)
- 📹 อัดวิดีโอ demo
- 🎓 ฝึกอบรมทีม

#### ❌ อย่าใช้ Demo Mode เมื่อ:
- 🚀 Deploy ไป staging/production
- 👥 เปิดให้ user จริงใช้งาน
- 🌐 เปิดให้ public access
- 💳 มีข้อมูลจริงในระบบ

### 🔒 การปิด Demo Mode

ตรวจสอบให้แน่ใจว่าปิด Demo Mode ก่อน deploy:

```bash
# ใน .env file
DEMO_MODE=false

# หรือลบบรรทัดนี้ออกไปเลย
```

### 📝 Checklist ก่อน Deploy Production

- [ ] `DEMO_MODE=false` หรือไม่มีใน .env
- [ ] ลบไฟล์ `.env.demo` ออกจาก production server
- [ ] ลบไฟล์ `test-demo-login.html` และ `test-demo-login.sh`
- [ ] ตรวจสอบ logs ว่าไม่มี "DEMO MODE" warning
- [ ] ทดสอบว่า rate limiting ทำงาน
- [ ] ทดสอบว่า CSRF protection ทำงาน
- [ ] ทดสอบว่า OTP verification ทำงาน

---

## ไฟล์ที่เกี่ยวข้อง

### 📄 Backend Files
- `backend/src/config/index.js` - Demo mode configuration
- `backend/src/controllers/authController.js` - Demo login endpoint
- `backend/src/routes/auth.js` - Demo login route
- `backend/src/middleware/rateLimiter.js` - Rate limiter bypass
- `backend/src/middleware/csrf.js` - CSRF bypass

### 📄 Test Files
- `backend/.env.demo` - Demo environment variables
- `backend/test-demo-login.html` - HTML test page
- `backend/test-demo-login.sh` - Bash test script

### 📄 Documentation
- `DEMO_MODE.md` - This file

---

## API Endpoint

### POST `/api/v1/auth/demo/login`

**Request Body:**
```json
{
  "phone": "0999999999",
  "password": "demo123",
  "deviceId": "demo-device",
  "deviceName": "Demo Device"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "csrfToken": "abc123...",
    "user": {
      "id": "uuid-here",
      "phone": "0999999999",
      "firstName": "Demo",
      "lastName": "User",
      "email": null,
      "kycStatus": "APPROVED",
      "isNewUser": false
    },
    "warning": "⚠️  DEMO MODE - All security bypassed!"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid demo credentials"
  }
}
```

**Error Response (401) - Demo Mode Disabled:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Demo mode is not enabled"
  }
}
```

---

## สรุป

Demo Mode เป็นเครื่องมือที่มีประโยชน์สำหรับการนำเสนอ แต่ **ต้องใช้ด้วยความระมัดระวัง** และ **ไม่เปิดใน production** โดยเด็ดขาด

### ข้อดี
- ✅ Login ง่ายและรวดเร็ว
- ✅ ไม่ติด rate limiting
- ✅ ไม่ต้องรอ OTP
- ✅ เหมาะสำหรับ demo/presentation

### ข้อเสีย
- ❌ ไม่มี security protection
- ❌ เสี่ยงต่อการโจมตี
- ❌ ห้ามใช้ใน production

---

**📞 ติดต่อ**
หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อทีมพัฒนา

**Last Updated:** 2026-01-22
