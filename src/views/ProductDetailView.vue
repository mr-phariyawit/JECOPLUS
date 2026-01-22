<template>
  <div class="product-detail screen">
    <!-- Loading State -->
    <div v-if="isLoading" class="product-detail__loading">
      <div class="skeleton" style="height: 300px; margin-bottom: 16px;"></div>
      <div class="skeleton" style="height: 40px; margin-bottom: 12px; width: 70%;"></div>
      <div class="skeleton" style="height: 60px; margin-bottom: 16px; width: 40%;"></div>
      <div class="skeleton" style="height: 200px;"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="product-detail__error">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p class="product-detail__error-title">ไม่พบสินค้า</p>
      <p class="product-detail__error-text">{{ error }}</p>
      <button class="btn btn--primary" @click="goBack">กลับไปหน้าแรก</button>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="product-detail__content">
      <!-- Back Button -->
      <button class="product-detail__back" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        กลับ
      </button>

      <!-- Product Images -->
      <section class="product-detail__images">
        <div class="product-detail__image-main">
          <img
            :src="currentImage"
            :alt="product.name"
            class="product-detail__image"
            @error="handleImageError"
          />
          <!-- Badges -->
          <div class="product-detail__badges">
            <JBadge
              v-if="product.isFeatured"
              label="แนะนำ"
              variant="danger"
            />
            <JBadge
              v-if="product.isNew"
              label="ใหม่"
              variant="success"
            />
          </div>
        </div>

        <!-- Image Thumbnails (if multiple images) -->
        <div v-if="product.images && product.images.length > 1" class="product-detail__thumbnails">
          <button
            v-for="(image, index) in product.images"
            :key="index"
            class="product-detail__thumbnail"
            :class="{ 'product-detail__thumbnail--active': currentImage === image }"
            @click="currentImage = image"
          >
            <img :src="image" :alt="`${product.name} ${index + 1}`" />
          </button>
        </div>
      </section>

      <!-- Product Info -->
      <section class="product-detail__info">
        <!-- Category & Code -->
        <div class="product-detail__meta">
          <span v-if="product.categoryName" class="product-detail__category">
            {{ product.categoryName }}
          </span>
          <span v-if="product.code" class="product-detail__code">
            รหัส: {{ product.code }}
          </span>
        </div>

        <!-- Product Name -->
        <h1 class="product-detail__name">{{ product.name }}</h1>

        <!-- Rating (if available) -->
        <div v-if="product.rating" class="product-detail__rating">
          <div class="product-detail__stars">
            <svg
              v-for="star in 5"
              :key="star"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              :fill="star <= product.rating ? 'currentColor' : 'none'"
              :stroke="star <= product.rating ? 'currentColor' : 'currentColor'"
              stroke-width="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span class="product-detail__rating-text">{{ product.rating.toFixed(1) }}</span>
          <span v-if="product.reviewCount" class="product-detail__review-count">
            ({{ product.reviewCount }} รีวิว)
          </span>
        </div>

        <!-- Price -->
        <div class="product-detail__price-section">
          <p class="product-detail__price">฿{{ formatPrice(product.price) }}</p>
          <p v-if="product.compareAtPrice" class="product-detail__compare-price">
            ฿{{ formatPrice(product.compareAtPrice) }}
          </p>
          <span v-if="discount" class="product-detail__discount">
            ประหยัด {{ discount }}%
          </span>
        </div>

        <!-- Stock Status -->
        <div class="product-detail__stock">
          <div
            class="product-detail__stock-indicator"
            :class="stockStatusClass"
          ></div>
          <span class="product-detail__stock-text">{{ stockStatusText }}</span>
        </div>

        <!-- Quantity Selector -->
        <div v-if="product.status === 'ACTIVE'" class="product-detail__quantity">
          <label class="product-detail__quantity-label">จำนวน</label>
          <div class="product-detail__quantity-controls">
            <button
              class="product-detail__quantity-btn"
              :disabled="quantity <= 1"
              @click="decrementQuantity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <input
              v-model.number="quantity"
              type="number"
              class="product-detail__quantity-input"
              min="1"
              :max="product.stockQuantity"
            />
            <button
              class="product-detail__quantity-btn"
              :disabled="quantity >= product.stockQuantity"
              @click="incrementQuantity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <span class="product-detail__quantity-stock">
            มีสินค้า {{ product.stockQuantity }} ชิ้น
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="product-detail__actions">
          <button
            class="btn btn--primary product-detail__add-cart"
            :disabled="product.status !== 'ACTIVE'"
            @click="addToCart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 2L7 6M17 2l2 4M21 6H3m18 0l-2 13H5L3 6h18zM10 11v3m4-3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            เพิ่มลงตะกร้า
          </button>
          <button
            class="btn btn--outline product-detail__buy-now"
            :disabled="product.status !== 'ACTIVE'"
            @click="buyNow"
          >
            ซื้อเลย
          </button>
        </div>

        <!-- Share & Favorite -->
        <div class="product-detail__secondary-actions">
          <button class="product-detail__action-btn" @click="toggleFavorite">
            <svg width="20" height="20" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            {{ isFavorite ? 'ถูกใจแล้ว' : 'ถูกใจ' }}
          </button>
          <button class="product-detail__action-btn" @click="shareProduct">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98"/>
            </svg>
            แชร์
          </button>
        </div>
      </section>

      <!-- Product Details Tabs -->
      <section class="product-detail__tabs">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tabs__btn"
            :class="{ 'tabs__btn--active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="product-detail__tab-content">
          <!-- Description Tab -->
          <div v-if="activeTab === 'description'" class="tab-panel">
            <div class="product-detail__description" v-html="formattedDescription"></div>
          </div>

          <!-- Specifications Tab -->
          <div v-if="activeTab === 'specs'" class="tab-panel">
            <div v-if="specifications.length" class="product-detail__specs">
              <div
                v-for="(spec, index) in specifications"
                :key="index"
                class="product-detail__spec-item"
              >
                <span class="product-detail__spec-label">{{ spec.label }}</span>
                <span class="product-detail__spec-value">{{ spec.value }}</span>
              </div>
            </div>
            <div v-else class="product-detail__no-data">
              <p>ไม่มีข้อมูลสเปค</p>
            </div>
          </div>

          <!-- Reviews Tab -->
          <div v-if="activeTab === 'reviews'" class="tab-panel">
            <div class="product-detail__reviews">
              <p class="product-detail__no-data">ยังไม่มีรีวิว</p>
              <button class="btn btn--outline">เขียนรีวิว</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <section v-if="relatedProducts.length" class="product-detail__related section">
        <h2 class="section-title">สินค้าที่เกี่ยวข้อง</h2>
        <div class="product-detail__related-grid">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :product="relatedProduct"
            @click="goToProduct(relatedProduct.id)"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import JBadge from '@/components/base/JBadge.vue';
import ProductCard from '@/components/marketplace/ProductCard.vue';
import { useMarketplaceStore } from '@/stores/marketplace';

const route = useRoute();
const router = useRouter();
const marketplaceStore = useMarketplaceStore();

// State
const product = ref(null);
const isLoading = ref(true);
const error = ref(null);
const quantity = ref(1);
const currentImage = ref('');
const activeTab = ref('description');
const isFavorite = ref(false);
const relatedProducts = ref([]);

const tabs = [
  { id: 'description', label: 'รายละเอียด' },
  { id: 'specs', label: 'สเปค' },
  { id: 'reviews', label: 'รีวิว' },
];

// Computed
const discount = computed(() => {
  if (!product.value?.compareAtPrice || !product.value?.price) return 0;
  return Math.round(((product.value.compareAtPrice - product.value.price) / product.value.compareAtPrice) * 100);
});

const stockStatusClass = computed(() => {
  if (!product.value) return '';
  if (product.value.status !== 'ACTIVE') return 'product-detail__stock-indicator--out';
  if (product.value.stockQuantity <= 10) return 'product-detail__stock-indicator--low';
  return 'product-detail__stock-indicator--in';
});

const stockStatusText = computed(() => {
  if (!product.value) return '';
  if (product.value.status === 'OUT_OF_STOCK') return 'สินค้าหมด';
  if (product.value.status === 'DISCONTINUED') return 'ยกเลิกจำหน่าย';
  if (product.value.status === 'INACTIVE') return 'ไม่พร้อมขาย';
  if (product.value.stockQuantity <= 10) return 'เหลือน้อย';
  return 'พร้อมส่ง';
});

const formattedDescription = computed(() => {
  if (!product.value?.description) return '';
  // Convert newlines to <br> and preserve formatting
  return product.value.description.replace(/\n/g, '<br>');
});

const specifications = computed(() => {
  if (!product.value?.specifications) return [];
  // Parse specifications from object or string
  if (typeof product.value.specifications === 'object') {
    return Object.entries(product.value.specifications).map(([label, value]) => ({
      label,
      value: String(value),
    }));
  }
  return [];
});

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const incrementQuantity = () => {
  if (quantity.value < product.value.stockQuantity) {
    quantity.value++;
  }
};

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const addToCart = () => {
  // TODO: Implement cart functionality
  console.log('Add to cart:', { product: product.value, quantity: quantity.value });
  alert(`เพิ่ม ${product.value.name} จำนวน ${quantity.value} ชิ้นลงตะกร้าแล้ว`);
};

const buyNow = () => {
  // TODO: Implement buy now functionality
  console.log('Buy now:', { product: product.value, quantity: quantity.value });
  router.push('/cart');
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // TODO: Implement favorite functionality
};

const shareProduct = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: product.value.name,
        text: product.value.description,
        url: window.location.href,
      });
    } catch (err) {
      console.log('Share failed:', err);
    }
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert('คัดลอกลิงก์แล้ว');
  }
};

const goBack = () => {
  router.back();
};

const goToProduct = (productId) => {
  router.push(`/marketplace/product/${productId}`);
  // Reload product data
  loadProduct();
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
};

const loadProduct = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const productId = route.params.productId;
    const loadedProduct = await marketplaceStore.fetchProduct(productId);

    product.value = loadedProduct;

    // Set initial image
    if (loadedProduct.imageUrl) {
      currentImage.value = loadedProduct.imageUrl;
    } else if (loadedProduct.images && loadedProduct.images.length > 0) {
      currentImage.value = loadedProduct.images[0];
    }

    // Load related products
    // TODO: Implement related products API
    relatedProducts.value = [];
  } catch (err) {
    error.value = err.message || 'ไม่สามารถโหลดข้อมูลสินค้าได้';
    console.error('Error loading product:', err);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
.product-detail {
  padding-bottom: 80px;
}

/* Loading & Error */
.product-detail__loading,
.product-detail__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--space-xl);
}

.product-detail__error svg {
  color: var(--color-gray-4);
  margin-bottom: var(--space-md);
}

.product-detail__error-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-xs);
}

.product-detail__error-text {
  color: var(--color-gray-5);
  margin-bottom: var(--space-lg);
}

/* Content */
.product-detail__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Back Button */
.product-detail__back {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: var(--color-black);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.product-detail__back:hover {
  color: var(--color-red);
}

/* Images */
.product-detail__images {
  position: relative;
  padding: 0 var(--space-md);
}

.product-detail__image-main {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-gray-1);
  margin-bottom: var(--space-md);
}

.product-detail__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-detail__badges {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.product-detail__thumbnails {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.product-detail__thumbnails::-webkit-scrollbar {
  display: none;
}

.product-detail__thumbnail {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border: 2px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-white);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.product-detail__thumbnail:hover {
  border-color: var(--color-gray-3);
}

.product-detail__thumbnail--active {
  border-color: var(--color-red);
}

.product-detail__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Info */
.product-detail__info {
  padding: 0 var(--space-md);
}

.product-detail__meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-small);
}

.product-detail__category {
  color: var(--color-red);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.product-detail__code {
  color: var(--color-gray-4);
}

.product-detail__name {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
  line-height: 1.3;
}

.product-detail__rating {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.product-detail__stars {
  display: flex;
  gap: 2px;
  color: var(--color-orange);
}

.product-detail__rating-text {
  font-weight: var(--font-weight-semibold);
}

.product-detail__review-count {
  color: var(--color-gray-4);
}

.product-detail__price-section {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.product-detail__price {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
  margin: 0;
}

.product-detail__compare-price {
  font-size: var(--font-size-lg);
  color: var(--color-gray-4);
  text-decoration: line-through;
  margin: 0;
}

.product-detail__discount {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--color-red);
  color: var(--color-white);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
}

.product-detail__stock {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.product-detail__stock-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.product-detail__stock-indicator--in {
  background: var(--color-green);
}

.product-detail__stock-indicator--low {
  background: var(--color-orange);
}

.product-detail__stock-indicator--out {
  background: var(--color-gray-3);
}

.product-detail__stock-text {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}

.product-detail__quantity {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.product-detail__quantity-label {
  font-weight: var(--font-weight-semibold);
}

.product-detail__quantity-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.product-detail__quantity-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-gray-3);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-black);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.product-detail__quantity-btn:hover:not(:disabled) {
  background: var(--color-gray-1);
}

.product-detail__quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-detail__quantity-input {
  width: 60px;
  height: 36px;
  padding: 0 var(--space-sm);
  border: 1px solid var(--color-gray-3);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: var(--font-size-body);
}

.product-detail__quantity-stock {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
}

.product-detail__actions {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.product-detail__add-cart,
.product-detail__buy-now {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
}

.product-detail__secondary-actions {
  display: flex;
  gap: var(--space-sm);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-gray-2);
}

.product-detail__action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border: 1px solid var(--color-gray-3);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-black);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.product-detail__action-btn:hover {
  background: var(--color-gray-1);
}

/* Tabs */
.product-detail__tabs {
  padding: 0 var(--space-md);
}

.tabs {
  display: flex;
  gap: var(--space-sm);
  border-bottom: 2px solid var(--color-gray-2);
  margin-bottom: var(--space-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tabs__btn {
  flex-shrink: 0;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: var(--color-gray-5);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--transition-fast);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tabs__btn:hover {
  color: var(--color-black);
}

.tabs__btn--active {
  color: var(--color-red);
  border-bottom-color: var(--color-red);
  font-weight: var(--font-weight-semibold);
}

.tab-panel {
  min-height: 200px;
}

.product-detail__description {
  line-height: 1.6;
  color: var(--color-gray-6);
  white-space: pre-line;
}

.product-detail__specs {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.product-detail__spec-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm);
  border-bottom: 1px solid var(--color-gray-2);
}

.product-detail__spec-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-5);
}

.product-detail__spec-value {
  color: var(--color-black);
  text-align: right;
}

.product-detail__no-data {
  text-align: center;
  color: var(--color-gray-4);
  padding: var(--space-xl);
}

.product-detail__reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

/* Related Products */
.product-detail__related {
  padding: 0 var(--space-md);
}

.product-detail__related-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-md);
}

/* Tablet */
@media (min-width: 768px) {
  .product-detail__content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .product-detail__related-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .product-detail__images,
  .product-detail__info {
    padding: 0;
  }

  .product-detail__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "back back"
      "images info"
      "tabs tabs"
      "related related";
    gap: var(--space-xl);
    padding: 0 var(--space-xl);
  }

  .product-detail__back {
    grid-area: back;
  }

  .product-detail__images {
    grid-area: images;
    position: sticky;
    top: var(--space-lg);
    height: fit-content;
  }

  .product-detail__info {
    grid-area: info;
  }

  .product-detail__tabs {
    grid-area: tabs;
    padding: 0;
  }

  .product-detail__related {
    grid-area: related;
    padding: 0;
  }
}
</style>
