<template>
  <div class="marketplace screen">
    <header class="marketplace__header">
      <div class="marketplace__greeting">
        <p class="text-small">ช้อปสินค้า</p>
        <h1 class="text-title">Marketplace</h1>
      </div>
      <button class="marketplace__cart" @click="goToCart">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 2L7 6M17 2l2 4M21 6H3m18 0l-2 13H5L3 6h18zM10 11v3m4-3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span v-if="cartCount" class="marketplace__cart-badge">{{ cartCount }}</span>
      </button>
    </header>

    <!-- Search Bar -->
    <section class="marketplace__search">
      <div class="search-box">
        <svg class="search-box__icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-box__input"
          placeholder="ค้นหาสินค้า..."
          @input="handleSearch"
        />
        <button
          v-if="searchQuery"
          class="search-box__clear"
          @click="clearSearch"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </section>

    <!-- Categories -->
    <section class="marketplace__categories">
      <div class="category-chips">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-chip"
          :class="{ 'category-chip--active': selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          <span v-if="category.icon" class="category-chip__icon">{{ category.icon }}</span>
          <span class="category-chip__label">{{ category.name }}</span>
        </button>
      </div>
    </section>

    <!-- Featured Products -->
    <section v-if="!selectedCategory && !searchQuery" class="marketplace__featured section">
      <h2 class="section-title">สินค้าแนะนำ</h2>

      <div v-if="isLoadingFeatured" class="marketplace__loading">
        <div v-for="i in 3" :key="i" class="skeleton" style="height: 200px; margin-bottom: 12px;"></div>
      </div>

      <div v-else-if="featuredProducts.length" class="marketplace__grid">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
          @click="goToProduct(product.id)"
        />
      </div>

      <div v-else class="marketplace__empty">
        <p>ไม่มีสินค้าแนะนำในขณะนี้</p>
      </div>
    </section>

    <!-- All Products -->
    <section class="marketplace__products section">
      <div class="flex-between">
        <h2 class="section-title">
          {{ selectedCategoryName || 'สินค้าทั้งหมด' }}
        </h2>
        <button class="marketplace__filter" @click="showFilters = !showFilters">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          ฟิลเตอร์
        </button>
      </div>

      <!-- Filters Panel -->
      <div v-if="showFilters" class="marketplace__filters">
        <JCard>
          <div class="filters">
            <div class="filters__group">
              <label class="filters__label">ช่วงราคา</label>
              <div class="filters__price">
                <input
                  v-model="filters.minPrice"
                  type="number"
                  class="filters__input"
                  placeholder="ขั้นต่ำ"
                  @change="applyFilters"
                />
                <span>-</span>
                <input
                  v-model="filters.maxPrice"
                  type="number"
                  class="filters__input"
                  placeholder="สูงสุด"
                  @change="applyFilters"
                />
              </div>
            </div>

            <div class="filters__group">
              <label class="filters__label">เรียงตาม</label>
              <select v-model="filters.sortBy" class="filters__select" @change="applyFilters">
                <option value="latest">ล่าสุด</option>
                <option value="price_asc">ราคาต่ำ-สูง</option>
                <option value="price_desc">ราคาสูง-ต่ำ</option>
                <option value="popular">ยอดนิยม</option>
              </select>
            </div>

            <button class="btn btn--secondary" @click="resetFilters">
              ล้างฟิลเตอร์
            </button>
          </div>
        </JCard>
      </div>

      <!-- Products Loading -->
      <div v-if="isLoading" class="marketplace__loading">
        <div v-for="i in 6" :key="i" class="skeleton" style="height: 200px; margin-bottom: 12px;"></div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="products.length" class="marketplace__grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @click="goToProduct(product.id)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="marketplace__empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p class="marketplace__empty-title">ไม่พบสินค้า</p>
        <p class="marketplace__empty-text">
          {{ searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'ไม่มีสินค้าในหมวดนี้' }}
        </p>
      </div>

      <!-- Load More -->
      <button
        v-if="hasMore && !isLoading"
        class="btn btn--outline marketplace__load-more"
        @click="loadMore"
      >
        โหลดเพิ่มเติม
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import JCard from '@/components/base/JCard.vue';
import JBadge from '@/components/base/JBadge.vue';
import ProductCard from '@/components/marketplace/ProductCard.vue';
import { useMarketplaceStore } from '@/stores/marketplace';

const router = useRouter();
const marketplaceStore = useMarketplaceStore();

// State
const searchQuery = ref('');
const selectedCategory = ref(null);
const showFilters = ref(false);
const cartCount = ref(0);

const filters = ref({
  minPrice: null,
  maxPrice: null,
  sortBy: 'latest',
});

// Computed
const categories = computed(() => marketplaceStore.categories);
const products = computed(() => marketplaceStore.products);
const featuredProducts = computed(() => marketplaceStore.featuredProducts);
const isLoading = computed(() => marketplaceStore.isLoading);
const isLoadingFeatured = computed(() => marketplaceStore.isLoadingFeatured);
const hasMore = computed(() => marketplaceStore.hasMore);

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return '';
  const category = categories.value.find(c => c.id === selectedCategory.value);
  return category?.name || '';
});

// Methods
const handleSearch = () => {
  selectedCategory.value = null;
  loadProducts();
};

const clearSearch = () => {
  searchQuery.value = '';
  loadProducts();
};

const selectCategory = (categoryId) => {
  if (selectedCategory.value === categoryId) {
    selectedCategory.value = null;
  } else {
    selectedCategory.value = categoryId;
  }
  searchQuery.value = '';
  loadProducts();
};

const applyFilters = () => {
  loadProducts();
};

const resetFilters = () => {
  filters.value = {
    minPrice: null,
    maxPrice: null,
    sortBy: 'latest',
  };
  loadProducts();
};

const loadProducts = async () => {
  await marketplaceStore.fetchProducts({
    search: searchQuery.value,
    categoryId: selectedCategory.value,
    minPrice: filters.value.minPrice,
    maxPrice: filters.value.maxPrice,
    sortBy: filters.value.sortBy,
    limit: 20,
    offset: 0,
  });
};

const loadMore = async () => {
  await marketplaceStore.loadMoreProducts();
};

const goToProduct = (productId) => {
  router.push(`/marketplace/product/${productId}`);
};

const goToCart = () => {
  router.push('/cart');
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    marketplaceStore.fetchCategories(),
    marketplaceStore.fetchFeaturedProducts(),
    loadProducts(),
  ]);
});
</script>

<style scoped>
.marketplace {
  padding-bottom: 80px;
}

.marketplace__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  margin-bottom: var(--space-md);
}

.marketplace__greeting {
  flex: 1;
}

.marketplace__cart {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-gray-1);
  color: var(--color-black);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.marketplace__cart:hover {
  background: var(--color-gray-2);
}

.marketplace__cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--color-red);
  color: var(--color-white);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
}

/* Search */
.marketplace__search {
  padding: 0 var(--space-md);
  margin-bottom: var(--space-md);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-gray-1);
  border-radius: var(--radius-lg);
  padding: 0 var(--space-md);
}

.search-box__icon {
  color: var(--color-gray-4);
  margin-right: var(--space-sm);
}

.search-box__input {
  flex: 1;
  height: 48px;
  border: none;
  background: transparent;
  font-size: var(--font-size-body);
  color: var(--color-black);
}

.search-box__input::placeholder {
  color: var(--color-gray-4);
}

.search-box__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-gray-4);
  cursor: pointer;
}

/* Categories */
.marketplace__categories {
  padding: 0 var(--space-md);
  margin-bottom: var(--space-lg);
}

.category-chips {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-chips::-webkit-scrollbar {
  display: none;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: var(--color-black);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-chip:hover {
  border-color: var(--color-gray-3);
  background: var(--color-gray-1);
}

.category-chip--active {
  border-color: var(--color-red);
  background: var(--color-red);
  color: var(--color-white);
}

.category-chip__icon {
  font-size: 16px;
}

/* Featured */
.marketplace__featured {
  padding: 0 var(--space-md);
  margin-bottom: var(--space-xl);
}

/* Products */
.marketplace__products {
  padding: 0 var(--space-md);
}

.marketplace__filter {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-gray-3);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-black);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.marketplace__filter:hover {
  background: var(--color-gray-1);
}

/* Filters */
.marketplace__filters {
  margin-top: var(--space-md);
  margin-bottom: var(--space-md);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.filters__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.filters__label {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-5);
}

.filters__price {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.filters__input,
.filters__select {
  flex: 1;
  height: 44px;
  padding: 0 var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  background: var(--color-white);
  font-size: var(--font-size-body);
  color: var(--color-black);
}

/* Grid */
.marketplace__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-md);
}

/* Loading */
.marketplace__loading {
  margin-top: var(--space-md);
}

/* Empty */
.marketplace__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-xl) var(--space-md);
  text-align: center;
  color: var(--color-gray-4);
}

.marketplace__empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
}

.marketplace__empty-text {
  font-size: var(--font-size-body);
  color: var(--color-gray-5);
}

/* Load More */
.marketplace__load-more {
  width: 100%;
  margin-top: var(--space-md);
}

/* Tablet */
@media (min-width: 768px) {
  .marketplace__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .marketplace__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
