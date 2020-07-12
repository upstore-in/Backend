var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');
const { signout, signupEmail, signinEmail, isSignedIn, getPhoneNumber, verifyOTP } = require('../controllers/auth');

router.post('/signupEmail', [check('name', 'name should be at least 3 char').isLength({ min: 3 }), check('email', 'Invalid email').isEmail().normalizeEmail(), check('password', 'password should be at least 3 char').isLength({ min: 6 }).isAlphanumeric()], signupEmail);

router.post('/signinEmail', [check('email', 'email is required').normalizeEmail(), check('password', 'password should contain at least 6 characters and should be alphanumeric').isLength({ min: 6 })], signinEmail);

router.post('/getNumber', [check('number', 'Please enter a valid number').isLength({ min: 10 })], getPhoneNumber);

router.post('/verifyOTP', verifyOTP);

router.get('/signout', signout);

module.exports = router;
