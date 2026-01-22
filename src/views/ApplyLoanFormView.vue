<template>
  <div class="apply-form screen screen--no-nav">
    <JHeader :title="loan?.name || 'สมัครสินเชื่อ'" />

    <template v-if="loan">
      <!-- Loan Info Header -->
      <div class="apply-form__header">
        <div class="loan-summary">
          <div class="loan-summary__icon" :style="{ background: loan.color }">
            {{ loan.icon }}
          </div>
          <div class="loan-summary__info">
            <h2>{{ loan.name }}</h2>
            <span class="text-small">{{ loan.provider }}</span>
          </div>
        </div>
      </div>

      <!-- Application Form Steps -->
      <div class="apply-form__content">
        <!-- Step 1: Amount & Term -->
        <section v-if="step === 1" class="form-step">
          <h3 class="step-title">1. เลือกวงเงินและระยะผ่อน</h3>

          <div class="amount-selector">
            <label class="field-label">วงเงินที่ต้องการ</label>
            <div class="amount-display">
              <span class="amount-value">฿{{ formatNumber(amount) }}</span>
            </div>
            <input 
              type="range" 
              v-model="amount"
              :min="loan.minAmount"
              :max="loan.maxAmount"
              :step="1000"
              class="amount-slider"
            />
            <div class="amount-range">
              <span>฿{{ formatNumber(loan.minAmount) }}</span>
              <span>฿{{ formatNumber(loan.maxAmount) }}</span>
            </div>
          </div>

          <div class="term-selector">
            <label class="field-label">ระยะผ่อนชำระ</label>
            <div class="term-options">
              <button 
                v-for="m in loan.termMonths"
                :key="m"
                :class="['term-btn', { 'term-btn--active': term === m }]"
                @click="term = m"
              >
                {{ m }} เดือน
              </button>
            </div>
          </div>

          <!-- Monthly Payment Preview -->
          <div class="payment-preview">
            <div class="preview-row">
              <span>ยอดผ่อนต่อเดือน (ประมาณ)</span>
              <span class="preview-amount">฿{{ formatNumber(monthlyPayment) }}</span>
            </div>
            <p class="preview-note text-mini">*อัตราดอกเบี้ย {{ loan.interestRate }} ต่อปี (คำนวณเบื้องต้น)</p>
          </div>
        </section>

        <!-- Step 2: Personal Info -->
        <section v-if="step === 2" class="form-step">
          <h3 class="step-title">2. ข้อมูลส่วนตัว</h3>

          <div class="form-fields">
            <JInput v-model="form.fullName" label="ชื่อ-นามสกุล" placeholder="สมชาย ใจดี" required />
            <JInput v-model="form.idCard" label="เลขบัตรประชาชน" placeholder="1234567890123" maxlength="13" required />
            <JInput v-model="form.phone" label="เบอร์โทรศัพท์" placeholder="0891234567" type="tel" required />
            <JInput v-model="form.email" label="อีเมล" placeholder="example@email.com" type="email" />
            <JInput v-model="form.income" label="รายได้ต่อเดือน" placeholder="25000" type="number" required />
            <JInput v-model="form.occupation" label="อาชีพ" placeholder="พนักงานบริษัท" />
          </div>
        </section>

        <!-- Step 3: Documents -->
        <section v-if="step === 3" class="form-step">
          <h3 class="step-title">3. เอกสารที่ต้องใช้</h3>

          <div class="documents-list">
            <div v-for="(doc, idx) in loan.documents" :key="idx" class="doc-item">
              <div class="doc-item__info">
                <span class="doc-item__name">{{ doc }}</span>
                <span class="doc-item__status text-mini" :class="uploadedDocs[idx] ? 'text-success' : 'text-warning'">
                  {{ uploadedDocs[idx] ? '✓ อัพโหลดแล้ว' : 'รอการอัพโหลด' }}
                </span>
              </div>
              <button class="doc-item__btn" @click="simulateUpload(idx)">
                {{ uploadedDocs[idx] ? 'เปลี่ยน' : 'อัพโหลด' }}
              </button>
            </div>
          </div>

          <div class="requirements-note">
            <h4>คุณสมบัติผู้สมัคร</h4>
            <ul>
              <li v-for="(req, idx) in loan.requirements" :key="idx">{{ req }}</li>
            </ul>
          </div>
        </section>

        <!-- Step 4: Review & Submit -->
        <section v-if="step === 4" class="form-step">
          <h3 class="step-title">4. ตรวจสอบและยืนยัน</h3>

          <div class="review-card">
            <div class="review-row">
              <span>สินเชื่อ</span>
              <span>{{ loan.name }}</span>
            </div>
            <div class="review-row">
              <span>วงเงิน</span>
              <span>฿{{ formatNumber(amount) }}</span>
            </div>
            <div class="review-row">
              <span>ระยะผ่อน</span>
              <span>{{ term }} เดือน</span>
            </div>
            <div class="review-row">
              <span>ผ่อนต่อเดือน</span>
              <span class="text-red">฿{{ formatNumber(monthlyPayment) }}</span>
            </div>
            <div class="review-divider"></div>
            <div class="review-row">
              <span>ชื่อผู้สมัคร</span>
              <span>{{ form.fullName }}</span>
            </div>
            <div class="review-row">
              <span>เบอร์โทร</span>
              <span>{{ form.phone }}</span>
            </div>
          </div>

          <div class="terms-check">
            <label class="checkbox-label">
              <input type="checkbox" v-model="acceptTerms" />
              <span>ข้าพเจ้ายอมรับ <a href="#">ข้อกำหนดและเงื่อนไข</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a></span>
            </label>
          </div>
        </section>
      </div>

      <!-- Navigation Buttons -->
      <div class="apply-form__footer">
        <div class="step-indicator">
          <span v-for="s in 4" :key="s" :class="['step-dot', { 'step-dot--active': s === step, 'step-dot--done': s < step }]"></span>
        </div>
        <div class="footer-actions">
          <JButton v-if="step > 1" variant="outline" @click="step--">
            ย้อนกลับ
          </JButton>
          <JButton 
            v-if="step < 4" 
            variant="primary" 
            @click="step++"
          >
            ถัดไป
          </JButton>
          <JButton 
            v-else 
            variant="primary" 
            :disabled="!acceptTerms"
            :loading="isSubmitting"
            @click="submitApplication"
          >
            ยืนยันสมัคร
          </JButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLoanById } from '../services/loanProducts'
import JHeader from '../components/layout/JHeader.vue'
import JButton from '../components/base/JButton.vue'
import JInput from '../components/base/JInput.vue'

const route = useRoute()
const router = useRouter()

const loan = ref(null)
const step = ref(1)
const amount = ref(0)
const term = ref(12)
const acceptTerms = ref(false)
const isSubmitting = ref(false)
const uploadedDocs = ref({})

const form = ref({
  fullName: '',
  idCard: '',
  phone: '',
  email: '',
  income: '',
  occupation: ''
})

const formatNumber = (num) => new Intl.NumberFormat('th-TH').format(num)

const monthlyPayment = computed(() => {
  if (!loan.value) return 0
  const principal = amount.value
  const rate = loan.value.interestRateValue / 12
  const n = term.value
  const payment = principal * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1)
  return Math.round(payment)
})

const simulateUpload = (idx) => {
  uploadedDocs.value[idx] = true
}

const submitApplication = async () => {
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 2000))
  isSubmitting.value = false
  
  // Navigate to success page
  router.replace('/apply/success')
}

onMounted(() => {
  const loanId = route.params.loanId
  loan.value = getLoanById(loanId)
  if (loan.value) {
    amount.value = Math.round((loan.value.minAmount + loan.value.maxAmount) / 2)
    term.value = loan.value.termMonths[Math.floor(loan.value.termMonths.length / 2)]
  }
})
</script>

<style scoped>
.apply-form__header {
  background: var(--color-gray-1);
  margin: calc(-1 * var(--space-md));
  margin-bottom: var(--space-lg);
  padding: var(--space-lg);
}

.loan-summary {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.loan-summary__icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-size: 28px;
}

.loan-summary__info h2 {
  font-size: var(--font-size-title);
}

.apply-form__content {
  flex: 1;
  padding-bottom: 160px;
}

.step-title {
  font-size: var(--font-size-body);
  margin-bottom: var(--space-lg);
  color: var(--color-black);
}

.field-label {
  display: block;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
}

.amount-selector {
  margin-bottom: var(--space-xl);
}

.amount-display {
  text-align: center;
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.amount-value {
  font-size: var(--font-size-header);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.amount-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  background: var(--color-gray-2);
  border-radius: 4px;
  outline: none;
}

.amount-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: var(--color-red);
  border-radius: 50%;
  cursor: pointer;
}

.amount-range {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-xs);
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.term-selector {
  margin-bottom: var(--space-xl);
}

.term-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.term-btn {
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.term-btn--active {
  border-color: var(--color-red);
  background: #fff5f5;
  color: var(--color-red);
}

.payment-preview {
  background: var(--color-black);
  color: var(--color-white);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
}

.preview-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.preview-amount {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
}

.preview-note {
  opacity: 0.7;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.doc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
}

.doc-item__info {
  display: flex;
  flex-direction: column;
}

.doc-item__name {
  font-weight: var(--font-weight-medium);
}

.doc-item__btn {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-red);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-red);
  cursor: pointer;
}

.requirements-note {
  padding: var(--space-md);
  background: #fffbeb;
  border-radius: var(--radius-md);
}

.requirements-note h4 {
  margin-bottom: var(--space-sm);
}

.requirements-note ul {
  padding-left: var(--space-lg);
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
}

.requirements-note li {
  margin-bottom: var(--space-xs);
}

.review-card {
  background: var(--color-gray-1);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-lg);
}

.review-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.review-row span:first-child {
  color: var(--color-gray-4);
}

.review-row span:last-child {
  font-weight: var(--font-weight-medium);
}

.review-divider {
  height: 1px;
  background: var(--color-gray-3);
  margin: var(--space-sm) 0;
}

.terms-check {
  margin-top: var(--space-md);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: var(--font-size-small);
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 2px;
}

.checkbox-label a {
  color: var(--color-red);
}

.apply-form__footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  padding: var(--space-md);
  background: var(--color-white);
  border-top: 1px solid var(--color-gray-2);
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-gray-2);
}

.step-dot--active {
  background: var(--color-red);
  width: 24px;
  border-radius: 4px;
}

.step-dot--done {
  background: var(--color-success);
}

.footer-actions {
  display: flex;
  gap: var(--space-sm);
}

.footer-actions > * {
  flex: 1;
}

.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-red { color: var(--color-red); }
</style>
