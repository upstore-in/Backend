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

  let shopIds = [];
  let contactNumbers = [];
  let products = [];
  await Promise.all(
    order.products.map(async doc => {
      const product = await Product.findById(doc.product);
      products.push(product);

      shopIds.push(product.shopId.toString());
    })
  );

  shopIds = Array.from(new Set(shopIds));

  await Promise.all(
    shopIds.map(async id => {
      const shop = await Shop.findById(id);

      contactNumbers.push(shop.contact.number);
    })
  );

  let productsOfShop = [];
  shopIds.forEach((shopId, index) => {
    productsOfShop = products.filter(product => {
      return product.shopId.toString() === shopId;
    });
    let VAR2 = '';
    productsOfShop.forEach(product => {
      const index = order.products.findIndex(doc => doc.product.toString() === product._id.toString());

      VAR2 += `[ product: ${product.name}, price:${product.price}, ${product.inShopId ? `ID: ${product.inShopId},` : ''} quantity: ${order.products[index].quantity} ]`;
    });

    const fd = new FormData();
    fd.append('From', 'UPSTOR');
    fd.append('To', `${contactNumbers[index]}`);
    fd.append('TemplateName', 'informShopkeeper');
    fd.append('VAR1', `${order.transaction_id} Customer:${order.address.contactName}`);
    fd.append('VAR2', VAR2);

    console.log(VAR2);
    axios
      .post(`https://2factor.in/API/V1/${process.env.OTPAPIKEY}/ADDON_SERVICES/SEND/TSMS`, fd, { headers: fd.getHeaders() })
      .then(res => {
        console.log(`statusCode: ${res.statusCode}`);
      })
      .catch(error => {
        console.error(error);
      });
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
