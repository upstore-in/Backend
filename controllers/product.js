const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const { validationResult, check } = require('express-validator');
const Product = require('../models/product');

exports.createProduct = (req, res, next) => {
  console.log(req.body);
  const { name, shopName, description, price, stock, category, sold, city, shopId, markedPrice, size } = req.body;
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
    shopId,
    size,
    markedPrice
  });
  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Created product successfully',
        createdProduct: {
          result,
          request: {
            type: 'GET',
            url: 'http://159.65.159.82:8000/api/product/' + result._id
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
  const { name, shopName, description, price, category, stock, sold, shopId, markedPrice, size } = req.body;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        const error = new Error('Could not find product.');
        error.statusCode = 404;
        throw error;
      }
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
      product.markedPrice = markedPrice;
      console.log(product.markedPrice);
      product.size = size;
      console.log(product.size);
      console.log(product);
      console.log(req.files);
      if (req.files) {
        let newPhotos = [];
        let i = 0;
        while (i < req.files.length) {
          console.log(req.files[i].path);
          newPhotos.push(req.files[i].path);
          i++;
        }
        //clear image from server
        clearImages(photos);

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

exports.getProducts = async (req, res, next) => {
  if (req.params.cityId) {
    const city = req.params.cityId;
    const category = req.params.categoryId;

    // PAGINATION (30 PRODUCTS PER PAGE)
    const currentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;

    await Product.countDocuments({ city, category }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        totalItems = result;
      }
    });

    Product.find({ city, category })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .select('name price photos size markedPrice shopName description')
      .exec()
      .then(docs => {
        const response = {
          totalCount: totalItems,
          products: docs.map(doc => {
            return {
              name: doc.name,
              price: doc.price,
              shopName: doc.shopName,
              photos: doc.photos,
              size: doc.size,
              description: doc.description,
              markedPrice: doc.markedPrice,
              _id: doc._id,
              request: {
                type: 'GET',
                url: 'http://159.65.159.82:8000/api/product/' + doc._id
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
    console.log(prod.quantity);
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.quantity, sold: +prod.quantity } }
      }
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: 'Bulk operation failed'
      });
    }
    next();
  });
};

exports.productsOfShop = async (req, res, next) => {
  const shopId = req.params.shopId;

  // PAGINATION (30 PRODUCTS PER PAGE)
  const currentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems;

  await Product.countDocuments({ shopId }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      totalItems = result;
    }
  });

  Product.find({ shopId })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .select('name price photos markedPrice size')
    .exec()
    .then(docs => {
      const response = {
        totalCount: totalItems,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            photos: doc.photos,
            markedPrice: doc.markedPrice,
            size: doc.size,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://159.65.159.82:8000/api/product/' + doc._id
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
};

exports.listBySearch = async (req, res) => {
  const query = {};
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalCount;

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
    query.city = req.params.cityId;

    await Product.countDocuments(query, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        totalCount = result;
      }
    });

    Product.find(query)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .then(products => {
        return res.status(200).send({ totalCount, products });
      });
  } else {
    return res.status(400).send('Search query cannot be empty');
  }
};

// exports.listBySearch = async (req, res) => {
//   const query = {};
//   const currentPage = req.query.page || 1;
//   const perPage = 10;
//   let totalCount;
//   console.log(req.query.search);
//   // if (req.query.search) {
//   let order = req.query.order ? req.query.order : 1;
//   let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
//   // if (req.query.search !== undefined) {
//   //   query.name = { $regex: req.query.search, $options: 'i' };
//   // }
//   if (req.query.category) query.category = req.query.category;

//   query.city = req.params.cityId;
//   console.log(query.city);
//   // gte -  greater than price [0-10]
//   // lte - less than
//   if (req.query.price)
//     query.price = {
//       $gte: req.query.price[0],
//       $lte: req.query.price[1]
//     };

//   console.log(query);
//   await Product.countDocuments(query, function (err, result) {
//     if (err) {
//       console.log(err);
//     } else {
//       totalCount = result;
//     }
//   });

//   Product.find(query)
//     // .sort([[sortBy, order]])
//     .skip((currentPage - 1) * perPage)
//     .limit(perPage)
//     .then(products => {
//       return res.status(200).send({ totalCount, products });
//     });
//   //}
// };
