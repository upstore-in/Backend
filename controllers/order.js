const { Order, ProductCart } = require('../models/order');
const axios = require('axios');
const FormData = require('form-data');
const Product = require('../models/product');
const Shop = require('../models/shop');

exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate('products.product, name stock price')
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: 'NO order found in DB'
        });
      }
      req.order = order;
      next();
    });
};

exports.createOrder = async (req, res) => {
  req.body.order.user = req.profile;

  const order = new Order(req.body.order);

  await order.save((err, order) => {
    if (err || !order) {
      return res.status(400).json({
        error: 'Failed to save your order in DB'
      });
    }

    order.user.encry_password = undefined;
    order.user.salt = undefined;
    res.json(order);
  });

  const VAR1 = `${order.products[0].name} ${order.products.length > 1 ? `and ${order.products.length - 1} more items` : ''}`;

  const fd = new FormData();
  fd.append('From', 'UPSTOR');
  fd.append('To', `${req.profile.phoneNumber}`);
  fd.append('TemplateName', 'Confirmation Msg');
  fd.append('VAR1', VAR1);
  fd.append('VAR2', order.transaction_id);

  axios
    .post(`https://2factor.in/API/V1/${process.env.OTPAPIKEY}/ADDON_SERVICES/SEND/TSMS`, fd, { headers: fd.getHeaders() })
    .then(res => {
      console.log(`statusCode: ${res.statusCode}`);
    })
    .catch(error => {
      console.error(error);
    });
};

exports.getAllOrders = (req, res) => {
  Order.find({})
    .populate('products.product', 'shopName shopId variants')
    .populate('user', '_id name')

    .sort({ _id: -1 })

    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: 'No orders found in DB'
        });
      }

      res.json(order);
    });
};

exports.getShopOrders = async (req, res) => {
  const currentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems;

  await Order.countDocuments({ 'products.shopId': req.params.shopId }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      totalItems = result;
    }
  });

  Order.find({ 'products.shopId': req.params.shopId, status: 'Recieved' })
    .skip((currentPage - 1) * perPage)
    .sort({ _id: -1 })
    .limit(perPage)
    .then(docs => {
      const response = {
        totalCount: totalItems,
        orders: docs.map(document => {
          console.log(document);
          return {
            _id: document._id,
            transaction_id: document.transaction_id,
            products: document.products.filter(doc => doc.shopId.toString() === req.params.shopId)
          };
        })
      };
      res.status(200).json(response);
    });
};

exports.getOrderStatus = (req, res) => {
  res.json(Order.schema.path('status').enumValues);
};

exports.updateStatus = (req, res) => {
  Order.update({ _id: req.params.orderId }, { $set: { status: req.body.status } }, (err, order) => {
    if (err) {
      return res.status(400).json({
        error: 'Cannot update order status'
      });
    }
    res.json(order);
  });
};
