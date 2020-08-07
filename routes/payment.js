var express = require('express');
var router = express.Router();

const { isSignedIn, isAuthenticated } = require('../controllers/auth');
const { verification, razorpay } = require('../controllers/razor');
const { getUserById, pushOrderInPurchaseList } = require('../controllers/user');
const { updateStock } = require('../controllers/product');

router.param('userId', getUserById);

router.post('/verification/:useId', verification);

router.post('/razorpay/:userId', isSignedIn, isAuthenticated, pushOrderInPurchaseList, updateStock, razorpay);

module.exports = router;
