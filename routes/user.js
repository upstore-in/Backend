const express = require('express');
const router = express.Router();

const { getUserById, getUser, updateUser, userPurchaseList } = require('../controllers/user');
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { addToCart, getCart, removeFromCart, clearCart, checkAndDelete } = require('../controllers/wishlistAndCart');

router.param('userId', getUserById);

router.get('/user/:userId', isSignedIn, isAuthenticated, getUser);
router.put('/user/:userId', isSignedIn, isAuthenticated, updateUser);
router.post('/user/addToCart/:userId', isSignedIn, isAuthenticated, addToCart);
router.post('/checkAndDelete', checkAndDelete);
router.get('/user/getCart/:userId', isSignedIn, isAuthenticated, getCart);
router.get('/orders/user/:userId', isSignedIn, isAuthenticated, userPurchaseList);
router.delete('/cart/:productId/:userId', isSignedIn, isAuthenticated, removeFromCart);
router.delete('/clear/cart/:userId', isSignedIn, isAuthenticated, clearCart);
module.exports = router;
