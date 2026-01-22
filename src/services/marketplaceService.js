import api from './api';

/**
 * Product Service
 * API calls for marketplace products
 */

// Products
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProduct = async (identifier) => {
  const response = await api.get(`/products/${identifier}`);
  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get('/products/featured');
  return response.data;
};

export const getRelatedProducts = async (productId, limit = 4) => {
  const response = await api.get(`/products/${productId}/related`, {
    params: { limit },
  });
  return response.data;
};

export const checkStock = async (productId) => {
  const response = await api.get(`/products/${productId}/stock`);
  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategory = async (identifier) => {
  const response = await api.get(`/categories/${identifier}`);
  return response.data;
};
