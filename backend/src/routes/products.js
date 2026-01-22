import { Router } from 'express';
import * as productController from '../controllers/productController.js';

const router = Router();

// =====================================================
// PRODUCTS
// =====================================================

/**
 * @route   GET /api/v1/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @route   GET /api/v1/products/:identifier
 * @desc    Get product by ID or slug
 * @access  Public
 */
router.get('/:identifier', productController.getProduct);

/**
 * @route   GET /api/v1/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get('/:id/related', productController.getRelatedProducts);

/**
 * @route   GET /api/v1/products/:id/stock
 * @desc    Check product stock availability
 * @access  Public
 */
router.get('/:id/stock', productController.checkStock);

/**
 * @route   GET /api/v1/products
 * @desc    List products with filters
 * @access  Public
 */
router.get('/', productController.listProducts);

export default router;
