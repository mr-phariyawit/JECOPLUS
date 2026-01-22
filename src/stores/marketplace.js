import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as marketplaceService from '@/services/marketplaceService';

export const useMarketplaceStore = defineStore('marketplace', () => {
  // State
  const products = ref([]);
  const featuredProducts = ref([]);
  const categories = ref([]);
  const currentProduct = ref(null);
  const currentCategory = ref(null);

  const isLoading = ref(false);
  const isLoadingFeatured = ref(false);
  const error = ref(null);

  // Pagination
  const currentPage = ref(0);
  const limit = ref(20);
  const total = ref(0);
  const hasMore = computed(() => products.value.length < total.value);

  // Current filters
  const currentFilters = ref({});

  // Actions - Products
  const fetchProducts = async (filters = {}) => {
    isLoading.value = true;
    error.value = null;
    currentFilters.value = filters;

    try {
      const params = {
        limit: filters.limit || limit.value,
        offset: filters.offset || 0,
        search: filters.search,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy || 'latest',
        featured: filters.featured,
      };

      // Remove undefined/null params
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const data = await marketplaceService.getProducts(params);
      products.value = data.products || [];
      total.value = data.pagination?.total || 0;
      currentPage.value = 0;
    } catch (err) {
      error.value = err.message || 'Failed to fetch products';
      console.error('Error fetching products:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const loadMoreProducts = async () => {
    if (!hasMore.value || isLoading.value) return;

    isLoading.value = true;
    try {
      const nextOffset = products.value.length;
      const params = {
        ...currentFilters.value,
        limit: limit.value,
        offset: nextOffset,
      };

      // Remove undefined/null params
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const data = await marketplaceService.getProducts(params);
      products.value = [...products.value, ...(data.products || [])];
      total.value = data.pagination?.total || 0;
      currentPage.value++;
    } catch (err) {
      error.value = err.message || 'Failed to load more products';
      console.error('Error loading more products:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchFeaturedProducts = async () => {
    isLoadingFeatured.value = true;
    try {
      const data = await marketplaceService.getFeaturedProducts();
      featuredProducts.value = data.products || [];
    } catch (err) {
      console.error('Error fetching featured products:', err);
    } finally {
      isLoadingFeatured.value = false;
    }
  };

  const fetchProduct = async (identifier) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await marketplaceService.getProduct(identifier);
      currentProduct.value = data.product;
      return data.product;
    } catch (err) {
      error.value = err.message || 'Failed to fetch product';
      console.error('Error fetching product:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const checkStock = async (productId) => {
    try {
      const data = await marketplaceService.checkStock(productId);
      return data;
    } catch (err) {
      console.error('Error checking stock:', err);
      throw err;
    }
  };

  // Actions - Categories
  const fetchCategories = async () => {
    try {
      const data = await marketplaceService.getCategories();

      // Add "All" category at the beginning
      categories.value = [
        { id: null, name: 'ทั้งหมด', icon: '🏠' },
        ...(data.categories || []),
      ];
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCategory = async (identifier) => {
    try {
      const data = await marketplaceService.getCategory(identifier);
      currentCategory.value = data.category;
      return data.category;
    } catch (err) {
      console.error('Error fetching category:', err);
      throw err;
    }
  };

  // Reset
  const resetProducts = () => {
    products.value = [];
    currentPage.value = 0;
    total.value = 0;
    currentFilters.value = {};
  };

  const resetCurrentProduct = () => {
    currentProduct.value = null;
  };

  return {
    // State
    products,
    featuredProducts,
    categories,
    currentProduct,
    currentCategory,
    isLoading,
    isLoadingFeatured,
    error,
    hasMore,
    total,

    // Actions
    fetchProducts,
    loadMoreProducts,
    fetchFeaturedProducts,
    fetchProduct,
    checkStock,
    fetchCategories,
    fetchCategory,
    resetProducts,
    resetCurrentProduct,
  };
});
