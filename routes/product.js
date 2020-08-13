var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');
const { isSignedIn, isAdmin, isAuthenticated } = require('../controllers/auth');
const { createProduct, deleteProduct, getProductById, updateProduct, getProduct, getProducts, productsOfShop, listBySearch } = require('../controllers/product');
const { getUserById } = require('../controllers/user');
const { upload } = require('../controllers/multer');

//all of params
router.param('userId', getUserById);
router.param('productId', getProductById);

router.post('/product/create/:userId', isSignedIn, isAuthenticated, isAdmin, upload.array('images', 8), createProduct);
router.delete('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, deleteProduct);
router.get('/products/:categoryId/:cityId', getProducts);
router.get('/product/:productId', getProduct);
router.get('/products/:shopId', productsOfShop);
router.get('/search/products/:cityId', listBySearch);

// Update Product
router.put('/product/update/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, upload.array('images', 8), updateProduct);

module.exports = router;
