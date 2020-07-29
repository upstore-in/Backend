const express = require('express');
const router = express.Router();
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { getUserById, pushOrderInPurchaseList } = require('../controllers/user');
const { updateStock } = require('../controllers/product');

const { getOrderById, createOrder, getShopOrders, getOrderStatus, updateStatus } = require('../controllers/order');

//params
router.param('userId', getUserById);
router.param('orderId', getOrderById);

//Actual routes
//create
router.post('/order/create/:userId', isSignedIn, isAuthenticated, pushOrderInPurchaseList, updateStock, createOrder);
//read
router.get('/orders/all/:userId', isSignedIn, isAuthenticated, isAdmin, getShopOrders);
//status of order
router.get('/order/status/:userId', isSignedIn, isAuthenticated, isAdmin, getOrderStatus);
router.put('/order/:orderId/status/:userId', isSignedIn, isAuthenticated, isAdmin, updateStatus);

module.exports = router;

// CREATE ORDER REQUEST
// {
//     "order":{
//         "products":[
//             {
//                 "product":"5eff91026215e43754fc14dc",
//                 "name":"Adidas T Shirt",
//                 "price":1000,
//                 "count":1
//             },
//             {
//                 "product":"5f00235ba483a839974800be",
//                 "name":"Nike Shoes",
//                 "price":1000,
//                 "count":2
//             }
//         ],
//         "transaction_id":150,
//         "amount":3000,
//         "address":"User's Address",
//         "status":"Recieved",
//         "user":"5f02ba83e046ac568114120f"
//     }
// }
