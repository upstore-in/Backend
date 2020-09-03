const { Order, ProductCart } = require('../models/order');
const axios = require('axios');
const FormData = require('form-data');

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

exports.createOrder = (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);

  order.save((err, order) => {
    if (err || !order) {
      return res.status(400).json({
        error: 'Failed to save your order in DB'
      });
    }
    console.log(req.profile.phoneNumber);

    const VAR1 = `${order.products[0].name} ${order.products.length > 1 ? `and ${order.products.length - 1} more items` : ''}`;

    const fd = new FormData();
    fd.append('From', 'UPSTOR');
    fd.append('To', `${req.profile.phoneNumber}`);
    fd.append('TemplateName', 'Confirmation Msg');
    fd.append('VAR1', VAR1);
    fd.append('VAR2', order.transaction_id);
    console.log(fd);
    axios
      .post(`https://2factor.in/API/V1/${process.env.OTPAPIKEY}/ADDON_SERVICES/SEND/TSMS`, fd, { headers: fd.getHeaders() })
      .then(res => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(res);
      })
      .catch(error => {
        console.error(error);
      });

    order.user.encry_password = undefined;
    order.user.salt = undefined;
    res.json(order);
  });
};

exports.getShopOrders = (req, res) => {
  Order.find({})
    .populate('user', '_id name')
    .populate('products.product')
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: 'No orders found in DB'
        });
      }

      console.log(order);

      res.json(order);
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

exports.trial = (req, res, next) => {
  const fd = new FormData();
  fd.append('From', 'UPSTOR');
  fd.append('To', `8459252535`);
  fd.append('TemplateName', 'Confirmation Msg');
  fd.append('VAR1', 'jfiorjfi');
  fd.append('VAR2', 'hjbncjnhjs');
  console.log(fd);
  axios
    .post(`https://2factor.in/API/V1/${process.env.OTPAPIKEY}/ADDON_SERVICES/SEND/TSMS`, fd, { headers: fd.getHeaders() })
    .then(res => {
      console.log(`statusCode: ${res.statusCode}`);
      console.log(res);
    })
    .catch(error => {
      console.error(error);
    });
};
