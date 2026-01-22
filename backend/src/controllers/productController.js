import * as productService from '../services/productService.js';
import logger from '../utils/logger.js';

/**
 * Product Controller
 * Handles product-related HTTP requests
 */

/**
 * List products with filters
 * GET /api/v1/products
 */
export const listProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      minPrice,
      maxPrice,
      status,
      isFeatured,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await productService.listProducts({
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100), // Max 100 per page
      search,
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      status: status || 'ACTIVE', // Default to active products
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : null,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID or slug
 * GET /api/v1/products/:identifier
 */
export const getProduct = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const product = await productService.getProduct(identifier);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 * GET /api/v1/products/featured
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const products = await productService.getFeaturedProducts(parseInt(limit, 10));

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get related products
 * GET /api/v1/products/:id/related
 */
export const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const products = await productService.getRelatedProducts(id, parseInt(limit, 10));

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List categories
 * GET /api/v1/categories
 */
export const listCategories = async (req, res, next) => {
  try {
    const { parentId, isActive, isFeatured } = req.query;

    const categories = await productService.listCategories({
      parentId,
      isActive: isActive === 'false' ? false : true,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : null,
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID or slug
 * GET /api/v1/categories/:identifier
 */
export const getCategory = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const category = await productService.getCategory(identifier);

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check product stock
 * GET /api/v1/products/:id/stock
 */
export const checkStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;

    const stock = await productService.checkStock(id, parseInt(quantity, 10));

    res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listProducts,
  getProduct,
  getFeaturedProducts,
  getRelatedProducts,
  listCategories,
  getCategory,
  checkStock,
};
