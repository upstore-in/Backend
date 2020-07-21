const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User'
    },
    products: [
      {
        product: {
          type: ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        wishlist: {
          type: Number,
          default: 0
        }
      }
    ],
    active: {
      type: Boolean,
      default: true
    },
    modifiedOn: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
