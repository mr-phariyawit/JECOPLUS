<template>
  <JCard selectable @click="$emit('click')">
    <div class="product-card">
      <!-- Product Image -->
      <div class="product-card__image-wrap">
        <img
          v-if="product.imageUrl"
          :src="product.imageUrl"
          :alt="product.name"
          class="product-card__image"
          @error="handleImageError"
        />
        <div v-else class="product-card__image-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>

        <!-- Badges -->
        <div class="product-card__badges">
          <JBadge
            v-if="product.isFeatured"
            label="แนะนำ"
            variant="danger"
            size="small"
          />
          <JBadge
            v-if="product.isNew"
            label="ใหม่"
            variant="success"
            size="small"
          />
          <JBadge
            v-if="isLowStock"
            label="เหลือน้อย"
            variant="warning"
            size="small"
          />
        </div>

        <!-- Stock Status -->
        <div
          v-if="product.status !== 'ACTIVE'"
          class="product-card__overlay"
        >
          <span class="product-card__overlay-text">
            {{ getStatusText(product.status) }}
          </span>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-card__info">
        <h3 class="product-card__name">{{ product.name }}</h3>
        <p v-if="product.description" class="product-card__desc">
          {{ truncateDescription(product.description) }}
        </p>

        <!-- Category -->
        <p v-if="product.categoryName" class="product-card__category">
          {{ product.categoryName }}
        </p>

        <!-- Price -->
        <div class="product-card__price-wrap">
          <p class="product-card__price">
            ฿{{ formatPrice(product.price) }}
          </p>
          <p v-if="product.compareAtPrice" class="product-card__compare-price">
            ฿{{ formatPrice(product.compareAtPrice) }}
          </p>
        </div>

        <!-- Stock Info -->
        <div v-if="showStock" class="product-card__stock">
          <div class="product-card__stock-bar">
            <div
              class="product-card__stock-fill"
              :style="{ width: `${stockPercentage}%` }"
              :class="stockBarClass"
            ></div>
          </div>
          <span class="product-card__stock-text">
            คงเหลือ {{ product.stockQuantity }} ชิ้น
          </span>
        </div>

        <!-- Rating (if available) -->
        <div v-if="product.rating" class="product-card__rating">
          <div class="product-card__stars">
            <svg
              v-for="star in 5"
              :key="star"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              :fill="star <= product.rating ? 'currentColor' : 'none'"
              :stroke="star <= product.rating ? 'currentColor' : 'currentColor'"
              stroke-width="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span class="product-card__rating-text">
            {{ product.rating.toFixed(1) }}
          </span>
          <span v-if="product.reviewCount" class="product-card__review-count">
            ({{ product.reviewCount }})
          </span>
        </div>
      </div>
    </div>
  </JCard>
</template>

<script setup>
import { computed } from 'vue';
import JCard from '@/components/base/JCard.vue';
import JBadge from '@/components/base/JBadge.vue';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  showStock: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['click']);

// Computed
const isLowStock = computed(() => {
  return props.product.stockQuantity > 0 && props.product.stockQuantity <= 10;
});

const stockPercentage = computed(() => {
  if (!props.product.initialStock) return 100;
  return (props.product.stockQuantity / props.product.initialStock) * 100;
});

const stockBarClass = computed(() => {
  const percentage = stockPercentage.value;
  if (percentage <= 20) return 'product-card__stock-fill--low';
  if (percentage <= 50) return 'product-card__stock-fill--medium';
  return 'product-card__stock-fill--high';
});

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const truncateDescription = (text) => {
  if (!text) return '';
  return text.length > 60 ? text.substring(0, 60) + '...' : text;
};

const getStatusText = (status) => {
  const statusMap = {
    OUT_OF_STOCK: 'สินค้าหมด',
    DISCONTINUED: 'ยกเลิกจำหน่าย',
    INACTIVE: 'ไม่พร้อมขาย',
  };
  return statusMap[status] || status;
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
};
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Image */
.product-card__image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-gray-1);
  margin-bottom: var(--space-sm);
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-gray-3);
}

/* Badges */
.product-card__badges {
  position: absolute;
  top: var(--space-xs);
  left: var(--space-xs);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  align-items: flex-start;
}

/* Overlay */
.product-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
}

.product-card__overlay-text {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-black);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
}

/* Info */
.product-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
}

.product-card__name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__desc {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__category {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

/* Price */
.product-card__price-wrap {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  margin-top: auto;
}

.product-card__price {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
  margin: 0;
}

.product-card__compare-price {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
  text-decoration: line-through;
  margin: 0;
}

/* Stock */
.product-card__stock {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.product-card__stock-bar {
  width: 100%;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-gray-2);
  overflow: hidden;
}

.product-card__stock-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-medium);
}

.product-card__stock-fill--high {
  background: var(--color-green);
}

.product-card__stock-fill--medium {
  background: var(--color-orange);
}

.product-card__stock-fill--low {
  background: var(--color-red);
}

.product-card__stock-text {
  font-size: var(--font-size-mini);
  color: var(--color-gray-5);
}

/* Rating */
.product-card__rating {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.product-card__stars {
  display: flex;
  gap: 2px;
  color: var(--color-orange);
}

.product-card__rating-text {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
}

.product-card__review-count {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}
</style>
