var express = require('express');
var router = express.Router();

const { isSignedIn, isAuthenticated } = require('../controllers/auth');
const { verification, razorpay } = require('../controllers/razor');

router.post('/verification', verification);

router.post('/razorpay', razorpay);

module.exports = router;
