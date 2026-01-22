import { Router } from 'express';
import * as productController from '../controllers/productController.js';

const router = Router();

// =====================================================
// CATEGORIES
// =====================================================

/**
 * @route   GET /api/v1/categories
 * @desc    List categories
 * @access  Public
 */
router.get('/', productController.listCategories);

/**
 * @route   GET /api/v1/categories/:identifier
 * @desc    Get category by ID or slug
 * @access  Public
 */
router.get('/:identifier', productController.getCategory);

export default router;
