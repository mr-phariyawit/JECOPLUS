<template>
  <div class="kyc-review">
    <!-- Back Button -->
    <button class="kyc-review__back" @click="goBack">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15,18 9,12 15,6"/>
      </svg>
      <span>Back to Queue</span>
    </button>

    <div v-if="adminStore.isLoading" class="kyc-review__loading">
      <div class="kyc-review__spinner"></div>
      <span>Loading KYC data...</span>
    </div>

    <template v-else-if="kycData">
      <div class="kyc-review__grid">
        <!-- Documents Column -->
        <div class="kyc-review__documents">
          <div v-for="doc in documents" :key="doc.type" class="kyc-review__doc-card">
            <h4 class="kyc-review__doc-title">{{ getDocTitle(doc.type) }}</h4>
            <div class="kyc-review__doc-image">
              <img
                v-if="doc.url"
                :src="doc.url"
                :alt="doc.type"
                @click="openImageModal(doc)"
              />
              <div v-else class="kyc-review__doc-placeholder">
                No image
              </div>
            </div>
          </div>
        </div>

        <!-- Info Column -->
        <div class="kyc-review__info">
          <!-- User Info -->
          <div class="kyc-review__card">
            <h3 class="kyc-review__card-title">User Info</h3>
            <div class="kyc-review__row">
              <span class="kyc-review__label">Phone</span>
              <span class="kyc-review__value">{{ formatPhone(user?.phone) }}</span>
            </div>
            <div class="kyc-review__row">
              <span class="kyc-review__label">Name</span>
              <span class="kyc-review__value">{{ user?.firstName || '-' }} {{ user?.lastName || '' }}</span>
            </div>
          </div>

          <!-- OCR Data -->
          <div class="kyc-review__card">
            <h3 class="kyc-review__card-title">OCR Data</h3>
            <div class="kyc-review__row">
              <span class="kyc-review__label">Citizen ID</span>
              <span class="kyc-review__value">{{ session?.ocrResult?.citizenId || '-' }}</span>
            </div>
            <div class="kyc-review__row">
              <span class="kyc-review__label">Name (OCR)</span>
              <span class="kyc-review__value">
                {{ session?.ocrResult?.firstName || '-' }} {{ session?.ocrResult?.lastName || '' }}
              </span>
            </div>
            <div class="kyc-review__row">
              <span class="kyc-review__label">Date of Birth</span>
              <span class="kyc-review__value">{{ session?.ocrResult?.dateOfBirth || '-' }}</span>
            </div>
            <div class="kyc-review__row">
              <span class="kyc-review__label">OCR Confidence</span>
              <span class="kyc-review__value">{{ session?.ocrResult?.confidence || '-' }}%</span>
            </div>
          </div>

          <!-- Verification Scores -->
          <div class="kyc-review__card">
            <h3 class="kyc-review__card-title">Verification</h3>

            <div class="kyc-review__score-item">
              <div class="kyc-review__score-header">
                <span>Face Match</span>
                <span
                  class="kyc-review__score-badge"
                  :class="session?.faceMatch?.passed ? 'kyc-review__score-badge--pass' : 'kyc-review__score-badge--fail'"
                >
                  {{ session?.faceMatch?.passed ? 'PASS' : 'FAIL' }}
                </span>
              </div>
              <div class="kyc-review__score-bar">
                <div
                  class="kyc-review__score-fill"
                  :style="{ width: `${session?.faceMatch?.score || 0}%` }"
                  :class="{ 'kyc-review__score-fill--low': (session?.faceMatch?.score || 0) < 70 }"
                ></div>
              </div>
              <span class="kyc-review__score-value">{{ (session?.faceMatch?.score || 0).toFixed(1) }}%</span>
            </div>

            <div class="kyc-review__score-item">
              <div class="kyc-review__score-header">
                <span>Liveness</span>
                <span
                  class="kyc-review__score-badge"
                  :class="session?.liveness?.passed ? 'kyc-review__score-badge--pass' : 'kyc-review__score-badge--fail'"
                >
                  {{ session?.liveness?.passed ? 'PASS' : 'FAIL' }}
                </span>
              </div>
              <div class="kyc-review__score-bar">
                <div
                  class="kyc-review__score-fill"
                  :style="{ width: `${session?.liveness?.score || 0}%` }"
                  :class="{ 'kyc-review__score-fill--low': (session?.liveness?.score || 0) < 70 }"
                ></div>
              </div>
              <span class="kyc-review__score-value">{{ (session?.liveness?.score || 0).toFixed(1) }}%</span>
            </div>

            <div class="kyc-review__row" style="margin-top: var(--space-md)">
              <span class="kyc-review__label">NDID Verified</span>
              <span
                class="kyc-review__value"
                :class="session?.ndidVerified ? 'kyc-review__value--success' : 'kyc-review__value--error'"
              >
                {{ session?.ndidVerified ? 'Yes' : 'No' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="kyc-review__card">
            <h3 class="kyc-review__card-title">Decision</h3>

            <div class="kyc-review__field">
              <label class="kyc-review__field-label">Notes (optional)</label>
              <textarea
                v-model="notes"
                class="kyc-review__textarea"
                placeholder="Add notes..."
                rows="3"
              ></textarea>
            </div>

            <div class="kyc-review__actions">
              <button
                class="kyc-review__btn kyc-review__btn--reject"
                @click="showRejectModal = true"
              >
                Reject
              </button>
              <button
                class="kyc-review__btn kyc-review__btn--approve"
                :disabled="adminStore.isLoading"
                @click="handleApprove"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Reject Modal -->
    <AdminModal
      v-model="showRejectModal"
      title="Reject KYC"
      size="sm"
    >
      <div class="kyc-review__modal-content">
        <p>Please provide a reason for rejecting this KYC submission.</p>

        <div class="kyc-review__field">
          <label class="kyc-review__field-label">Rejection Reason *</label>
          <select v-model="rejectCode" class="kyc-review__select">
            <option value="">Select reason...</option>
            <option value="INVALID_ID">Invalid ID card</option>
            <option value="BLURRY_IMAGE">Blurry/unclear images</option>
            <option value="FACE_MISMATCH">Face doesn't match ID</option>
            <option value="LIVENESS_FAILED">Liveness check failed</option>
            <option value="NDID_FAILED">NDID verification failed</option>
            <option value="SUSPICIOUS">Suspicious activity</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div class="kyc-review__field">
          <label class="kyc-review__field-label">Additional Details</label>
          <textarea
            v-model="rejectReason"
            class="kyc-review__textarea"
            placeholder="Enter details..."
            rows="4"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button class="kyc-review__btn kyc-review__btn--secondary" @click="showRejectModal = false">
          Cancel
        </button>
        <button
          class="kyc-review__btn kyc-review__btn--reject"
          :disabled="!rejectCode"
          @click="handleReject"
        >
          Confirm Reject
        </button>
      </template>
    </AdminModal>

    <!-- Image Modal -->
    <AdminModal
      v-model="showImageModal"
      :title="selectedImage?.type ? getDocTitle(selectedImage.type) : 'Document'"
      size="lg"
    >
      <div class="kyc-review__image-modal">
        <img v-if="selectedImage?.url" :src="selectedImage.url" :alt="selectedImage.type" />
      </div>
    </AdminModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '../../stores/admin';
import AdminModal from '../../components/admin/AdminModal.vue';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const notes = ref('');
const showRejectModal = ref(false);
const rejectCode = ref('');
const rejectReason = ref('');
const showImageModal = ref(false);
const selectedImage = ref(null);

const kycData = computed(() => adminStore.selectedKyc);
const session = computed(() => kycData.value?.session);
const user = computed(() => kycData.value?.user);
const documents = computed(() => kycData.value?.documents || []);

const formatPhone = (phone) => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

const getDocTitle = (type) => {
  const titles = {
    ID_CARD_FRONT: 'ID Card (Front)',
    ID_CARD_BACK: 'ID Card (Back)',
    SELFIE: 'Selfie',
    LIVENESS_VIDEO: 'Liveness',
  };
  return titles[type] || type;
};

const goBack = () => {
  router.push('/admin/kyc');
};

const openImageModal = (doc) => {
  selectedImage.value = doc;
  showImageModal.value = true;
};

const handleApprove = async () => {
  const result = await adminStore.approveKyc(route.params.sessionId, notes.value || null);

  if (result.success) {
    router.push('/admin/kyc');
  } else {
    alert(result.error);
  }
};

const handleReject = async () => {
  const reason = [rejectCode.value, rejectReason.value].filter(Boolean).join(': ');

  const result = await adminStore.rejectKyc(route.params.sessionId, reason, rejectCode.value);

  if (result.success) {
    showRejectModal.value = false;
    router.push('/admin/kyc');
  } else {
    alert(result.error);
  }
};

onMounted(() => {
  adminStore.fetchKycDetail(route.params.sessionId);
});
</script>

<style scoped>
.kyc-review__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) 0;
  background: none;
  border: none;
  color: var(--color-gray-4);
  cursor: pointer;
  margin-bottom: var(--space-md);
}

.kyc-review__back:hover {
  color: var(--color-red);
}

.kyc-review__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
  color: var(--color-gray-4);
}

.kyc-review__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-2);
  border-top-color: var(--color-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.kyc-review__grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-lg);
}

@media (max-width: 1200px) {
  .kyc-review__grid {
    grid-template-columns: 1fr;
  }
}

.kyc-review__documents {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.kyc-review__doc-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.kyc-review__doc-title {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--space-sm);
}

.kyc-review__doc-image {
  aspect-ratio: 4/3;
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.kyc-review__doc-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.kyc-review__doc-image img:hover {
  transform: scale(1.02);
}

.kyc-review__doc-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-4);
  font-size: var(--font-size-small);
}

.kyc-review__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.kyc-review__card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.kyc-review__card-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-gray-2);
}

.kyc-review__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.kyc-review__label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.kyc-review__value {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.kyc-review__value--success {
  color: var(--color-success);
}

.kyc-review__value--error {
  color: var(--color-error);
}

.kyc-review__score-item {
  margin-bottom: var(--space-md);
}

.kyc-review__score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
  font-size: var(--font-size-small);
}

.kyc-review__score-badge {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
}

.kyc-review__score-badge--pass {
  background: #dcfce7;
  color: #166534;
}

.kyc-review__score-badge--fail {
  background: #fee2e2;
  color: #991b1b;
}

.kyc-review__score-bar {
  height: 8px;
  background: var(--color-gray-2);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-xs);
}

.kyc-review__score-fill {
  height: 100%;
  background: var(--color-success);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.kyc-review__score-fill--low {
  background: var(--color-error);
}

.kyc-review__score-value {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
}

.kyc-review__field {
  margin-bottom: var(--space-md);
}

.kyc-review__field-label {
  display: block;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-xs);
}

.kyc-review__textarea {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  resize: vertical;
}

.kyc-review__textarea:focus {
  outline: none;
  border-color: var(--color-red);
}

.kyc-review__select {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  background: white;
}

.kyc-review__actions {
  display: flex;
  gap: var(--space-sm);
}

.kyc-review__btn {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.kyc-review__btn--secondary {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.kyc-review__btn--approve {
  background: var(--color-success);
  color: white;
}

.kyc-review__btn--reject {
  background: var(--color-error);
  color: white;
}

.kyc-review__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.kyc-review__modal-content p {
  margin: 0 0 var(--space-md);
  color: var(--color-gray-4);
}

.kyc-review__image-modal {
  display: flex;
  justify-content: center;
}

.kyc-review__image-modal img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}
</style>
