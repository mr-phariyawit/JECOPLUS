import * as orderService from '../services/orderService.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Create new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orderData = req.body;

    // Validate order data
    if (!orderData.items || orderData.items.length === 0) {
      throw new ApiError('Order must contain at least one item', 400);
    }

    if (!orderData.shippingAddress) {
      throw new ApiError('Shipping address is required', 400);
    }

    if (!orderData.paymentMethod) {
      throw new ApiError('Payment method is required', 400);
    }

    const order = await orderService.createOrder(userId, orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, offset = 0 } = req.query;

    const filters = {
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    const result = await orderService.getUserOrders(userId, filters);

    res.json({
      success: true,
      orders: result.orders,
      pagination: {
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific order
 */
export const getOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await orderService.getOrderById(orderId, userId);

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    await orderService.cancelOrder(orderId, userId);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ApiError('Status is required', 400);
    }

    await orderService.updateOrderStatus(orderId, status);

    res.json({
      success: true,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
