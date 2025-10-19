-- Update existing items with proper image URLs
USE campuskart;

UPDATE items SET image_url = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop' WHERE title = 'Chemistry Lab Coat';
UPDATE items SET image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop' WHERE title = 'Calculus Textbook';
UPDATE items SET image_url = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=300&fit=crop' WHERE title = 'Laptop Stand';
UPDATE items SET image_url = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop' WHERE title = 'Basketball';
UPDATE items SET image_url = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop' WHERE title = 'Winter Jacket';

-- Show updated items
SELECT id, title, image_url FROM items WHERE image_url IS NOT NULL;
