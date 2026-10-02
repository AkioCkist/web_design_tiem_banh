const express = require('express');
const { home, productDetail, about, contacts, shoppingCart, productType } = require('../controllers/productController');

const router = express.Router();

router.get('/', home);
router.get('/about.html', about);
router.get('/contacts.html', contacts);
router.get('/product_type.html', productType);
router.get('/shopping_cart.html', shoppingCart);
router.get('/products/:id', productDetail);

module.exports = router;
