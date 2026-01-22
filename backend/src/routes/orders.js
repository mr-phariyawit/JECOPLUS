import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

import { validateCSRFToken } from '../middleware/csrf.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Create new order
router.post('/', validateCSRFToken, orderController.createOrder);

// Get user's orders
router.get('/', orderController.getOrders);

// Get specific order
router.get('/:orderId', orderController.getOrder);

// Cancel order
router.post('/:orderId/cancel', validateCSRFToken, orderController.cancelOrder);

// Update order status (admin only - would need admin middleware)
router.patch('/:orderId/status', orderController.updateOrderStatus);

export default router;
