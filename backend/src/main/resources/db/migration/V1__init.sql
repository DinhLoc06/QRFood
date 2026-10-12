
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF',
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT ck_users_username_not_blank CHECK (btrim(username) <> ''),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'STAFF', 'KITCHEN'))
);

CREATE TABLE tables (
    id BIGSERIAL PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tables_table_number UNIQUE (table_number),
    CONSTRAINT ck_tables_number_not_blank CHECK (btrim(table_number) <> ''),
    CONSTRAINT ck_tables_capacity_positive CHECK (capacity > 0),
    CONSTRAINT ck_tables_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'))
);

CREATE TABLE dining_sessions (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL,
    number_of_people INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_table FOREIGN KEY (table_id) REFERENCES tables (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT ck_sessions_people_positive CHECK (number_of_people > 0),
    CONSTRAINT ck_sessions_status CHECK (status IN ('ACTIVE', 'WAITING_PAYMENT', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT ck_sessions_time_order CHECK (ended_at IS NULL OR ended_at >= started_at),
    CONSTRAINT ck_sessions_end_state CHECK (
        (status IN ('ACTIVE', 'WAITING_PAYMENT') AND ended_at IS NULL)
        OR (status IN ('COMPLETED', 'CANCELLED') AND ended_at IS NOT NULL)
    )
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_categories_name UNIQUE (name),
    CONSTRAINT ck_categories_name_not_blank CHECK (btrim(name) <> '')
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    price NUMERIC(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT ck_products_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT ck_products_price_non_negative CHECK (price >= 0)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    note VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITHOUT TIME ZONE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    rejected_reason VARCHAR(255),
    CONSTRAINT fk_orders_session FOREIGN KEY (session_id) REFERENCES dining_sessions (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT ck_orders_status CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT ck_orders_total_non_negative CHECK (total_amount >= 0),
    CONSTRAINT ck_orders_confirmed_time CHECK (confirmed_at IS NULL OR confirmed_at >= created_at),
    CONSTRAINT ck_orders_completed_time CHECK (completed_at IS NULL OR completed_at >= created_at),
    CONSTRAINT ck_orders_completed_state CHECK (
        (status = 'COMPLETED' AND completed_at IS NOT NULL)
        OR (status <> 'COMPLETED' AND completed_at IS NULL)
    )
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT ck_order_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_order_items_unit_price_non_negative CHECK (unit_price >= 0),
    CONSTRAINT ck_order_items_subtotal CHECK (subtotal = unit_price * quantity)
);

-- Prevent two open sessions from using the same table.
CREATE UNIQUE INDEX uq_sessions_one_open_per_table
    ON dining_sessions (table_id)
    WHERE status IN ('ACTIVE', 'WAITING_PAYMENT');

CREATE INDEX idx_tables_status_capacity ON tables (status, capacity, id);
CREATE INDEX idx_sessions_table_status ON dining_sessions (table_id, status);
CREATE INDEX idx_orders_session_status ON orders (session_id, status);
CREATE INDEX idx_orders_status_created_at ON orders (status, created_at);
CREATE INDEX idx_products_category_available ON products (category_id, is_available);
CREATE INDEX idx_order_items_order ON order_items (order_id);

-- Maintain audit timestamps for SQL updates as well as Hibernate updates.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tables_set_updated_at BEFORE UPDATE ON tables
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_set_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_set_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enforce the same order lifecycle as OrderService for direct SQL updates.
CREATE OR REPLACE FUNCTION validate_order_status_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;
    IF NOT (
        (OLD.status = 'PENDING' AND NEW.status IN ('CONFIRMED', 'CANCELLED'))
        OR (OLD.status = 'CONFIRMED' AND NEW.status IN ('PREPARING', 'CANCELLED'))
        OR (OLD.status = 'PREPARING' AND NEW.status = 'READY')
        OR (OLD.status = 'READY' AND NEW.status = 'SERVED')
        OR (OLD.status = 'SERVED' AND NEW.status = 'COMPLETED')
    ) THEN
        RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_validate_status BEFORE UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION validate_order_status_transition();

-- Demo data. The application accepts this legacy password; use BCrypt in production.
INSERT INTO users (username, password, full_name, role)
VALUES ('admin', 'admin123', 'System Administrator', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

INSERT INTO tables (table_number, capacity, status) VALUES
    ('A01', 2, 'AVAILABLE'), ('A02', 4, 'AVAILABLE'),
    ('A03', 6, 'AVAILABLE'), ('A04', 8, 'AVAILABLE')
ON CONFLICT (table_number) DO NOTHING;

INSERT INTO categories (name, description) VALUES
    ('Burger', 'Classic burger menu'), ('Pizza', 'Italian pizza selections'),
    ('Drink', 'Cold drinks and beverages'), ('Dessert', 'Sweet desserts')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (category_id, name, description, price, image_url, is_available)
SELECT c.id, seed.name, seed.description, seed.price, seed.image_url, TRUE
FROM (VALUES
    ('Burger', 'Classic Burger', 'Beef, lettuce, tomato, cheddar', 120000.00::NUMERIC(10, 2), 'https://example.com/burger.png'),
    ('Burger', 'Double Cheese Burger', 'Double patty with cheddar', 160000.00::NUMERIC(10, 2), 'https://example.com/double-burger.png'),
    ('Drink', 'Coca Cola', 'Cold soft drink', 25000.00::NUMERIC(10, 2), 'https://example.com/coke.png'),
    ('Drink', 'Lemon Tea', 'Fresh iced tea', 30000.00::NUMERIC(10, 2), 'https://example.com/lemon-tea.png'),
    ('Dessert', 'Brownie', 'Chocolate brownie', 40000.00::NUMERIC(10, 2), 'https://example.com/brownie.png'),
    ('Pizza', 'Margherita Pizza', 'Tomato, mozzarella, basil', 140000.00::NUMERIC(10, 2), 'https://example.com/margherita.png')
) AS seed(category_name, name, description, price, image_url)
JOIN categories c ON c.name = seed.category_name
WHERE NOT EXISTS (
    SELECT 1 FROM products p WHERE p.category_id = c.id AND p.name = seed.name
);
