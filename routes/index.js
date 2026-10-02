const express = require('express');
const { home, productDetail, about, contacts, shoppingCart, productType, loginPage, login, signupPage, signup, logout, addCart, updateCart, removeCart } = require('../controllers/productController');

const router = express.Router();

router.get('/', home);
router.get('/about.html', about);
router.get('/contacts.html', contacts);
router.get('/product_type.html', productType);
router.get('/shopping_cart.html', shoppingCart);
router.get('/login.html', loginPage);
router.post('/login.html', login);
router.get('/signup.html', signupPage);
router.post('/signup.html', signup);
router.get('/logout', logout);
router.post('/cart', addCart);
router.post('/cart/update', updateCart);
router.post('/cart/remove', removeCart);
router.get('/products/:id', productDetail);

module.exports = router;
