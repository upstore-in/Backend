const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      default: 'Shop Name Here',
      maxlength: 35
    },
    owner: {
      names: [
        {
          type: String,
          required: true
        }
      ]
    },
    address: {
      type: String,
      required: true,
      default: 'Address Here'
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 2000
    },
    banner: {
      type: String,
      required: true
    },
    categories: [
      {
        type: ObjectId,
        ref: 'Category'
      }
    ],
    open: {
      type: Boolean,
      default: false
    },
    city: {
      type: String,
      required: true,
      default: 'Your City Name'
    },
    cityId: {
      type: ObjectId,
      ref: 'City',
      required: true
    },
    contact: {
      number: {
        type: Number
      },
      email: {
        type: String
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);
