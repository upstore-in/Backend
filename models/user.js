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
        unique: true
      }
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true
    },
    adresses: [
      {
        type: String,
        maxlength: 400,
        trim: true
      }
    ],
    email: {
      type: String,
      trim: true,
      index: {
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
    shopId: {
      type: ObjectId,
      ref: 'Shop'
    },
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
