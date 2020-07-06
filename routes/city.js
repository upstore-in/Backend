var express = require('express');
var router = express.Router();

const { getCities, addCity } = require('../controllers/city');
const { getCategories, createCategory } = require('../controllers/category');
const { isSignedIn, isDeveloper } = require('../controllers/auth');
const { getProductById } = require('../controllers/product');
const { getUserById } = require('../controllers/user');

//all of params
router.param('userId', getUserById);
router.param('productId', getProductById);

router.post('/city/addCity/:userId', isSignedIn, isDeveloper, addCity);
router.get('/city/getCities', getCities);

module.exports = router;
