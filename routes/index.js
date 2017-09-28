//GET EXPRESS ROUTING
var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');// ORIGINAL
//  var Product = mongoose.model('Product');

//GET MODELS
var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
    
  Product.find(function(err, docs) {
    
    if (err) {
      console.log(err.message);
    }

    if (docs != null) {
      var productChunks = [];
      var chunkSize = 3;
      for(var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
      }
      res.render('shop/index', { title: 'ShopCart', products: productChunks, successMsg: successMsg, noMessages: !successMsg });
    }
    else {
      console.log(docs);
    }

  });
});


// GET Add to cart
router.get('/add-to-cart/:id', function(req,res,next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
        if (err) {
          return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});

// GET Reduce shopping cart items
router.get('/reduce/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// GET Remove shopping cart items
router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// GET Shopping cart
router.get('/shopping-cart', function(req, res, next) {

    if (!req.session.cart) {
      return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

//GET Checkout with method to check if user is logged in.
router.get('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});  
});

//POST Checkout with method to check if user is logged in.
router.post('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
    //Compare tokens
    var stripe = require('stripe')(
      "sk_test_6LxtxcZaMJgnVOVpVloCBYTO"
    );
    //Create charge
    stripe.charges.create({
      amount: cart.totalPrice * 100,
      currency: "usd",
      source: req.body.stripeToken,
      description: "Test Charge"
    }, function(err, charge) {

      if (err) {
        req.flash('error', err.message);
        return res.redirect('/checkout');
      }
      //Create order
      var order = new Order({
        user: req.user,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        paymentId: charge.id
      });
      //Save to db
      order.save(function(err, result) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('/checkout');          
        }
        req.flash('success', 'Successfully bought product!');
        req.session.cart = null;
        res.redirect('/');
      });
    });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  //Get the prevoius url and store it in a session variable you create
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}