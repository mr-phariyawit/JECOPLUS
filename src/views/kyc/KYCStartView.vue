<template>
  <div class="kyc-start screen screen--no-nav">
    <JHeader title="ยืนยันตัวตน" />

    <div class="kyc-start__content">
      <div class="kyc-start__icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h2 class="kyc-start__title">ยืนยันตัวตนด้วย eKYC</h2>
      <p class="kyc-start__description">
        เพื่อความปลอดภัยในการใช้บริการ กรุณายืนยันตัวตนผ่านบัตรประชาชน และ NDID
      </p>

      <div class="kyc-start__steps">
        <div class="kyc-step">
          <div class="kyc-step__number">1</div>
          <div class="kyc-step__info">
            <div class="kyc-step__title">ถ่ายบัตรประชาชน</div>
            <div class="kyc-step__desc">ถ่ายภาพบัตรด้านหน้าและด้านหลัง</div>
          </div>
        </div>

        <div class="kyc-step">
          <div class="kyc-step__number">2</div>
          <div class="kyc-step__info">
            <div class="kyc-step__title">ถ่าย Selfie</div>
            <div class="kyc-step__desc">ถ่ายภาพใบหน้าของคุณ</div>
          </div>
        </div>

        <div class="kyc-step">
          <div class="kyc-step__number">3</div>
          <div class="kyc-step__info">
            <div class="kyc-step__title">Liveness Check</div>
            <div class="kyc-step__desc">พิสูจน์ว่าเป็นคุณจริง</div>
          </div>
        </div>

        <div class="kyc-step">
          <div class="kyc-step__number">4</div>
          <div class="kyc-step__info">
            <div class="kyc-step__title">ยืนยันผ่าน NDID</div>
            <div class="kyc-step__desc">ยืนยันตัวตนผ่านธนาคาร</div>
          </div>
        </div>
      </div>

      <div class="kyc-start__requirements">
        <p class="kyc-start__req-title">สิ่งที่ต้องเตรียม:</p>
        <ul class="kyc-start__req-list">
          <li>บัตรประชาชนตัวจริง</li>
          <li>สถานที่ที่มีแสงสว่างเพียงพอ</li>
          <li>แอปธนาคารที่เชื่อมต่อกับ NDID</li>
        </ul>
      </div>
    </div>

    <div class="kyc-start__footer">
      <JButton
        variant="primary"
        :loading="kycStore.isLoading"
        @click="startKyc"
      >
        เริ่มยืนยันตัวตน
      </JButton>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useKycStore } from '../../stores/kyc';
import JHeader from '../../components/layout/JHeader.vue';
import JButton from '../../components/base/JButton.vue';

const router = useRouter();
const kycStore = useKycStore();

const startKyc = async () => {
  const result = await kycStore.startSession();

  if (result.success) {
    router.push('/kyc/id-card');
  } else {
    alert(result.error);
  }
};
</script>

<style scoped>
.kyc-start {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.kyc-start__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg);
}

.kyc-start__icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-red) 0%, #ff6b6b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-lg);
  color: white;
}

.kyc-start__title {
  font-size: var(--font-size-subheader);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
  text-align: center;
}

.kyc-start__description {
  color: var(--color-gray-4);
  text-align: center;
  margin-bottom: var(--space-xl);
  max-width: 300px;
}

.kyc-start__steps {
  width: 100%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.kyc-step {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
}

.kyc-step__number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-red);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.kyc-step__info {
  flex: 1;
}

.kyc-step__title {
  font-weight: var(--font-weight-medium);
  margin-bottom: 2px;
}

.kyc-step__desc {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.kyc-start__requirements {
  width: 100%;
  max-width: 350px;
  padding: var(--space-md);
  background: #fff5f5;
  border-radius: var(--radius-md);
  border: 1px solid #ffe0e0;
}

.kyc-start__req-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
  color: var(--color-red);
}

.kyc-start__req-list {
  margin: 0;
  padding-left: var(--space-lg);
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
}

.kyc-start__req-list li {
  margin-bottom: var(--space-xs);
}

.kyc-start__footer {
  padding: var(--space-md);
}
</style>
