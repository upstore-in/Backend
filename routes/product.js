var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');
const { isSignedIn, isAdmin, isAuthenticated } = require('../controllers/auth');
const { createProduct, deleteProduct, getProductById, updateProduct, getProduct, getProducts } = require('../controllers/product');
const { getUserById } = require('../controllers/user');

//all of params
router.param('userId', getUserById);
router.param('productId', getProductById);

router.post('/product/create/:userId', isSignedIn, isAuthenticated, isAdmin, createProduct);
router.get('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, deleteProduct);
router.get('/products/:categoryId/:cityId', getProducts);
router.get('/product/:productId', getProduct);
// Update Product
router.put('/product/update/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, updateProduct);

module.exports = router;
