-- Database Schema for Rpszz.shop

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    category VARCHAR(100) NOT NULL DEFAULT 'other',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table for status checking
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL, -- Used to lookup order status
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'delivered')),
    tracking_number VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed data for Products
INSERT INTO products (title, description, price, image_url, status, category) VALUES
('Vintage Denim Jacket', 'Classic oversized 90s vintage denim jacket. Minor distressing on cuffs, otherwise perfect condition.', 1200.00, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80', 'available', 'clothing'),
('Retro Leather Boots', 'Genuine brown leather boots, Unisex Size 41. Cleaned and conditioned, ready to wear.', 2500.00, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80', 'reserved', 'footwear'),
('Analog Film Camera', 'Minolta SLR 35mm film camera. Tested, light meter working, includes 50mm f/1.7 lens.', 3400.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', 'sold', 'electronics'),
('Graphic Streetwear Tee', 'Black heavy cotton graphic t-shirt. Oversized boxy fit, Size L. worn twice.', 450.00, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', 'available', 'clothing');

-- Seed data for Reviews
INSERT INTO reviews (customer_name, rating, comment, avatar_url) VALUES
('Anan P.', 5, 'Got a vintage jacket from here. Authentic condition as described, very responsive chat, shipped next day!', 'https://api.dicebear.com/7.x/adventurer/svg?seed=anan'),
('Sompong K.', 4.5, 'Super cool camera, works perfectly. Friendly service!', 'https://api.dicebear.com/7.x/adventurer/svg?seed=sompong'),
('Nutcha T.', 5, 'Quick response, safe packaging. Highly recommended for vintage lovers.', 'https://api.dicebear.com/7.x/adventurer/svg?seed=nutcha');

-- Seed data for Orders
INSERT INTO orders (customer_name, customer_phone, product_id, status, tracking_number) VALUES
('Sompong K.', '0812345678', (SELECT id FROM products WHERE title = 'Analog Film Camera' LIMIT 1), 'delivered', 'TH12345678901'),
('Retro Customer', '0898765432', (SELECT id FROM products WHERE title = 'Retro Leather Boots' LIMIT 1), 'preparing', NULL);
