var mongoose = require('mongoose');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const { ObjectId } = mongoose.Schema;

var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: 32,
      trim: true,
      default: null
    },
    phoneNumber: {
      type: Number,
      trim: true,
      index: {
        sparse: true,
        unique: true
      },
      default: null
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true
    },
    addresses: [
      {
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
      }
    ],
    email: {
      type: String,
      trim: true,
      index: {
        sparse: true,
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } }
      }
    },
    userinfo: {
      type: String,
      trim: true
    },
    encry_password: {
      type: String,
      default: null
    },
    salt: String,
    role: {
      type: Number,
      default: 0
    },
    shopIds: [
      {
        shopId: {
          type: ObjectId,
          ref: 'Shop'
        },
        shopName: {
          type: String
        },
        category: { type: ObjectId, ref: 'Category' }
      }
    ],
    purchases: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
);

userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  autheticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return '';
    try {
      return crypto.createHmac('sha256', this.salt).update(plainpassword).digest('hex');
    } catch (err) {
      return '';
    }
  }
};

module.exports = mongoose.model('User', userSchema);
