import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as orderService from '@/services/orderService';

export const useOrderStore = defineStore('order', () => {
  // State
  const orders = ref([]);
  const currentOrder = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Shipping address for checkout
  const shippingAddress = ref({
    fullName: '',
    phone: '',
    address: '',
    subDistrict: '',
    district: '',
    province: '',
    postalCode: '',
    isDefault: false,
  });

  // Payment method for checkout
  const paymentMethod = ref('');

  // Actions - Orders
  const createOrder = async (orderData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await orderService.createOrder(orderData);
      currentOrder.value = data.order;
      return data.order;
    } catch (err) {
      error.value = err.message || 'Failed to create order';
      console.error('Error creating order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchOrders = async (filters = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await orderService.getOrders(filters);
      orders.value = data.orders || [];
      return data.orders;
    } catch (err) {
      error.value = err.message || 'Failed to fetch orders';
      console.error('Error fetching orders:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchOrder = async (orderId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await orderService.getOrder(orderId);
      currentOrder.value = data.order;
      return data.order;
    } catch (err) {
      error.value = err.message || 'Failed to fetch order';
      console.error('Error fetching order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const cancelOrder = async (orderId) => {
    isLoading.value = true;
    error.value = null;

    try {
      await orderService.cancelOrder(orderId);
      // Refresh orders list
      await fetchOrders();
    } catch (err) {
      error.value = err.message || 'Failed to cancel order';
      console.error('Error canceling order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Actions - Checkout
  const setShippingAddress = (address) => {
    shippingAddress.value = { ...address };
  };

  const setPaymentMethod = (method) => {
    paymentMethod.value = method;
  };

  const resetCheckout = () => {
    shippingAddress.value = {
      fullName: '',
      phone: '',
      address: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: '',
      isDefault: false,
    };
    paymentMethod.value = '';
  };

  const resetCurrentOrder = () => {
    currentOrder.value = null;
  };

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    error,
    shippingAddress,
    paymentMethod,

    // Actions
    createOrder,
    fetchOrders,
    fetchOrder,
    cancelOrder,
    setShippingAddress,
    setPaymentMethod,
    resetCheckout,
    resetCurrentOrder,
  };
});
