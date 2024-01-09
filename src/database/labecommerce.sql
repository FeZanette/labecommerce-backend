-- Active: 1702904650481@@127.0.0.1@3306

CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL
);

PRAGMA table_info ('users');

INSERT INTO users (id, name, email, password, created_at)
VALUES
    ('u001', 'Maia', 'maia@email.com', 'maia1234', CURRENT_TIMESTAMP),
    ('u002', 'Clara', 'clara@email.com', 'clara1234', CURRENT_TIMESTAMP),
    ('u003', 'Serena', 'serena@email.com', 'serena1234', CURRENT_TIMESTAMP);

SELECT * FROM users;

CREATE TABLE products (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL
);

PRAGMA table_info ('products');

INSERT INTO products (id, name, price, description, image_url)
VALUES
    ('p001', 'Mouse gamer', 250.00, 'Melhor mouse do mercado!', 'https://picsum.photos/seed/Mouse%20gamer/400'),
    ('p002', 'Monitor', 900.00, 'Monitor LED Full HD 24 polegadas', 'https://picsum.photos/seed/Monitor/400'),
    ('p003', 'Teclado', 120.00, 'Melhor marca do mercado', 'https://picsum.photos/seed/Monitor/400');

SELECT * FROM products;

SELECT * FROM users;

SELECT * FROM products;

SELECT * FROM products
WHERE name LIKE '%gamer%';

INSERT INTO users (id, name, email, password, created_at)
VALUES ('U004', 'Erik', 'erik@email.com', 'erik1234', CURRENT_TIMESTAMP);

INSERT INTO products (id, name, price, description, image_url)
VALUES ('p004', 'Notebook', 3500, 'Notebook ótimo custo-benefício', 'https://www.kabum.com.br/?product=produto');

DELETE FROM users
WHERE id = 'U004'

DELETE FROM products
WHERE id = 'p004';

UPDATE products
SET 
    name = 'Monitor (alterado)',
    price = 990.90,
    description = 'Monitor Led Full HD 24 polegadas alterado',
    image_url = 'https://www.kabum.com.br/busca/mouse-redragon'
WHERE id = 'p002';

CREATE TABLE purchases (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    buyer TEXT NOT NULL,
    total_price REAL NOT NULL,
    created_at TEXT NOT NULL TIMESTAMP,
    FOREIGN KEY (buyer) REFERENCES users(id);
)

INSERT INTO purchases (id, buyer, total_price, created_at)
VALUES
    ('p001', 'u001', 299.99, CURRENT_TIMESTAMP),
    ('p002', 'u002', 99.99, CURRENT_TIMESTAMP);

UPDATE purchases
SET total_price = 1299.99
WHERE id = 'p001';

SELECT
    purchases.id,
    purchases.buyer AS buyer_id,
    users.name AS buyer_name,
    users.email,
    purchases.total_price,
    purchases.created_at
FROM purchases
INNER JOIN users
ON purchases.buyer = users.id;
