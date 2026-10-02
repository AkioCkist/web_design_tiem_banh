const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_banhang',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

async function getProducts(limit = 8) {
  const [rows] = await mysqlPool.query(
    'SELECT id, name, unit_price, promotion_price, image, unit FROM products ORDER BY created_at DESC, id DESC LIMIT ?',
    [limit]
  );
  return rows;
}

async function getProductsByType(type) {
  const [rows] = await mysqlPool.query(
    'SELECT id, name, description, unit_price, promotion_price, image, unit FROM products WHERE id_type = ? ORDER BY id ASC',
    [type]
  );
  return rows;
}

async function getAllProducts() {
  const [rows] = await mysqlPool.query(
    'SELECT id, name, description, unit_price, promotion_price, image, unit FROM products ORDER BY id ASC'
  );
  return rows;
}

async function getTopProducts(limit = 4) {
  const [rows] = await mysqlPool.query(
    'SELECT id, name, description, unit_price, promotion_price, image, unit FROM products ORDER BY promotion_price DESC, id DESC LIMIT ?',
    [limit]
  );
  return rows;
}

async function ensureCartTable() {
  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      product_id INT UNSIGNED NOT NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY cart_user_product (user_id, product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function authenticateUser(email, password) {
  const [rows] = await mysqlPool.query(
    'SELECT id, full_name, email, password FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  if (!rows.length) return null;
  const user = rows[0];
  const valid = user.password.startsWith('$2')
    ? await bcrypt.compare(password, user.password)
    : password === user.password;
  if (!valid) return null;
  return { id: user.id, fullName: user.full_name, email: user.email };
}

async function createUser(fullName, email, password) {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await mysqlPool.query(
    'INSERT INTO users (full_name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [fullName, email, hash]
  );
  return { id: result.insertId, fullName, email };
}

async function getCart(userId) {
  await ensureCartTable();
  const [rows] = await mysqlPool.query(`
    SELECT c.product_id, c.quantity, p.name, p.image, p.unit_price, p.promotion_price,
      (CASE WHEN p.promotion_price IS NOT NULL AND p.promotion_price > 0 AND p.promotion_price < p.unit_price
        THEN p.promotion_price ELSE p.unit_price END) AS price
    FROM cart_items c
    INNER JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `, [userId]);
  return rows.map((item) => ({ ...item, subtotal: Number(item.price) * item.quantity }));
}

async function addToCart(userId, productId, quantity = 1) {
  await ensureCartTable();
  await mysqlPool.query(`
    INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `, [userId, productId, Math.max(1, Number(quantity) || 1)]);
}

async function updateCartItem(userId, productId, quantity) {
  await ensureCartTable();
  if (Number(quantity) < 1) {
    return removeFromCart(userId, productId);
  }
  await mysqlPool.query(
    'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
    [Number(quantity), userId, productId]
  );
}

async function removeFromCart(userId, productId) {
  await ensureCartTable();
  await mysqlPool.query(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
}

module.exports = {
  getProducts, getProductsByType, getAllProducts, getTopProducts,
  authenticateUser, createUser, getCart, addToCart, updateCartItem,
  removeFromCart, ensureCartTable, mysqlPool
};
