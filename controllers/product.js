const fs = require('fs');
const path = require('path');

const { validationResult, check } = require('express-validator');
const Product = require('../models/product');

exports.createProduct = (req, res, next) => {
  console.log(req.body);
  const { name, shopName, description, price, stock, category, sold, city, shopId } = req.body;
  let photos = [];
  let i = 0;
  while (i < req.files.length) {
    photos.push(req.files[i].path);
    i++;
  }
  console.log(photos);
  const product = new Product({
    name,
    shopName,
    description,
    price,
    stock,
    category,
    sold,
    city,
    photos,
    shopId
  });
  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Created product successfully',
        createdProduct: {
          _id: result._id,
          name: result.name,
          price: result.price,
          imagePaths: photos,
          request: {
            type: 'GET',
            url: 'next url here'
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

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: 'Failed to delete the product'
      });
    }
    res.json({
      message: 'Deletion was a success',
      deletedProduct
    });
  });
};

// params middle-ware
exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate('Category')
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: 'Product not found'
        });
      }
      req.product = product;
      next();
    });
};

exports.getProduct = (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then(doc => {
      console.log('From database', doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: 'GET',
            url: 'next url here'
          }
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

exports.updateProduct = (req, res, next) => {
  const productId = req.params.productId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const { name, shopName, description, price, category, stock, sold, shopId } = req.body;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        const error = new Error('Could not find product.');
        error.statusCode = 404;
        throw error;
      }
      console.log(product.photos);
      const photos = product.photos;
      const _id = product._id;
      product.name = name;
      product.shopName = shopName;
      product.description = description;
      product.price = price;
      product.category = category;
      product.stock = stock;
      product.sold = sold;
      product.shopId = shopId;
      if (req.files.length > 0) {
        let newPhotos = [];
        let i = 0;
        while (i < req.files.length) {
          console.log(req.files[i].path);
          newPhotos.push(req.files[i].path);
          i++;
        }
        //clear image from server
        clearImages(product.photos);

        // udate photos
        product.photos = newPhotos;
      }

      product.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Product updated!', product: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      res.send('err ocurred');
      // next(err);
    });
};

const clearImages = filePathArray => {
  let i = 0;
  while (i < filePathArray.length) {
    filePathArray[i] = path.join(__dirname, '..', filePathArray[i]);
    console.log(filePathArray[i]);
    fs.unlink(filePathArray[i], err => console.log(err));
    i++;
  }
};

exports.getProducts = (req, res, next) => {
  if (req.params.cityId) {
    const city = req.params.cityId;
    const category = req.params.categoryId;

    // PAGINATION (30 PRODUCTS PER PAGE)
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;

    Product.countDocuments({ city, category }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        totalItems = result;
      }
    });

    Product.find({ city, category })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .select('title imageURL price')
      .exec()
      .then(docs => {
        const response = {
          totalCount: totalItems,
          products: docs.map(doc => {
            return {
              name: doc.name,
              price: doc.price,
              images: doc.photos,
              _id: doc._id,
              request: {
                type: 'GET',
                url: 'insert url before param here' + doc._id
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

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map(prod => {
    console.log(prod.stock);
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.quantity, sold: +prod.quantity } }
      }
    };
  });
  console.log(myOperations[0].updateOne.update);

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: 'Bulk operation failed'
      });
    }
    next();
  });
};
