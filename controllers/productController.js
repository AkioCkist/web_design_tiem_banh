const {
  getProducts, getAllProducts, getTopProducts, authenticateUser, createUser,
  getCart, addToCart, updateCartItem, removeFromCart, ensureCartTable
} = require('../models/productModel');

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

async function shoppingCart(req, res) {
  if (!req.session.user) return res.redirect('/login.html?next=/shopping_cart.html');
  const items = await getCart(req.session.user.id);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  res.render('layout', { title: 'Giỏ hàng | Tiệm bánh Hỷ Lâm Môn', view: 'shopping-cart', items, total, user: req.session.user });
}

function loginPage(req, res) {
  res.render('layout', { title: 'Đăng nhập | Tiệm bánh Hỷ Lâm Môn', view: 'login', error: null, next: req.query.next || '/shopping_cart.html' });
}

function signupPage(req, res) {
  res.render('layout', { title: 'Đăng ký | Tiệm bánh Hỷ Lâm Môn', view: 'signup', error: null });
}

async function login(req, res) {
  const user = await authenticateUser(String(req.body.email || '').trim(), String(req.body.password || ''));
  if (!user) return res.status(401).render('layout', { title: 'Đăng nhập | Tiệm bánh Hỷ Lâm Môn', view: 'login', error: 'Email hoặc mật khẩu không đúng.', next: req.body.next || '/shopping_cart.html' });
  req.session.user = user;
  res.redirect(req.body.next || '/');
}

async function signup(req, res) {
  const fullName = String(req.body.fullName || '').trim();
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '');
  if (!fullName || !email || password.length < 6) {
    return res.status(400).render('layout', { title: 'Đăng ký | Tiệm bánh Hỷ Lâm Môn', view: 'signup', error: 'Vui lòng nhập đủ thông tin, mật khẩu tối thiểu 6 ký tự.' });
  }
  try {
    req.session.user = await createUser(fullName, email, password);
    res.redirect('/');
  } catch (error) {
    const message = error.code === 'ER_DUP_ENTRY' ? 'Email này đã được đăng ký.' : 'Không thể tạo tài khoản lúc này.';
    res.status(400).render('layout', { title: 'Đăng ký | Tiệm bánh Hỷ Lâm Môn', view: 'signup', error: message });
  }
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/'));
}

async function addCart(req, res) {
  if (!req.session.user) return res.redirect(`/login.html?next=${encodeURIComponent('/shopping_cart.html')}`);
  await addToCart(req.session.user.id, req.body.productId, req.body.quantity);
  res.redirect('/shopping_cart.html');
}

async function updateCart(req, res) {
  if (!req.session.user) return res.redirect('/login.html');
  await updateCartItem(req.session.user.id, req.body.productId, req.body.quantity);
  res.redirect('/shopping_cart.html');
}

async function removeCart(req, res) {
  if (!req.session.user) return res.redirect('/login.html');
  await removeFromCart(req.session.user.id, req.body.productId);
  res.redirect('/shopping_cart.html');
}

async function productType(req, res) {
  const products = await getAllProducts();
  res.render('layout', {
    title: 'Sản phẩm | Tiệm bánh Hỷ Lâm Môn',
    view: 'product-type',
    products
  });
}

module.exports = { home, productDetail, about, contacts, shoppingCart, productType, loginPage, login, signupPage, signup, logout, addCart, updateCart, removeCart, ensureCartTable };
