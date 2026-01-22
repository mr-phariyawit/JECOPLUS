import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const CART_STORAGE_KEY = 'jeco-cart';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([]);
  const isLoading = ref(false);

  // Load cart from localStorage on init
  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        items.value = JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  // Save cart to localStorage
  const saveCart = () => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  // Computed
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  });

  const discount = computed(() => {
    // Calculate discount based on compare-at prices
    return items.value.reduce((total, item) => {
      if (item.compareAtPrice && item.compareAtPrice > item.price) {
        return total + ((item.compareAtPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);
  });

  const shipping = computed(() => {
    // Free shipping over 1000 baht
    if (subtotal.value >= 1000) {
      return 0;
    }
    // Flat rate shipping
    return 50;
  });

  const total = computed(() => {
    return subtotal.value + shipping.value;
  });

  const isEmpty = computed(() => {
    return items.value.length === 0;
  });

  // Find item in cart
  const findItem = (productId, variantId = null) => {
    return items.value.find(item => {
      if (variantId) {
        return item.productId === productId && item.variantId === variantId;
      }
      return item.productId === productId && !item.variantId;
    });
  };

  // Actions
  const addItem = (product, quantity = 1, variant = null) => {
    const existingItem = findItem(product.id, variant?.id);

    if (existingItem) {
      // Update quantity if item exists
      updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      // Add new item
      const cartItem = {
        id: `${product.id}-${variant?.id || 'default'}-${Date.now()}`,
        productId: product.id,
        variantId: variant?.id || null,
        name: product.name,
        code: product.code || '',
        image: product.imageUrl || product.images?.[0] || '',
        price: variant?.price || product.price,
        compareAtPrice: variant?.compareAtPrice || product.compareAtPrice || null,
        quantity: quantity,
        stockQuantity: variant?.stockQuantity || product.stockQuantity || 0,
        variant: variant ? {
          name: variant.name,
          options: variant.options,
        } : null,
      };

      items.value.push(cartItem);
      saveCart();
    }

    return true;
  };

  const removeItem = (itemId) => {
    const index = items.value.findIndex(item => item.id === itemId);
    if (index !== -1) {
      items.value.splice(index, 1);
      saveCart();
      return true;
    }
    return false;
  };

  const updateQuantity = (itemId, newQuantity) => {
    const item = items.value.find(item => item.id === itemId);
    if (item) {
      // Validate quantity
      if (newQuantity <= 0) {
        removeItem(itemId);
        return true;
      }

      if (newQuantity > item.stockQuantity) {
        throw new Error(`มีสินค้าเหลือเพียง ${item.stockQuantity} ชิ้น`);
      }

      item.quantity = newQuantity;
      saveCart();
      return true;
    }
    return false;
  };

  const incrementQuantity = (itemId) => {
    const item = items.value.find(item => item.id === itemId);
    if (item) {
      if (item.quantity >= item.stockQuantity) {
        throw new Error(`มีสินค้าเหลือเพียง ${item.stockQuantity} ชิ้น`);
      }
      return updateQuantity(itemId, item.quantity + 1);
    }
    return false;
  };

  const decrementQuantity = (itemId) => {
    const item = items.value.find(item => item.id === itemId);
    if (item) {
      return updateQuantity(itemId, item.quantity - 1);
    }
    return false;
  };

  const clearCart = () => {
    items.value = [];
    saveCart();
  };

  const isInCart = (productId, variantId = null) => {
    return !!findItem(productId, variantId);
  };

  const getItemQuantity = (productId, variantId = null) => {
    const item = findItem(productId, variantId);
    return item ? item.quantity : 0;
  };

  // Initialize cart from storage
  loadCart();

  return {
    // State
    items,
    isLoading,

    // Computed
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    isEmpty,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    loadCart,
  };
});
