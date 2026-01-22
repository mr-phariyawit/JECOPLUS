<template>
  <div class="document-viewer">
    <!-- Header -->
    <div class="document-viewer__header">
      <h3 class="document-viewer__title">{{ title }}</h3>
      <div class="document-viewer__actions">
        <button
          v-if="showDownload"
          @click="downloadDocument"
          class="document-viewer__btn document-viewer__btn--download"
          :disabled="loading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download
        </button>
        <button
          @click="$emit('close')"
          class="document-viewer__btn document-viewer__btn--close"
          aria-label="Close viewer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="document-viewer__loading">
      <div class="document-viewer__spinner"></div>
      <span>Loading document...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="document-viewer__error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p>{{ error }}</p>
      <button @click="retry" class="document-viewer__btn">Retry</button>
    </div>

    <!-- Document Content -->
    <div v-else class="document-viewer__content">
      <!-- Image -->
      <img
        v-if="documentType === 'image'"
        :src="url"
        :alt="title"
        class="document-viewer__image"
        @error="handleImageError"
      />

      <!-- PDF -->
      <iframe
        v-else-if="documentType === 'pdf'"
        :src="url"
        class="document-viewer__iframe"
        frameborder="0"
        @error="handlePdfError"
      ></iframe>

      <!-- Unsupported Type -->
      <div v-else class="document-viewer__unsupported">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
        <p>Document type not supported for preview</p>
        <button
          v-if="showDownload"
          @click="downloadDocument"
          class="document-viewer__btn"
        >
          Download Document
        </button>
      </div>
    </div>

    <!-- Document Info -->
    <div v-if="!loading && !error && metadata" class="document-viewer__metadata">
      <div class="document-viewer__meta-item">
        <span class="document-viewer__meta-label">File Type:</span>
        <span class="document-viewer__meta-value">{{ metadata.type || '-' }}</span>
      </div>
      <div class="document-viewer__meta-item">
        <span class="document-viewer__meta-label">Uploaded:</span>
        <span class="document-viewer__meta-value">{{ formatDate(metadata.uploadedAt) }}</span>
      </div>
      <div v-if="metadata.size" class="document-viewer__meta-item">
        <span class="document-viewer__meta-label">Size:</span>
        <span class="document-viewer__meta-value">{{ formatFileSize(metadata.size) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Document Viewer',
  },
  type: {
    type: String,
    default: '',
  },
  showDownload: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'download']);

const loading = ref(true);
const error = ref(null);

// Determine document type
const documentType = computed(() => {
  if (props.type) {
    if (props.type.includes('image')) return 'image';
    if (props.type.includes('pdf')) return 'pdf';
  }

  // Fallback to URL extension
  const url = props.url.toLowerCase();
  if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/)) return 'image';
  if (url.match(/\.pdf(\?.*)?$/)) return 'pdf';

  return 'unknown';
});

onMounted(() => {
  // Simulate loading delay
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

const handleImageError = () => {
  error.value = 'Failed to load image. The file may be corrupted or unavailable.';
  loading.value = false;
};

const handlePdfError = () => {
  error.value = 'Failed to load PDF. The file may be corrupted or unavailable.';
  loading.value = false;
};

const retry = () => {
  error.value = null;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const downloadDocument = () => {
  // Open in new tab for download
  window.open(props.url, '_blank');
  emit('download', props.url);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '-';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
</script>

<style scoped>
.document-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Header */
.document-viewer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
  background: var(--color-gray-1);
}

.document-viewer__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.document-viewer__actions {
  display: flex;
  gap: var(--space-sm);
}

.document-viewer__btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-gray-3);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-black);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.document-viewer__btn:hover:not(:disabled) {
  background: var(--color-gray-1);
  border-color: var(--color-gray-4);
}

.document-viewer__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.document-viewer__btn--download {
  border-color: var(--color-red);
  color: var(--color-red);
}

.document-viewer__btn--download:hover:not(:disabled) {
  background: var(--color-red);
  color: var(--color-white);
}

.document-viewer__btn--close {
  padding: var(--space-xs);
  border-color: transparent;
}

/* Loading */
.document-viewer__loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-xl);
}

.document-viewer__spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-2);
  border-top-color: var(--color-red);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.document-viewer__error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-xl);
  text-align: center;
}

.document-viewer__error svg {
  color: var(--color-red);
}

/* Content */
.document-viewer__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  background: var(--color-gray-1);
}

.document-viewer__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.document-viewer__iframe {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.document-viewer__unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl);
  text-align: center;
}

.document-viewer__unsupported svg {
  color: var(--color-gray-4);
}

/* Metadata */
.document-viewer__metadata {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-md);
  border-top: 1px solid var(--color-gray-2);
  background: var(--color-gray-1);
  font-size: var(--font-size-small);
}

.document-viewer__meta-item {
  display: flex;
  gap: var(--space-xs);
}

.document-viewer__meta-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-5);
}

.document-viewer__meta-value {
  color: var(--color-black);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .document-viewer__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .document-viewer__actions {
    width: 100%;
    justify-content: flex-end;
  }

  .document-viewer__metadata {
    flex-direction: column;
    gap: var(--space-xs);
  }

  .document-viewer__iframe {
    min-height: 400px;
  }
}
</style>
