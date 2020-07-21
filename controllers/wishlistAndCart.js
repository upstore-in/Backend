const Cart = require('../models/wishlistAndCart');

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
        console.log(cart.products.findIndex(doc => doc.product == product));
        if (itemIndex > -1) {
          console.log(itemIndex);
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
          return res.status(201).send(cart);
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
          return res.status(201).send(newCart);
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
  const userId = req.params.user_id;
  let newProducts = [];
  const wishlist = req.query.wishlist || 0;
  try {
    Cart.findOne({ userId })
      .populate('products.product', '-description -sold -createdAt -updatedAt -__v')
      .exec((err, cart) => {
        if (err) {
          return res.status(400).json({
            error: 'NO cart found in DB'
          });
        }
        cart.products.forEach(product => {
          console.log(product.wishlist);
          product.wishlist == wishlist ? newProducts.push(product) : '';
        });
        return res.status(201).send(newProducts);
      });
  } catch {
    err => {
      console.log(err);
      return res.status(500).send('Something went wrong');
    };
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.params.user_id;
  const product = req.params.productId;
  let cart = await Cart.findOne({ userId });
  try {
    if (cart) {
      let itemIndex = await cart.products.findIndex(doc => doc.product == product);
      console.log(itemIndex);
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
