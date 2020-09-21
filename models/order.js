const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const ProductCartSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: 'Product'
  },
  shopId: {
    type: ObjectId,
    ref: 'Shop'
  },
  name: String,
  quantity: Number,
  price: Number,
  size: String
});

const ProductCart = mongoose.model('ProductCart', ProductCartSchema);

const OrderSchema = new mongoose.Schema(
  {
    products: [ProductCartSchema],
    transaction_id: {},
    amount: { type: Number },
    address: {
      contactName: {
        type: String,
        maxlength: 32,
        trim: true
      },
      contactNumber: {
        type: Number,
        trim: true
      },
      address: {
        type: String,
        trim: true
      },
      default: {
        type: Boolean,
        default: false
      }
    },
    status: {
      type: String,
      default: 'Recieved',
      enum: ['Cancelled', 'Delivered', 'Shipped', 'Processing', 'Recieved']
    },
    updated: Date,
    user: {
      type: ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

module.exports = { Order, ProductCart };
