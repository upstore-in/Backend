var express = require('express');
var router = express.Router();

const { getCategories, createCategory } = require('../controllers/category');
const { isSignedIn, isDeveloper } = require('../controllers/auth');
const { getProductById } = require('../controllers/product');
const { getUserById } = require('../controllers/user');

//all of params
router.param('userId', getUserById);
router.param('productId', getProductById);

router.get('/categories', getCategories);
router.post('/category/create/:userId', isSignedIn, isDeveloper, createCategory);

module.exports = router;
