var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');
const { isSignedIn, isAdmin, isAuthenticated } = require('../controllers/auth');
const { getUserById } = require('../controllers/user');
const { addShop, updateShop, getShop, getShops } = require('../controllers/shop');
const { getShopOrders } = require('../controllers/order');
const { productsOfShop } = require('../controllers/product');
const { upload } = require('../controllers/multer');

//all of params
router.param('userId', getUserById);

router.post('/shop/add/:userId', isSignedIn, isAuthenticated, isAdmin, upload.array('images', 4), addShop);
// Update Shop Details
router.put('/shop/update/:userId/:shopId', isSignedIn, isAuthenticated, isAdmin, upload.array('images', 4), updateShop);
router.get('/shops/:categoryId/:cityId', getShops);
router.get('/shop/orders/:userId/:shopId', isSignedIn, isAuthenticated, getShopOrders);
router.get('/shop/products/:shopId', productsOfShop);
router.get('/shop/:shopId', getShop);

module.exports = router;
