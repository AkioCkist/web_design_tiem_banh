const mysql = require('mysql2/promise');

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

module.exports = { getProducts, getProductsByType, getAllProducts, getTopProducts, mysqlPool };
