CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF'
);

CREATE TABLE IF NOT EXISTS tables (
    id BIGSERIAL PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dining_sessions (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL,
    number_of_people INTEGER NOT NULL CHECK (number_of_people > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_table FOREIGN KEY (table_id) REFERENCES tables (id)
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    price NUMERIC(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(10, 2) NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    rejected_reason VARCHAR(255),
    CONSTRAINT fk_order_session FOREIGN KEY (session_id) REFERENCES dining_sessions (id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE INDEX IF NOT EXISTS idx_tables_status_capacity ON tables (status, capacity);
CREATE INDEX IF NOT EXISTS idx_sessions_table_status ON dining_sessions (table_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders (session_id, status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id, is_available);

INSERT INTO users (username, password, full_name, role)
VALUES ('admin', 'admin123', 'System Administrator', 'ADMIN');

INSERT INTO tables (table_number, capacity, status) VALUES
('A01', 2, 'AVAILABLE'),
('A02', 4, 'AVAILABLE'),
('A03', 6, 'AVAILABLE'),
('A04', 8, 'AVAILABLE');

INSERT INTO categories (name, description) VALUES
('Burger', 'Classic burger menu'),
('Pizza', 'Italian pizza selections'),
('Drink', 'Cold drinks and beverages'),
('Dessert', 'Sweet desserts');

INSERT INTO products (category_id, name, description, price, image_url, is_available)
VALUES
((SELECT id FROM categories WHERE name = 'Burger'), 'Classic Burger', 'Beef, lettuce, tomato, cheddar', 120000.00, 'https://example.com/burger.png', TRUE),
((SELECT id FROM categories WHERE name = 'Burger'), 'Double Cheese Burger', 'Double patty with cheddar', 160000.00, 'https://example.com/double-burger.png', TRUE),
((SELECT id FROM categories WHERE name = 'Drink'), 'Coca Cola', 'Cold soft drink', 25000.00, 'https://example.com/coke.png', TRUE),
((SELECT id FROM categories WHERE name = 'Drink'), 'Lemon Tea', 'Fresh iced tea', 30000.00, 'https://example.com/lemon-tea.png', TRUE),
((SELECT id FROM categories WHERE name = 'Dessert'), 'Brownie', 'Chocolate brownie', 40000.00, 'https://example.com/brownie.png', TRUE),
((SELECT id FROM categories WHERE name = 'Pizza'), 'Margherita Pizza', 'Tomato, mozzarella, basil', 140000.00, 'https://example.com/margherita.png', TRUE);
