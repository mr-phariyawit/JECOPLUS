import api from './api';

/**
 * Order Service
 * API calls for marketplace orders
 */

// Create new order
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Get user's orders
export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

// Get specific order
export const getOrder = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/cancel`);
  return response.data;
};

// Update order status (admin)
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};
