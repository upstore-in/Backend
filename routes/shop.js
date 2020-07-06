var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');
const { isSignedIn, isAdmin, isAuthenticated } = require('../controllers/auth');
const { getUserById } = require('../controllers/user');
const { addShop, updateShop, getShop, getShops } = require('../controllers/shop');

//all of params
router.param('userId', getUserById);

router.post('/shop/add/:userId', isSignedIn, isAuthenticated, isAdmin, addShop);
// Update Shop Details
router.put('/shop/update/:userId/:shopId', isSignedIn, isAuthenticated, isAdmin, updateShop);
router.get('/shops/:categoryId/:cityId', getShops);
// router.get('/shops/:cityId', getShops);
router.get('/shop/:shopId', getShop);

module.exports = router;
