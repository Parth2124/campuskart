-- CampusKart Database Setup Script for PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    class VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    enrollment_number VARCHAR(50),
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    mode TEXT CHECK (mode IN ('buy', 'borrow', 'free')) NOT NULL,
    image_url VARCHAR(500),
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    seller_id INT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (name, email, password, class, phone, role)
VALUES ('Admin', 'admin@campuskart.com', '$2a$10$V5dGUfTpCWicMBQbIZWoDu6taX21sEWY0Jg3P8JGvE5dRFpkYzEYu', 'Admin', '0000000000', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sample users
INSERT INTO users (name, email, password, class, phone, role)
VALUES
('John Doe', 'john@student.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '2nd Year', '+1234567890', 'user'),
('Jane Smith', 'jane@student.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '3rd Year', '+1987654321', 'user')
ON CONFLICT (email) DO NOTHING;

-- Sample items
INSERT INTO items (title, description, price, category, mode, phone, email, seller_id, status, image_url)
VALUES
('Chemistry Lab Coat', 'White lab coat, size M, barely used. Perfect for chemistry lab sessions.', 15.00, 'lab-equipment', 'buy', '+1234567890', 'john.doe@gmail.com', 2, 'approved', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'),
('Calculus Textbook', 'Calculus: Early Transcendentals, 8th Edition. Good condition.', 25.00, 'books', 'buy', '+1234567890', 'john.doe@gmail.com', 2, 'approved', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'),
('Laptop Stand', 'Adjustable aluminum laptop stand.', 20.00, 'electronics', 'buy', '+1987654321', 'jane.smith@gmail.com', 3, 'approved', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=300&fit=crop'),
('Basketball', 'Indoor/outdoor basketball, good condition.', 0.00, 'sports', 'free', '+1987654321', 'jane.smith@gmail.com', 3, 'approved', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop'),
('Winter Jacket', 'Warm winter jacket, size L.', 30.00, 'clothing', 'buy', '+1234567890', 'john.doe@gmail.com', 2, 'approved', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop');
