const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32
    },
    shopId: {
      type: ObjectId,
      ref: 'Shop',
      required: true
    },
    shopName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true,
      default: 'No description available for this product',
      maxlength: 2000
    },
    price: {
      type: Number,
      required: true,
      maxlength: 32,
      trim: true
    },
    markedPrice: {
      type: Number,
      required: true,
      maxlength: 32,
      trim: true
    },
    category: {
      type: ObjectId,
      ref: 'Category',
      required: true
    },
    size: [
      {
        type: String
      }
    ],
    city: {
      type: ObjectId,
      ref: 'City',
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    sold: {
      type: Number,
      default: 0
    },
    photos: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
