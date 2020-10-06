const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const { validationResult, check } = require('express-validator');
const Product = require('../models/product');

exports.imageUpload = (req, res, next) => {
  console.log(req.files);
  const filePathArray = [];
  req.files.forEach(file => {
    filePathArray.push(file.path);
  });
  res.send(filePathArray);
};

exports.addProductWithVariant = (req, res, next) => {
  const variants = [];

  req.body.forEach(element => {
    const photos = [];

    element.photos.split(',').forEach(path => {
      photos.push(path.trim());
    });
    element.shopName = element.shopName;
    element.city = element.city;
    element.shopId = element.shopId;
    element._id = mongoose.Types.ObjectId();
    console.log(element._id);
    element.photos = photos;

    variants.push({ product: element._id, size: element.size, color: element.color });
    delete element.size;
    delete element.color;
  });
  req.body.forEach(element => (element.variants = variants));

  Product.insertMany(req.body, (err, docs) => {
    if (err) console.log(err);
    console.log(docs);
  });

  res.send(
    JSON.stringify({
      message: 'Uploaded products successfully'
    })
  );
  console.log(variants);
};

exports.csvToJson = async (req, res, next) => {
  const csvFilePath = `${req.file.destination}/${req.file.filename}`;

  await csv({
    noheader: false,
    headers: ['inShopId', 'name', 'markedPrice', 'price', 'description', 'stock', 'category', 'photos', 'searchIndex']
  })
    .fromFile(csvFilePath)
    .then(jsonArray => {
      for (element of jsonArray) {
        const photos = [];

        element.photos.split(',').forEach(path => {
          photos.push(path.trim());
        });
        element.shopName = req.body.shopName;
        element.city = '5eff8e76d75ecb3735b243b1';
        element.shopId = req.body.shopId;
        element._id = mongoose.Types.ObjectId();
        console.log(element._id);
        element.photos = photos;
      }

      for (element of jsonArray) {
        if (element.inShopId.split('$').length > 1) {
          const products = jsonArray.filter(doc => doc.inShopId.split('$')[0] === element.inShopId.split('$')[0]);

          const variants = [];
          for (product of products) {
            const variant = {};

            variant.product = product._id;
            variant.size = product.inShopId.split('$')[1];
            variant.color = product.inShopId.split('$')[2];

            variants.push(variant);
          }
          products.forEach(product => {
            product.inShopId = product.inShopId.split('$')[0];
            product.variants = variants;
          });
        }
      }

      Product.insertMany(jsonArray, (err, docs) => {
        if (err) console.log(err);
        console.log(docs);
      });

      res.send(
        JSON.stringify({
          message: 'Uploaded products successfully',
          products: jsonArray
        })
      );
    });
  fs.unlink(path.join(__dirname, '..', req.file.destination, req.file.filename), err => {
    if (err) console.log(err);
    else console.log('success');
  });
};

exports.createProduct = (req, res, next) => {
  console.log(req.body);
  const { name, shopName, description, price, stock, category, sold, city, shopId, markedPrice, size, searchIndex } = req.body;
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
    markedPrice,
    searchIndex
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
    .populate('shopId', 'open')
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
  console.log(req.body);
  Product.findById(productId).then(product => {
    if (!product) {
      const error = new Error('Could not find product.');
      error.statusCode = 404;
      throw error;
    }

    if (req.files.length) {
      let newPhotos = [];
      let i = 0;
      while (i < req.files.length) {
        console.log(req.files[i].path);
        newPhotos.push(req.files[i].path);
        i++;
      }
      //   //clear image from server
      clearImages(product.photos);

      // udate photos
      req.body.photos = newPhotos;
    }

    Product.updateOne({ _id: productId }, { $set: req.body }, { new: true, useFindAndModify: false })
      .then(result => res.send(result))
      .catch(err => console.log(err));
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

    // PAGINATION (10 PRODUCTS PER PAGE)
    const currentPage = req.query.page || 1;
    const perPage = 30;
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
      .sort({ _id: -1 })
      .limit(perPage)
      .populate('shopId', 'open')
      .select('name price photos markedPrice shopName  variants stock')
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
              stock: doc.stock,
              open: doc.shopId.open,
              markedPrice: doc.markedPrice,
              _id: doc._id,
              variants: doc.variants,

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
        filter: { _id: prod.product },
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
  const perPage = 30;
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
    .populate('shopId', 'open')
    .sort({ _id: -1 })
    .limit(perPage)
    .select('name price photos markedPrice  variants stock description')
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
            description: doc.description,
            _id: doc._id,
            stock: doc.stock,
            open: doc.shopId.open,

            variants: doc.variants,
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
  const currentPage = req.query.page || 1;
  const perPage = 30;
  let totalCount;

  if (req.query.search) {
    console.log(req.query.search);
    // let str = '';

    // req.query.search.split(' ').forEach(word => {
    //   str += word + '|';
    // });

    const query = {
      $or: [{ name: { $regex: req.query.search, $options: 'i' } }, { searchIndex: { $regex: req.query.search, $options: 'i' } }],
      city: req.params.cityId
    };

    await Product.countDocuments(query, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        totalCount = result;
      }
    });

    Product.find(query)
      .populate('shopId', 'open')
      .select('name  price photos markedPrice _id open variants shopName stock shopId')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .then(docs => {
        return res.status(200).send({
          totalCount,

          products: docs.map(doc => {
            console.log(doc);
            return {
              name: doc.name,
              price: doc.price,
              photos: doc.photos,
              markedPrice: doc.markedPrice,
              shopName: doc.shopName,
              stock: doc.stock,
              size: doc.size,
              _id: doc._id,
              open: doc.shopId.open,
              variants: doc.variants,
              request: {
                type: 'GET',
                url: 'http://159.65.159.82:8000/api/product/' + doc._id
              }
            };
          })
        });
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

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
