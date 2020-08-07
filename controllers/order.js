const { Order, ProductCart } = require('../models/order');

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
    if (err) {
      return res.status(400).json({
        error: 'Failed to save your order in DB'
      });
    }
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
