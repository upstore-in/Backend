const crypto = require('crypto');
const shortid = require('shortid');
const Razorpay = require('razorpay');

const { Order } = require('../models/order');

const razorpay = new Razorpay({
  key_id: 'rzp_test_pKFrggt8le9TQx',
  key_secret: 'mVWjz9kYYauZzLeY0CwcHE5F'
});

exports.verification = (req, res, next) => {
  // do a validation
  const secret = '12345678';

  console.log(req.body);
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  console.log(digest, req.headers['x-razorpay-signature']);

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('request is legit');
    // process it
    require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4));
  } else {
    // pass it
  }
  res.json({ status: 'ok' });
};

exports.razorpay = async (req, res, next) => {
  // console.log(req.body.cart[0].product);
  // let amount = 0;
  // req.body.cart.map(document => {
  //   amount += document.product.price;
  // });
  const payment_capture = 1;

  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save(async (err, order) => {
    if (err) {
      return res.status(400).json({
        error: 'Failed to save your order in DB'
      });
    } else {
      const currency = 'INR';
      console.log(order.amount);
      const options = {
        amount: order.amount * 100,
        currency,
        receipt: shortid.generate(),
        payment_capture
      };

      try {
        const response = await razorpay.orders.create(options);

        res.json({
          id: response.id,
          currency: response.currency,
          amount: response.amount,
          orderId: order._id
        });
      } catch (error) {
        console.log(error);
      }
    }
  });
};
