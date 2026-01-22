<template>
  <div class="success screen screen--no-nav screen--center">
    <div class="success__content animate-slideUp">
      <div class="success__icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="var(--color-success)"/>
          <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h1 class="success__title">ส่งคำขอสำเร็จ!</h1>
      <p class="success__subtitle">การสมัครสินเชื่อของคุณอยู่ระหว่างการพิจารณา</p>

      <div class="success__info">
        <div class="info-row">
          <span>หมายเลขคำขอ</span>
          <span class="info-value">JM{{ Date.now().toString().slice(-8) }}</span>
        </div>
        <div class="info-row">
          <span>สถานะ</span>
          <JBadge label="รอพิจารณา" variant="warning" />
        </div>
        <div class="info-row">
          <span>ระยะเวลาพิจารณา</span>
          <span class="info-value">1-3 วันทำการ</span>
        </div>
      </div>

      <div class="success__notice">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p class="text-small">เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันข้อมูลภายใน 24 ชั่วโมง</p>
      </div>
    </div>

    <div class="success__footer">
      <JButton variant="primary" @click="$router.replace('/dashboard')">
        กลับหน้าหลัก
      </JButton>
      <JButton variant="outline" @click="$router.replace('/loans')">
        ดูสินเชื่อของฉัน
      </JButton>
    </div>
  </div>
</template>

<script setup>
import JButton from '../components/base/JButton.vue'
import JBadge from '../components/base/JBadge.vue'
</script>

<style scoped>
.success {
  padding: var(--space-xl) var(--space-md);
}

.success__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.success__icon {
  margin-bottom: var(--space-lg);
}

.success__title {
  font-size: var(--font-size-subheader);
  margin-bottom: var(--space-xs);
}

.success__subtitle {
  color: var(--color-gray-4);
  margin-bottom: var(--space-xl);
}

.success__info {
  width: 100%;
  background: var(--color-gray-1);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
}

.info-row span:first-child {
  color: var(--color-gray-4);
}

.info-value {
  font-weight: var(--font-weight-medium);
}

.success__notice {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: #fef3c7;
  border-radius: var(--radius-md);
  color: #92400e;
  text-align: left;
}

.success__footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-xl);
}
</style>
