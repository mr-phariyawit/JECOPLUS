<template>
  <div class="kyc-ocr-confirm screen screen--no-nav">
    <JHeader title="ยืนยันข้อมูล" />

    <div class="kyc-ocr-confirm__content">
      <div class="kyc-ocr-confirm__info-box">
        <div class="info-icon">📋</div>
        <p class="info-text">กรุณาตรวจสอบความถูกต้องของข้อมูล หากข้อมูลไม่ถูกต้อง สามารถแก้ไขได้</p>
      </div>

      <!-- Captured ID Card Preview -->
      <div v-if="kycStore.session?.idCardImageUrl" class="kyc-ocr-confirm__preview">
        <img :src="kycStore.session.idCardImageUrl" alt="ID Card" class="preview-image" />
      </div>

      <!-- OCR Confidence Score -->
      <div v-if="confidence" class="kyc-ocr-confirm__confidence">
        <span class="confidence-label">ความแม่นยำ:</span>
        <span class="confidence-value" :class="confidenceClass">{{ confidence }}%</span>
      </div>

      <!-- Editable Form -->
      <form @submit.prevent="handleConfirm" class="kyc-ocr-confirm__form">
        <!-- First Name -->
        <div class="form-group">
          <label for="firstName" class="form-label">
            ชื่อ <span class="required">*</span>
          </label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.firstName }"
            placeholder="ชื่อ"
            @input="clearFieldError('firstName')"
          />
          <span v-if="errors.firstName" class="form-error">{{ errors.firstName }}</span>
        </div>

        <!-- Last Name -->
        <div class="form-group">
          <label for="lastName" class="form-label">
            นามสกุล <span class="required">*</span>
          </label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.lastName }"
            placeholder="นามสกุล"
            @input="clearFieldError('lastName')"
          />
          <span v-if="errors.lastName" class="form-error">{{ errors.lastName }}</span>
        </div>

        <!-- Citizen ID -->
        <div class="form-group">
          <label for="citizenId" class="form-label">
            เลขบัตรประชาชน <span class="required">*</span>
          </label>
          <input
            id="citizenId"
            v-model="formData.citizenId"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.citizenId }"
            placeholder="X-XXXX-XXXXX-XX-X"
            maxlength="17"
            @input="formatCitizenIdInput"
          />
          <span v-if="errors.citizenId" class="form-error">{{ errors.citizenId }}</span>
          <span v-else class="form-hint">รูปแบบ: X-XXXX-XXXXX-XX-X (13 หลัก)</span>
        </div>

        <!-- Date of Birth -->
        <div class="form-group">
          <label for="birthDate" class="form-label">
            วันเดือนปีเกิด <span class="required">*</span>
          </label>
          <input
            id="birthDate"
            v-model="formData.birthDate"
            type="date"
            class="form-input"
            :class="{ 'form-input--error': errors.birthDate }"
            :max="maxBirthDate"
            @input="clearFieldError('birthDate')"
          />
          <span v-if="errors.birthDate" class="form-error">{{ errors.birthDate }}</span>
        </div>

        <!-- Address (Optional) -->
        <div v-if="formData.address" class="form-group">
          <label for="address" class="form-label">
            ที่อยู่
          </label>
          <textarea
            id="address"
            v-model="formData.address"
            class="form-input form-textarea"
            rows="3"
            placeholder="ที่อยู่ตามบัตรประชาชน"
          ></textarea>
        </div>

        <!-- Was Edited Notice -->
        <div v-if="wasEdited" class="kyc-ocr-confirm__edited-notice">
          <span class="icon">✏️</span>
          <span>คุณได้แก้ไขข้อมูลแล้ว กรุณาตรวจสอบให้แน่ใจก่อนยืนยัน</span>
        </div>
      </form>
    </div>

    <div class="kyc-ocr-confirm__footer">
      <JButton variant="secondary" @click="handleReupload">
        ถ่ายใหม่
      </JButton>
      <JButton
        variant="primary"
        :loading="kycStore.isLoading"
        :disabled="!isFormValid"
        @click="handleConfirm"
      >
        ยืนยันข้อมูล
      </JButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useKycStore } from '../../stores/kyc';
import JHeader from '../../components/layout/JHeader.vue';
import JButton from '../../components/base/JButton.vue';

const router = useRouter();
const kycStore = useKycStore();

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  citizenId: '',
  birthDate: '',
  address: '',
});

// Original data for comparison
const originalData = ref({});

// Errors
const errors = ref({});

// Confidence score (if available from OCR)
const confidence = ref(null);

// Max birth date (must be at least 18 years old)
const maxBirthDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
});

// Check if form was edited
const wasEdited = computed(() => {
  return (
    formData.value.firstName !== originalData.value.firstName ||
    formData.value.lastName !== originalData.value.lastName ||
    formData.value.citizenId.replace(/[-\s]/g, '') !== originalData.value.citizenId ||
    formData.value.birthDate !== originalData.value.birthDate
  );
});

// Confidence class
const confidenceClass = computed(() => {
  if (!confidence.value) return '';
  if (confidence.value >= 90) return 'confidence-value--high';
  if (confidence.value >= 70) return 'confidence-value--medium';
  return 'confidence-value--low';
});

// Form validation
const isFormValid = computed(() => {
  const cleanId = formData.value.citizenId.replace(/[-\s]/g, '');
  return (
    formData.value.firstName.trim().length > 0 &&
    formData.value.lastName.trim().length > 0 &&
    cleanId.length === 13 &&
    /^\d{13}$/.test(cleanId) &&
    formData.value.birthDate.length > 0
  );
});

// Format citizen ID with dashes
const formatCitizenIdInput = (e) => {
  clearFieldError('citizenId');

  // Remove all non-digit characters
  let value = e.target.value.replace(/\D/g, '');

  // Limit to 13 digits
  value = value.substring(0, 13);

  // Format: X-XXXX-XXXXX-XX-X
  if (value.length > 0) {
    let formatted = value[0];
    if (value.length > 1) formatted += '-' + value.substring(1, 5);
    if (value.length > 5) formatted += '-' + value.substring(5, 10);
    if (value.length > 10) formatted += '-' + value.substring(10, 12);
    if (value.length > 12) formatted += '-' + value[12];
    formData.value.citizenId = formatted;
  } else {
    formData.value.citizenId = '';
  }
};

// Clear field error
const clearFieldError = (field) => {
  delete errors.value[field];
};

// Validate form
const validateForm = () => {
  errors.value = {};

  if (!formData.value.firstName.trim()) {
    errors.value.firstName = 'กรุณากรอกชื่อ';
  }

  if (!formData.value.lastName.trim()) {
    errors.value.lastName = 'กรุณากรอกนามสกุล';
  }

  const cleanId = formData.value.citizenId.replace(/[-\s]/g, '');
  if (!cleanId) {
    errors.value.citizenId = 'กรุณากรอกเลขบัตรประชาชน';
  } else if (cleanId.length !== 13) {
    errors.value.citizenId = 'เลขบัตรประชาชนต้องมี 13 หลัก';
  } else if (!/^\d{13}$/.test(cleanId)) {
    errors.value.citizenId = 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น';
  }

  if (!formData.value.birthDate) {
    errors.value.birthDate = 'กรุณาเลือกวันเกิด';
  } else {
    const birthYear = new Date(formData.value.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      errors.value.birthDate = 'ต้องมีอายุอย่างน้อย 18 ปี';
    }
  }

  return Object.keys(errors.value).length === 0;
};

// Handle confirm
const handleConfirm = async () => {
  if (!validateForm()) {
    return;
  }

  // Update OCR data in store
  const cleanId = formData.value.citizenId.replace(/[-\s]/g, '');
  kycStore.ocrResult = {
    ...kycStore.ocrResult,
    firstName: formData.value.firstName.trim(),
    lastName: formData.value.lastName.trim(),
    citizenId: cleanId,
    idNumber: cleanId, // Alias
    birthDate: formData.value.birthDate,
    address: formData.value.address?.trim() || '',
    wasEdited: wasEdited.value,
  };

  // Navigate to next step (selfie)
  router.push('/kyc/selfie');
};

// Handle re-upload
const handleReupload = () => {
  // Go back to ID card upload
  router.push('/kyc/id-card');
};

// Initialize form
onMounted(() => {
  // Check if OCR result exists
  if (!kycStore.ocrResult) {
    // No OCR data, redirect back
    router.replace('/kyc/id-card');
    return;
  }

  // Populate form with OCR data
  const ocr = kycStore.ocrResult;
  formData.value = {
    firstName: ocr.firstName || '',
    lastName: ocr.lastName || '',
    citizenId: formatCitizenId(ocr.citizenId || ocr.idNumber || ''),
    birthDate: ocr.birthDate || '',
    address: ocr.address || '',
  };

  // Store original data
  originalData.value = {
    firstName: ocr.firstName || '',
    lastName: ocr.lastName || '',
    citizenId: ocr.citizenId || ocr.idNumber || '',
    birthDate: ocr.birthDate || '',
  };

  // Set confidence if available
  if (ocr.confidence) {
    confidence.value = Math.round(ocr.confidence * 100);
  }
});

// Helper: Format citizen ID
const formatCitizenId = (id) => {
  if (!id) return '';
  const clean = id.replace(/\D/g, '');
  if (clean.length !== 13) return id;
  return `${clean[0]}-${clean.substring(1, 5)}-${clean.substring(5, 10)}-${clean.substring(10, 12)}-${clean[12]}`;
};
</script>

<style scoped>
.kyc-ocr-confirm {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-background, #f5f5f5);
}

.kyc-ocr-confirm__content {
  flex: 1;
  padding: var(--space-md, 16px);
  overflow-y: auto;
}

.kyc-ocr-confirm__info-box {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm, 8px);
  padding: var(--space-md, 16px);
  background: #e3f2fd;
  border-radius: var(--radius-md, 12px);
  border-left: 4px solid #2196f3;
  margin-bottom: var(--space-lg, 24px);
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.info-text {
  font-size: var(--font-size-small, 14px);
  color: #1976d2;
  line-height: 1.5;
  margin: 0;
}

.kyc-ocr-confirm__preview {
  width: 100%;
  max-width: 400px;
  margin: 0 auto var(--space-lg, 24px);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.kyc-ocr-confirm__confidence {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm, 8px);
  margin-bottom: var(--space-lg, 24px);
  font-size: var(--font-size-small, 14px);
}

.confidence-label {
  color: var(--color-text-secondary, #666);
}

.confidence-value {
  font-weight: var(--font-weight-bold, 700);
  padding: 4px 12px;
  border-radius: var(--radius-sm, 6px);
}

.confidence-value--high {
  background: #d4edda;
  color: #155724;
}

.confidence-value--medium {
  background: #fff3cd;
  color: #856404;
}

.confidence-value--low {
  background: #f8d7da;
  color: #721c24;
}

.kyc-ocr-confirm__form {
  background: white;
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-lg, 24px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: var(--space-lg, 24px);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: var(--font-size-small, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary, #333);
  margin-bottom: var(--space-xs, 4px);
}

.required {
  color: var(--color-error, #f44336);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: var(--font-size-base, 16px);
  border: 2px solid #e0e0e0;
  border-radius: var(--radius-md, 12px);
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #007bff);
}

.form-input--error {
  border-color: var(--color-error, #f44336);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-error {
  display: block;
  font-size: var(--font-size-small, 14px);
  color: var(--color-error, #f44336);
  margin-top: var(--space-xs, 4px);
}

.form-hint {
  display: block;
  font-size: var(--font-size-small, 14px);
  color: var(--color-text-secondary, #666);
  margin-top: var(--space-xs, 4px);
}

.kyc-ocr-confirm__edited-notice {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  padding: var(--space-md, 16px);
  background: #fff3e0;
  border-radius: var(--radius-md, 12px);
  border-left: 4px solid #ff9800;
  margin-top: var(--space-lg, 24px);
  font-size: var(--font-size-small, 14px);
  color: #e65100;
}

.kyc-ocr-confirm__footer {
  display: flex;
  gap: var(--space-md, 16px);
  padding: var(--space-md, 16px);
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.kyc-ocr-confirm__footer > * {
  flex: 1;
}

/* Responsive */
@media (max-width: 480px) {
  .kyc-ocr-confirm__content {
    padding: var(--space-sm, 8px);
  }

  .kyc-ocr-confirm__form {
    padding: var(--space-md, 16px);
  }
}
</style>
