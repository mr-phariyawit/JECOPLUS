import { query } from '../config/database.js';
import { NotFound, BadRequest } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Product Service
 * Handles all product-related business logic
 */

/**
 * List products with filters, search, and pagination
 * @param {object} options - Query options
 * @returns {Promise<{products: Array, pagination: object}>}
 */
export const listProducts = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    categoryId = null,
    minPrice = null,
    maxPrice = null,
    status = 'ACTIVE',
    isFeatured = null,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = options;

  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Filter by status
  if (status) {
    conditions.push(`p.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  // Filter by category
  if (categoryId) {
    conditions.push(`p.category_id = $${paramIndex}`);
    params.push(categoryId);
    paramIndex++;
  }

  // Filter by price range
  if (minPrice !== null) {
    conditions.push(`p.price >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== null) {
    conditions.push(`p.price <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  // Filter by featured
  if (isFeatured !== null) {
    conditions.push(`p.is_featured = $${paramIndex}`);
    params.push(isFeatured);
    paramIndex++;
  }

  // Search
  if (search) {
    conditions.push(`(
      p.name ILIKE $${paramIndex} OR
      p.description ILIKE $${paramIndex} OR
      p.brand ILIKE $${paramIndex} OR
      p.sku ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort column
  const allowedSortColumns = ['created_at', 'price', 'name', 'sales_count', 'rating_average'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM products p
     ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].total);

  // Get products
  params.push(limit, offset);
  const productsResult = await query(
    `SELECT
       p.*,
       c.name as category_name,
       c.slug as category_slug,
       (
         SELECT json_agg(json_build_object(
           'id', pi.id,
           'url', pi.url,
           'alt_text', pi.alt_text,
           'display_order', pi.display_order
         ) ORDER BY pi.display_order)
         FROM product_images pi
         WHERE pi.product_id = p.id
       ) as images
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     ${whereClause}
     ORDER BY p.${sortColumn} ${order}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return {
    products: productsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

/**
 * Get product by ID or slug
 * @param {string} identifier - Product ID or slug
 * @returns {Promise<object>} Product details
 */
export const getProduct = async (identifier) => {
  // Check if identifier is UUID or slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const column = isUUID ? 'id' : 'slug';

  const result = await query(
    `SELECT
       p.*,
       c.name as category_name,
       c.slug as category_slug,
       c.id as category_id,
       (
         SELECT json_agg(json_build_object(
           'id', pi.id,
           'url', pi.url,
           'alt_text', pi.alt_text,
           'display_order', pi.display_order
         ) ORDER BY pi.display_order)
         FROM product_images pi
         WHERE pi.product_id = p.id
       ) as images,
       (
         SELECT json_agg(json_build_object(
           'id', pv.id,
           'name', pv.name,
           'sku', pv.sku,
           'price', pv.price,
           'stock_quantity', pv.stock_quantity,
           'attributes', pv.attributes,
           'image_url', pv.image_url,
           'is_active', pv.is_active
         ))
         FROM product_variants pv
         WHERE pv.product_id = p.id AND pv.is_active = true
       ) as variants
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.${column} = $1`,
    [identifier]
  );

  if (result.rows.length === 0) {
    throw NotFound('Product not found');
  }

  // Increment view count (fire and forget)
  query('UPDATE products SET views_count = views_count + 1 WHERE id = $1', [result.rows[0].id])
    .catch(err => logger.error('Failed to increment product views', err));

  return result.rows[0];
};

/**
 * Get featured products
 * @param {number} limit - Number of products to return
 * @returns {Promise<Array>} Featured products
 */
export const getFeaturedProducts = async (limit = 10) => {
  const result = await query(
    `SELECT
       p.*,
       c.name as category_name,
       c.slug as category_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.is_featured = true AND p.status = 'ACTIVE'
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};

/**
 * Get related products (same category)
 * @param {string} productId - Product ID
 * @param {number} limit - Number of products to return
 * @returns {Promise<Array>} Related products
 */
export const getRelatedProducts = async (productId, limit = 4) => {
  const result = await query(
    `SELECT
       p.*,
       c.name as category_name,
       c.slug as category_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.category_id = (SELECT category_id FROM products WHERE id = $1)
       AND p.id != $1
       AND p.status = 'ACTIVE'
     ORDER BY p.sales_count DESC, p.rating_average DESC
     LIMIT $2`,
    [productId, limit]
  );

  return result.rows;
};

/**
 * List categories
 * @param {object} options - Query options
 * @returns {Promise<Array>} Categories
 */
export const listCategories = async (options = {}) => {
  const { parentId = null, isActive = true, isFeatured = null } = options;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (parentId !== null) {
    if (parentId === 'root') {
      conditions.push('parent_id IS NULL');
    } else {
      conditions.push(`parent_id = $${paramIndex}`);
      params.push(parentId);
      paramIndex++;
    }
  }

  if (isActive !== null) {
    conditions.push(`is_active = $${paramIndex}`);
    params.push(isActive);
    paramIndex++;
  }

  if (isFeatured !== null) {
    conditions.push(`is_featured = $${paramIndex}`);
    params.push(isFeatured);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT
       c.*,
       (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'ACTIVE') as product_count
     FROM categories c
     ${whereClause}
     ORDER BY c.display_order ASC, c.name ASC`,
    params
  );

  return result.rows;
};

/**
 * Get category by ID or slug
 * @param {string} identifier - Category ID or slug
 * @returns {Promise<object>} Category details
 */
export const getCategory = async (identifier) => {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const column = isUUID ? 'id' : 'slug';

  const result = await query(
    `SELECT
       c.*,
       (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'ACTIVE') as product_count,
       (
         SELECT json_agg(json_build_object(
           'id', sub.id,
           'name', sub.name,
           'slug', sub.slug,
           'icon', sub.icon
         ))
         FROM categories sub
         WHERE sub.parent_id = c.id AND sub.is_active = true
       ) as subcategories
     FROM categories c
     WHERE c.${column} = $1`,
    [identifier]
  );

  if (result.rows.length === 0) {
    throw NotFound('Category not found');
  }

  return result.rows[0];
};

/**
 * Check product stock availability
 * @param {string} productId - Product ID
 * @param {number} quantity - Desired quantity
 * @returns {Promise<{available: boolean, stock: number}>}
 */
export const checkStock = async (productId, quantity = 1) => {
  const result = await query(
    'SELECT stock_quantity, allow_backorder FROM products WHERE id = $1',
    [productId]
  );

  if (result.rows.length === 0) {
    throw NotFound('Product not found');
  }

  const { stock_quantity, allow_backorder } = result.rows[0];

  return {
    available: stock_quantity >= quantity || allow_backorder,
    stock: stock_quantity,
    allowBackorder: allow_backorder,
  };
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
