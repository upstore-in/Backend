const crypto = require('crypto');
const shortid = require('shortid');
const Razorpay = require('razorpay');

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
  const payment_capture = 1;
  const amount = 499;
  const currency = 'INR';
  console.log(amount);
  const options = {
    amount: amount * 100,
    currency,
    receipt: shortid.generate(),
    payment_capture
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount
    });
  } catch (error) {
    console.log(error);
  }
};
