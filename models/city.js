const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('City', citySchema);
