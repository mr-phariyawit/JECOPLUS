-- ============================================
-- Orders Schema
-- ============================================
-- Purpose: Marketplace order management
-- Tables: orders, order_items
-- Features: Order tracking, payment, shipping
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- ============================================
-- Orders Table
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- Status: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED

    -- Payment
    payment_method VARCHAR(50) NOT NULL,
    -- Payment methods: jwallet, promptpay, bank, cod
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    -- Payment status: UNPAID, PAID, REFUNDED
    payment_date TIMESTAMPTZ,

    -- Shipping
    shipping_address JSONB NOT NULL,
    -- Store full address as JSON
    shipping_method VARCHAR(50) DEFAULT 'standard',
    tracking_number VARCHAR(100),
    shipped_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,

    -- Notes
    notes TEXT,
    cancellation_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Order Items Table
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID,
    -- Store product details at time of order
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- Triggers
-- ============================================
-- Update updated_at on order update
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Note: Add sample orders after users and products exist

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE orders IS 'Marketplace orders table';
COMMENT ON TABLE order_items IS 'Order line items table';
COMMENT ON COLUMN orders.shipping_address IS 'JSON object containing full shipping address details';
COMMENT ON COLUMN orders.payment_method IS 'Payment method: jwallet, promptpay, bank, cod';
COMMENT ON COLUMN orders.status IS 'Order status: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED';
