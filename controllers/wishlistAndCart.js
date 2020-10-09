const Cart = require('../models/wishlistAndCart');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

exports.addToCart = async (req, res) => {
  const { products, userId } = req.body;
  let cart = await Cart.findOne({ userId });

  try {
    if (cart) {
      products.forEach(prod => {
        const { wishlist, product } = prod;
        let quantity = prod.quantity;
        // Cart already exists for user and he/she wants to add product to Cart or wishlist
        let itemIndex = cart.products.findIndex(doc => doc.product == product);

        if (itemIndex > -1) {
          //Product exists in the cart, update the quantity and/or wishlist status
          let productItem = cart.products[itemIndex];
          productItem.quantity = wishlist ? 1 : quantity;
          productItem.wishlist = wishlist;
          cart.products[itemIndex] = productItem;
        } else {
          //product does not exists in cart, add new item
          if (wishlist) quantity = 1;
          cart.products.push({ product, quantity, wishlist });
        }
      });
      cart
        .save()
        .then(cart => {
          Cart.findOne({ userId })
            .populate({ path: 'products.product', select: '-description -sold -createdAt -updatedAt -__v', populate: [{ path: 'shopId', select: 'open' }] })
            .exec(async (err, cart) => {
              if (err) {
                return res.status(400).json({
                  error: 'NO cart found in DB'
                });
              }
              const newProducts = cart.products.map(document => {
                return {
                  wishlist: document.wishlist,
                  _id: document._id,
                  quantity: document.quantity,
                  product: {
                    size: document.product.size,
                    photos: document.product.photos,
                    _id: document.product._id,
                    name: document.product.name,
                    markedPrice: document.product.markedPrice,
                    price: document.product.price,
                    stock: document.product.stock,
                    category: document.product.category,
                    shopName: document.product.shopName,
                    city: document.product.city,
                    shopId: document.product.shopId._id,
                    variants: document.product.variants,
                    open: document.product.shopId.open
                  }
                };
              });

              return res.status(201).send({
                _id: cart._id,
                userId: cart.userId,
                products: newProducts
              });
            });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      //no cart  for user, create new cart
      await products.forEach(product => {
        if (product.wishlist == 1) product.quantity = 1;
      });
      Cart.create({
        userId,
        products
      })
        .then(newCart => {
          Cart.findOne({ userId })
            .populate('products.product', '-description -sold -createdAt -updatedAt -__v')
            .exec((err, cart) => {
              if (err) {
                return res.status(400).json({
                  error: 'NO cart found in DB'
                });
              }

              const newProducts = cart.products.map(document => {
                return {
                  wishlist: document.wishlist,
                  _id: document._id,
                  quantity: document.quantity,
                  product: {
                    size: document.product.size,
                    photos: document.product.photos,
                    _id: document.product._id,
                    name: document.product.name,
                    markedPrice: document.product.markedPrice,
                    price: document.product.price,
                    stock: document.product.stock,
                    category: document.product.category,
                    shopName: document.product.shopName,
                    city: document.product.city,
                    shopId: document.product.shopId._id,
                    variants: document.product.variants,
                    open: document.product.shopId.open
                  }
                };
              });

              return res.status(201).send({
                _id: cart._id,
                userId: cart.userId,
                products: newProducts
              });
            });
        })
        .catch(err => {
          console.log(err);
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send('Something went wrong');
  }
};

exports.getCart = async (req, res) => {
  const userId = req.params.userId;
  let newProducts = [];
  const wishlist = req.query.wishlist || 0;
  try {
    Cart.findOne({ userId })
      .populate({ path: 'products.product', select: '-description -sold -createdAt -updatedAt -__v', populate: [{ path: 'shopId', select: 'open' }] })
      .exec((err, cart) => {
        if (err) {
          return res.status(400).json({
            error: 'NO cart found in DB'
          });
        } else if (!cart) {
          return res.status(200).json([]);
        } else {
          cart.products.forEach((document, index, cart) => {
            document.wishlist == wishlist
              ? newProducts.push({
                  wishlist: document.wishlist,
                  _id: document._id,
                  quantity: document.quantity,
                  product: {
                    size: document.product.size,
                    photos: document.product.photos,
                    _id: document.product._id,
                    name: document.product.name,
                    markedPrice: document.product.markedPrice,
                    price: document.product.price,
                    stock: document.product.stock,
                    category: document.product.category,
                    shopName: document.product.shopName,
                    city: document.product.city,
                    shopId: document.product.shopId._id,
                    variants: document.product.variants,
                    open: document.product.shopId.open
                  }
                })
              : '';
          });

          return res.status(201).send(newProducts);
        }
      });
  } catch {
    err => {
      console.log(err);
      return res.status(500).send('Something went wrong');
    };
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.params.userId;
  const product = req.params.productId;
  let cart = await Cart.findOne({ userId });
  try {
    if (cart) {
      let itemIndex = await cart.products.findIndex(doc => doc.product == product);

      if (itemIndex !== -1) cart.products.splice(itemIndex, 1);

      cart
        .save()
        .then(cart => {
          return res.status(201).send(cart);
        })
        .catch(err => {
          console.log(err);
        });
    } else return res.status(404).send('No such cart/user exists');
  } catch {
    err => {
      console.log(err);
      return res.status(404).send('Something went wrong');
    };
  }
};

exports.clearCart = async (req, res, next) => {
  const userId = req.params.userId;
  let cart = await Cart.findOne({ userId });

  try {
    if (cart) {
      cart.products = cart.products.filter(product => product.wishlist === 1);
      cart
        .save()
        .then(cart => {
          return res.status(201).send(cart);
        })
        .catch(err => {
          console.log(err);
        });
    } else return res.status(404).send('No such cart/user exists');
  } catch {
    err => {
      console.log(err);
      return res.status(404).send('Something went wrong');
    };
  }
};

exports.checkAndDelete = async (req, res, next) => {
  // let carts = await Cart.find({}).select('products _id').populate('products.product');
  // await carts.forEach(cart => {
  //   cart.products.forEach((doc, index, products) => {
  //     if (products.length) {
  //       if (doc.product === null) {
  //         console.log('null');
  //         products.splice(index, 1);
  //       } else {
  //         console.log('product');
  //       }
  //     }
  //   });
  // });
  // Cart.deleteMany({}).then(res => {
  //   Cart.insertMany(carts);
  //   console.log(carts);
  // });
  // res.json(carts);
};
