# 🔧 Environment Setup Guide - Mockup ↔ API Mode

## 📖 ภาพรวม

ใช้ `.env` file ควบคุมว่าจะใช้ **Mock Data** หรือ **API จริง**

- **Development** (ทดสอบ) → ใช้ Mock Data
- **Production** (จริง) → ใช้ API

---

## 🚀 Quick Start (3 ขั้นตอน)

### 1. สร้าง .env file

สร้างไฟล์ `.env.development` ที่ root project:

```bash
# ใช้ Mock Data
VITE_MOCKUP_MODE=true
VITE_API_BASE_URL=http://localhost:3001
VITE_DEFAULT_SCENARIO=PERFECT_BORROWER
VITE_ENABLE_SCENARIO_SELECTOR=true
```

### 2. รัน Development Mode

```bash
npm run dev
```

ระบบจะ **auto-detect** ว่าใช้ mockup mode!

### 3. ตรวจสอบ Console

เปิด Browser Console (F12) จะเห็น:

```
🎭 Running in MOCKUP MODE
   → Using mock data from scenarios
   → Set VITE_MOCKUP_MODE=false to use real API
```

**เสร็จแล้ว!** ไม่ต้องแก้โค้ดอะไรเลย! ✨

---

## 📝 Environment Files

### Development (.env.development)

```env
# ใช้ Mock Data (Default สำหรับ Dev)
VITE_MOCKUP_MODE=true
VITE_API_BASE_URL=http://localhost:3001
VITE_DEFAULT_SCENARIO=PERFECT_BORROWER
VITE_ENABLE_SCENARIO_SELECTOR=true
```

### Production (.env.production)

```env
# ใช้ API จริง
VITE_MOCKUP_MODE=false
VITE_API_BASE_URL=https://api.jecoplus.com
VITE_ENABLE_SCENARIO_SELECTOR=false
```

---

## 🔄 สลับระหว่าง Mockup ↔ API

### วิธีที่ 1: แก้ .env (แนะนำ)

```bash
# เปิดไฟล์ .env.development
nano .env.development

# เปลี่ยนค่า
VITE_MOCKUP_MODE=false  # ← เปลี่ยนเป็น false

# Restart dev server
npm run dev
```

### วิธีที่ 2: Override ตอน Run

```bash
# ใช้ API จริงชั่วคราว
VITE_MOCKUP_MODE=false npm run dev

# ใช้ Mock Data
VITE_MOCKUP_MODE=true npm run dev
```

---

## 🎭 Scenario System (เฉพาะ Mockup Mode)

### ใช้งานใน Code

```javascript
import * as dataService from '@/services/dataService'

// ดู scenarios (เฉพาะ mockup mode)
const scenarios = dataService.getAvailableScenarios()
console.log(scenarios)
// Output: [
//   { id: 'PERFECT_BORROWER', name: '...', icon: '⭐' },
//   { id: 'OCCASIONAL_LATE', name: '...', icon: '⚠️' },
//   ...
// ]

// สลับ scenario
dataService.switchScenario('PERFECT_BORROWER')

// ดู scenario ปัจจุบัน
const current = dataService.getCurrentScenarioId()
console.log(current) // 'PERFECT_BORROWER'
```

### ใช้ใน Component

```vue
<template>
  <div>
    <!-- Scenario Selector (แสดงเฉพาะ mockup mode) -->
    <ScenarioSelector v-if="isMockup" />

    <!-- ข้อมูลปกติ -->
    <div v-for="loan in loans" :key="loan.loanId">
      {{ loan.productName }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLoansStore } from '@/stores/loans'
import * as dataService from '@/services/dataService'
import ScenarioSelector from '@/components/scenarios/ScenarioSelector.vue'

const loansStore = useLoansStore()

// Check mode
const isMockup = dataService.isMockupMode()

const loans = computed(() => loansStore.loans)

onMounted(async () => {
  // ใช้ function เดียวกัน ทั้ง mockup และ API
  await loansStore.fetchLoans()
})
</script>
```

---

## 📊 API Usage Examples

### ✅ ใช้แบบนี้ (ผ่าน dataService)

```javascript
import * as dataService from '@/services/dataService'

// Auto-switch ระหว่าง mockup และ API
const loans = await dataService.getUserLoans()
const loan = await dataService.getLoanById('LOAN001')
const installments = await dataService.getInstallments('LOAN001')
```

### ❌ อย่าใช้แบบนี้

```javascript
// ❌ ไม่ควร import mockDataService โดยตรง
import * as mockDataService from '@/services/mockDataService'

// ❌ ไม่ควร import api โดยตรง
import api from '@/services/api'
```

---

## 🔍 Debug & Testing

### ตรวจสอบ Mode

```javascript
import * as dataService from '@/services/dataService'

console.log('Is Mockup:', dataService.isMockupMode())
// true = mockup, false = API

console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
```

### ดู Network Requests

เปิด **Chrome DevTools > Network**:

- **Mockup Mode** → ไม่มี network requests (ใช้ local data)
- **API Mode** → เห็น requests ไปที่ API server

### Console Logs

**Mockup Mode:**
```
📦 [MOCKUP] getUserLoans
📦 [MOCKUP] getLoanById: LOAN001
```

**API Mode:**
```
🌐 [API] GET /loans
🌐 [API] GET /loans/LOAN001
```

---

## ⚙️ Advanced Configuration

### Custom Delays (Mockup Mode)

แก้ไขใน `src/services/dataService.js`:

```javascript
function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ปรับ delay ตามต้องการ
export async function getUserLoans() {
  if (IS_MOCKUP) {
    await delay(1000) // ← เปลี่ยนเป็น 1 วินาที
    return mockDataService.getUserLoans()
  }
  // ...
}
```

### Environment-Specific Settings

```env
# Development
VITE_MOCKUP_MODE=true
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEVTOOLS=true

# Staging
VITE_MOCKUP_MODE=false
VITE_API_BASE_URL=https://staging-api.jecoplus.com
VITE_ENABLE_LOGGING=true

# Production
VITE_MOCKUP_MODE=false
VITE_API_BASE_URL=https://api.jecoplus.com
VITE_ENABLE_LOGGING=false
```

---

## 📦 Build Commands

### Development Build (with Mockup)

```bash
npm run dev
```

### Production Build (without Mockup)

```bash
npm run build
```

Vite จะใช้ `.env.production` อัตโนมัติ!

### Preview Production Build

```bash
npm run build
npm run preview
```

---

## 🎯 Migration Checklist

เมื่อพร้อม deploy จริง:

- [ ] เปลี่ยน `.env.production`:
  ```env
  VITE_MOCKUP_MODE=false
  VITE_API_BASE_URL=https://api.jecoplus.com
  ```

- [ ] ตรวจสอบ API endpoints ใน `src/services/dataService.js`

- [ ] Test ทุก features ใน API mode:
  ```bash
  VITE_MOCKUP_MODE=false npm run dev
  ```

- [ ] Remove Scenario Selector จาก production UI

- [ ] Build & Deploy:
  ```bash
  npm run build
  ```

---

## 🐛 Troubleshooting

### ปัญหา: Mockup ไม่ทำงาน

**ตรวจสอบ:**
1. `.env.development` มีหรือยัง?
2. `VITE_MOCKUP_MODE=true` ถูกไหม?
3. Restart dev server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### ปัญหา: API ไม่ทำงาน

**ตรวจสอบ:**
1. `VITE_MOCKUP_MODE=false`?
2. API URL ถูกต้อง?
3. Backend server เปิดอยู่?
4. ดู Network tab ใน DevTools

### ปัญหา: Environment Variables ไม่อัพเดท

**วิธีแก้:**
```bash
# 1. Stop server
# 2. Clear cache
rm -rf node_modules/.vite
# 3. Restart
npm run dev
```

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `.env.development` | Dev configuration (mockup) |
| `.env.production` | Prod configuration (API) |
| `src/services/dataService.js` | Main API wrapper (auto-switch) |
| `src/services/mockDataService.js` | Mock data service |
| `src/services/api.js` | Real API client (axios) |
| `src/stores/loans.js` | Loans store (uses dataService) |
| `src/stores/payment.js` | Payment store (uses dataService) |

---

## ✅ Summary

**Development:**
```bash
VITE_MOCKUP_MODE=true → ใช้ Mock Data → 10 Scenarios พร้อมใช้งาน
```

**Production:**
```bash
VITE_MOCKUP_MODE=false → ใช้ API จริง → เชื่อมต่อ Backend
```

**แค่เปลี่ยน 1 บรรทัดใน .env ทั้งระบบสลับ!** 🎉

---

**Need Help?** อ่าน [SCENARIOS_README.md](SCENARIOS_README.md) สำหรับรายละเอียดเพิ่มเติม
