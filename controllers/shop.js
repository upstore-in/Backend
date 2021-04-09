const fs = require('fs');
const path = require('path');
const Shop = require('../models/shop');
const { validationResult, check } = require('express-validator');
const mongoose = require('mongoose');

exports.addShop = (req, res, next) => {
  console.log(req.body);
  const { name, description, owner, address, products, categories, city, cityId, contact } = req.body;
  let banner;
  banner = req.files[0].path;
  console.log(banner);
  const shop = new Shop({
    name,
    description,
    owner,
    address,
    products,
    banner,
    categories,
    city,
    cityId,
    contact
  });
  shop
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Added Shop Successfully',
        Shop: {
          result,
          request: {
            type: 'GET',
            url: 'http://localhost:8000/api/shop/' + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.updateShop = (req, res, next) => {
  let banner;
  const shopId = req.params.shopId;
  console.log(shopId);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const { name, description, owner, address, products, categories, city, cityId, contact } = req.body;
  const udateArr = [name, description, owner, address, products, categories, city, cityId, contact];
  if (req.files.length) {
    // update banner
    banner = req.files[0].path;

    Shop.findById(shopId).then(shop => {
      console.log(Shop);
      let oldBanner = shop.banner;
      //clear image from server
      clearImages(oldBanner);
    });
  }

  let update = {
    name,
    description,
    owner,
    address,
    products,
    categories,
    city,
    banner,
    cityId,
    banner,
    contact
  };

  console.log(update);

  for (key in update) {
    if (update[key] === undefined) {
      delete update[key];
    }
  }

  console.log(update);

  Shop.findOneAndUpdate({ _id: shopId }, { $set: update }, { new: true }, (err, document) => {
    if (err) {
      return res.json('Error occurred while updating shop');
    }
    res.status(200).json({ message: 'shop updated!', shop: document });
  });
};

const clearImages = filePath => {
  console.log(filePath);
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

exports.getShop = (req, res, next) => {
  const id = req.params.shopId;
  Shop.findById(id)
    .exec()
    .then(doc => {
      console.log('From database', doc);
      if (doc) {
        res.status(200).json({
          Shop: doc
        });
      } else {
        res.status(404).json({ message: 'No valid entry found for provided ID' });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.getShops = async (req, res, next) => {
  if (req.params.cityId) {
    const cityId = req.params.cityId;
    const categories = mongoose.Types.ObjectId(req.params.categoryId);
    // PAGINATION (30 SHOPS PER PAGE)
    const currentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    await Shop.countDocuments({ cityId, categories: { $in: [categories] } }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        totalItems = result;
      }
    });
    Shop.find({ cityId, categories: { $in: [categories] } })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .select('name description banner city open')
      .exec()
      .then(docs => {
        const response = {
          totalCount: totalItems,
          shops: docs.map(doc => {
            return {
              name: doc.name,
              city: doc.city,
              banner: doc.banner,
              description: doc.description,
              _id: doc._id,
              open: doc.open,
              request: {
                type: 'GET',
                url: 'http://localhost:8000/api/shop/' + doc._id
              }
            };
          })
        };
        res.status(200).json(response);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  } else {
    res.send('No City Selected');
  }
};
