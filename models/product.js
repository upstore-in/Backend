const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    shopId: {
      type: ObjectId,
      ref: 'Shop',
      required: true
    },
    inShopId: {
      type: String
    },
    shopName: {
      type: String,
      required: true
    },
    searchIndex: {
      type: String
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
    variants: [
      {
        size: {
          type: String
        },
        color: {
          type: String
        },
        product: {
          type: ObjectId,
          required: true,
          ref: 'Product'
        },
        parent: {
          type: Boolean,
          default: false
        }
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
        type: String,
        required: true
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
