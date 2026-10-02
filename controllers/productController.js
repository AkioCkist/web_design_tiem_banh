const { getProducts, getAllProducts, getTopProducts } = require('../models/productModel');

async function home(req, res) {
  const [newProducts, topProducts] = await Promise.all([
    getProducts(8),
    getTopProducts(4)
  ]);

  const search = typeof req.query.s === 'string' ? req.query.s.trim() : '';
  const filterProducts = (products) => search
    ? products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  res.render('layout', {
    title: 'Tiệm bánh Hỷ Lâm Môn',
    view: 'home',
    search,
    newProducts: filterProducts(newProducts),
    topProducts: filterProducts(topProducts)
  });
}

async function productDetail(req, res) {
  const products = await getAllProducts();
  const product = products.find((item) => item.id === Number(req.params.id)) || products[0];
  res.render('layout', { title: product.name, view: 'product', product, relatedProducts: products.slice(0, 3) });
}

function about(req, res) {
  res.render('layout', { title: 'Giới thiệu | Tiệm bánh Hỷ Lâm Môn', view: 'about' });
}

function contacts(req, res) {
  res.render('layout', { title: 'Liên hệ | Tiệm bánh Hỷ Lâm Môn', view: 'contacts' });
}

function shoppingCart(req, res) {
  res.render('layout', { title: 'Giỏ hàng | Tiệm bánh Hỷ Lâm Môn', view: 'shopping-cart' });
}

async function productType(req, res) {
  const products = await getAllProducts();
  res.render('layout', {
    title: 'Sản phẩm | Tiệm bánh Hỷ Lâm Môn',
    view: 'product-type',
    products
  });
}

module.exports = { home, productDetail, about, contacts, shoppingCart, productType };
