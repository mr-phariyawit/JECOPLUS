-- Marketplace Schema
-- Version: 1.0.0
-- Last Updated: 2026-01-22

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE product_status AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED');

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Category Details
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    -- Hierarchy Support
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    level INT DEFAULT 0,
    path VARCHAR(500), -- Materialized path for efficient queries (e.g., '/electronics/phones/')

    -- Display
    icon VARCHAR(50), -- Icon name or emoji
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,

    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_path ON categories(path);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_featured ON categories(is_featured, display_order);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Info
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),

    -- Category
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2), -- Original price for showing discounts
    cost_price DECIMAL(10, 2), -- For profit calculation (admin only)

    -- Inventory
    sku VARCHAR(100) UNIQUE,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    allow_backorder BOOLEAN DEFAULT false,

    -- Product Details
    brand VARCHAR(100),
    weight DECIMAL(10, 2), -- in kg
    dimensions VARCHAR(100), -- e.g., "10x20x30 cm"

    -- Images
    featured_image_url VARCHAR(500),

    -- Status
    status product_status DEFAULT 'ACTIVE',
    is_featured BOOLEAN DEFAULT false,

    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),

    -- Stats
    views_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 to 5.00
    rating_count INT DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured, created_at DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('simple', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, '')));

-- =====================================================
-- PRODUCT IMAGES TABLE
-- =====================================================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Image Details
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    display_order INT DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id, display_order);

-- =====================================================
-- PRODUCT VARIANTS TABLE (for future - sizes, colors, etc.)
-- =====================================================

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Variant Details
    name VARCHAR(100) NOT NULL, -- e.g., "Red - Large"
    sku VARCHAR(100) UNIQUE,

    -- Pricing (can override product price)
    price DECIMAL(10, 2),
    compare_at_price DECIMAL(10, 2),

    -- Inventory
    stock_quantity INT DEFAULT 0,

    -- Attributes (JSON for flexibility)
    attributes JSONB, -- e.g., {"color": "red", "size": "L"}

    -- Image
    image_url VARCHAR(500),

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update categories updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update products updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update product_variants updated_at
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update product status based on stock
CREATE OR REPLACE FUNCTION update_product_stock_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity = 0 AND NOT NEW.allow_backorder THEN
        NEW.status = 'OUT_OF_STOCK';
    ELSIF NEW.stock_quantity > 0 AND OLD.status = 'OUT_OF_STOCK' THEN
        NEW.status = 'ACTIVE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_stock_status_update
    BEFORE UPDATE ON products
    FOR EACH ROW
    WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
    EXECUTE FUNCTION update_product_stock_status();

-- =====================================================
-- SAMPLE DATA (for development)
-- =====================================================

-- Sample Categories
INSERT INTO categories (id, name, slug, description, icon, display_order, is_featured, is_active) VALUES
(gen_random_uuid(), 'Electronics', 'electronics', 'Electronic devices and accessories', '📱', 1, true, true),
(gen_random_uuid(), 'Fashion', 'fashion', 'Clothing and accessories', '👕', 2, true, true),
(gen_random_uuid(), 'Home & Living', 'home-living', 'Furniture and home decor', '🏠', 3, false, true),
(gen_random_uuid(), 'Beauty', 'beauty', 'Beauty and personal care products', '💄', 4, false, true),
(gen_random_uuid(), 'Sports', 'sports', 'Sports equipment and activewear', '⚽', 5, false, true);

-- Sample Products (using category IDs from above - will need to be adjusted)
INSERT INTO products (name, slug, description, short_description, category_id, price, compare_at_price, sku, stock_quantity, brand, status, is_featured, featured_image_url)
SELECT
    'iPhone 14 Pro',
    'iphone-14-pro',
    'The latest iPhone with advanced camera system and A16 Bionic chip. Features include Dynamic Island, Always-On display, and ProMotion technology.',
    'Latest iPhone with advanced camera and A16 chip',
    id,
    39990.00,
    44990.00,
    'IP14P-BLK-256',
    50,
    'Apple',
    'ACTIVE',
    true,
    'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800'
FROM categories WHERE slug = 'electronics' LIMIT 1;

INSERT INTO products (name, slug, description, short_description, category_id, price, sku, stock_quantity, brand, status, featured_image_url)
SELECT
    'Samsung Galaxy S23',
    'samsung-galaxy-s23',
    'Powerful Android smartphone with stunning display and excellent cameras.',
    'Premium Android smartphone',
    id,
    29990.00,
    'SGS23-WHT-128',
    30,
    'Samsung',
    'ACTIVE',
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'
FROM categories WHERE slug = 'electronics' LIMIT 1;

INSERT INTO products (name, slug, description, short_description, category_id, price, sku, stock_quantity, status, featured_image_url)
SELECT
    'Classic White T-Shirt',
    'classic-white-tshirt',
    'Premium cotton t-shirt, perfect for everyday wear. Comfortable and durable.',
    'Premium cotton t-shirt',
    id,
    299.00,
    'TSH-WHT-M',
    100,
    'ACTIVE',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
FROM categories WHERE slug = 'fashion' LIMIT 1;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE categories IS 'Product categories with hierarchy support';
COMMENT ON TABLE products IS 'Marketplace products';
COMMENT ON TABLE product_images IS 'Additional product images';
COMMENT ON TABLE product_variants IS 'Product variants (sizes, colors, etc.)';
