const { Order } = require('../models/order');

const User = require('../models/user');

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'No user was found in DB'
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  console.log(req.body);

  User.findByIdAndUpdate({ _id: req.profile._id }, { $set: req.body }, { new: true, useFindAndModify: false }, (err, user) => {
    if (err) {
      return res.status(400).json({
        error: 'You are not authorized to update this user'
      });
    }
    user.salt = undefined;
    user.encry_password = undefined;
    res.json(user);
  });
};

exports.userPurchaseList = (req, res) => {
  console.log(req.profile._id);
  Order.find({ user: req.profile._id })
    .sort({ _id: -1 })
    .populate('User', '_id name')
    .populate('products.product', '-description -sold -createdAt -updatedAt -__v')
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: 'No Orders in this account'
        });
      }
      return res.json(order);
    });
};

exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];

  req.body.order.products.forEach(product => {
    purchases.push({
      _id: product.product,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      transaction_id: req.body.order.transaction_id
    });
  });

  //store this in DB
  User.findOneAndUpdate({ _id: req.profile._id }, { $push: { purchases: purchases } }, { new: true, useFindAndModify: false }, (err, purchases) => {
    if (err) {
      return res.status(400).json({
        error: 'Unable to save purchase list'
      });
    }
    next();
  });
};
