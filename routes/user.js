const express = require('express');
const router = express.Router();

const { getUserById, getUser, updateUser, userPurchaseList } = require('../controllers/user');
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { addToCart, getCart, removeFromCart } = require('../controllers/wishlistAndCart');

router.param('userId', getUserById);

router.get('/user/:userId', isSignedIn, isAuthenticated, getUser);
router.put('/user/:userId', isSignedIn, isAuthenticated, updateUser);
// use /:user_id instead of /:userId to avoid getUserById middleware
router.post('/user/addToCart/:user_id', isSignedIn, isAuthenticated, addToCart);
router.get('/user/getCart/:user_id', isSignedIn, isAuthenticated, getCart);
router.get('/orders/user/:usersId', isSignedIn, isAuthenticated, userPurchaseList);
router.delete('/cart/:productId/:user_id', isSignedIn, isAuthenticated, removeFromCart);
module.exports = router;
