import pool from '../config/database.js';
import { ApiError } from '../utils/errors.js';

/**
 * Create new order
 */
export const createOrder = async (userId, orderData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount = 0,
      shippingFee = 0,
      total,
    } = orderData;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Insert order
    const orderQuery = `
      INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_method,
        payment_status,
        shipping_address,
        subtotal,
        discount,
        shipping_fee,
        total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const orderValues = [
      userId,
      orderNumber,
      'PENDING', // Initial status
      paymentMethod,
      paymentMethod === 'cod' ? 'PENDING' : 'UNPAID',
      JSON.stringify(shippingAddress),
      subtotal,
      discount,
      shippingFee,
      total,
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      // Get product details
      const productQuery = 'SELECT name, image_url FROM products WHERE id = $1';
      const productResult = await client.query(productQuery, [item.productId]);
      const product = productResult.rows[0];

      const itemQuery = `
        INSERT INTO order_items (
          order_id,
          product_id,
          variant_id,
          product_name,
          product_image,
          quantity,
          price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      const itemValues = [
        order.id,
        item.productId,
        item.variantId || null,
        product?.name || 'Unknown Product',
        product?.image_url || '',
        item.quantity,
        item.price,
      ];

      await client.query(itemQuery, itemValues);

      // Update product stock
      const updateStockQuery = `
        UPDATE products
        SET stock_quantity = stock_quantity - $1
        WHERE id = $2 AND stock_quantity >= $1
      `;
      const stockResult = await client.query(updateStockQuery, [item.quantity, item.productId]);

      if (stockResult.rowCount === 0) {
        throw new ApiError(`Insufficient stock for product ID: ${item.productId}`, 400);
      }
    }

    await client.query('COMMIT');

    // Fetch complete order with items
    return await getOrderById(order.id, userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (userId, filters = {}) => {
  const { status, limit = 20, offset = 0 } = filters;

  let query = `
    SELECT
      o.*,
      COUNT(*) OVER() AS total_count
    FROM orders o
    WHERE o.user_id = $1
  `;

  const params = [userId];
  let paramIndex = 2;

  if (status) {
    query += ` AND o.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  const orders = await Promise.all(
    result.rows.map(async (order) => {
      const items = await getOrderItems(order.id);
      return {
        ...order,
        shippingAddress: order.shipping_address,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items,
      };
    })
  );

  const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

  return { orders, total };
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId, userId) => {
  const query = `
    SELECT * FROM orders
    WHERE id = $1 AND user_id = $2
  `;

  const result = await pool.query(query, [orderId, userId]);

  if (result.rows.length === 0) {
    return null;
  }

  const order = result.rows[0];
  const items = await getOrderItems(orderId);

  return {
    ...order,
    shippingAddress: order.shipping_address,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items,
  };
};

/**
 * Get order items
 */
const getOrderItems = async (orderId) => {
  const query = `
    SELECT
      id,
      product_id as "productId",
      variant_id as "variantId",
      product_name as "productName",
      product_image as "productImage",
      quantity,
      price
    FROM order_items
    WHERE order_id = $1
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if order exists and belongs to user
    const checkQuery = 'SELECT * FROM orders WHERE id = $1 AND user_id = $2';
    const checkResult = await client.query(checkQuery, [orderId, userId]);

    if (checkResult.rows.length === 0) {
      throw new ApiError('Order not found', 404);
    }

    const order = checkResult.rows[0];

    // Only allow cancellation of pending orders
    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      throw new ApiError('Order cannot be cancelled', 400);
    }

    // Update order status
    const updateQuery = `
      UPDATE orders
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE id = $1
    `;
    await client.query(updateQuery, [orderId]);

    // Restore product stock
    const itemsQuery = 'SELECT product_id, quantity FROM order_items WHERE order_id = $1';
    const itemsResult = await client.query(itemsQuery, [orderId]);

    for (const item of itemsResult.rows) {
      const restoreStockQuery = `
        UPDATE products
        SET stock_quantity = stock_quantity + $1
        WHERE id = $2
      `;
      await client.query(restoreStockQuery, [item.quantity, item.product_id]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update order status (admin)
 */
export const updateOrderStatus = async (orderId, status) => {
  const query = `
    UPDATE orders
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [status, orderId]);

  if (result.rows.length === 0) {
    throw new ApiError('Order not found', 404);
  }

  return result.rows[0];
};

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `ORD${year}${month}${day}${random}`;
};
