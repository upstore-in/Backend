const User = require('../models/user');
const { check, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

exports.getPhoneNumber = (req, res, next) => {
  var phoneNumber = req.body.phoneNumber;
  console.log(phoneNumber);
  res.send({
    id: '0e06880aecd944b49e75911558bc1479',
    message: 'Some Random Message'
  });
  /******* GENERATE VERIFY OBJECT IN PRODUCTION ******/
  // messagebird.verify.create(
  //   number,
  //   {
  //     originator: 'Code',
  //     template: 'Your verification code is %token.',
  //     timeout: 180
  //   },
  //   function (err, response) {
  //     if (err) {
  //       console.log(err);
  //       res.send({
  //         error: err.errors[0].description
  //       });
  //     } else {
  //       console.log(response);
  //       res.send({
  //         id: response.id,
  //         thankyou: 'thanks'
  //       });
  //     }
  //   }
  // );
};

exports.verifyOTP = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }

  let messageId = req.body.id;
  let token = 5662;
  let phoneNumber = req.body.phoneNumber;
  if (token == req.body.token && messageId == '0e06880aecd944b49e75911558bc1479') {
    User.findOne({ phoneNumber }, (err, user) => {
      if (err) {
        // Set proper status code later
        return res.status(422).json('Error Ocurrer in finding user');
      }

      if (!user) {
        let phoneNumber = req.body.phoneNumber;
        const user = new User({ phoneNumber });

        user.save((err, user) => {
          if (err) {
            return res.status(400).json({
              err: 'NOT able to save user in DB'
            });
          }
        });

        // create token
        const token = jwt.sign({ _id: user._id }, process.env.SECRET);
        //put token in cookie
        res.cookie('token', token, { expire: new Date() + 9999 });

        // send response to front end
        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, phoneNumber, name, email, role } });
      }

      if (user) {
        // create token
        const token = jwt.sign({ _id: user._id }, process.env.SECRET);
        //put token in cookie
        res.cookie('token', token, { expire: new Date() + 9999 });

        // send response to front end
        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, name, email, role } });
      }
    });
  } else {
    return res.json('Incorrect Id/Token ');
  }

  /********  VERIFY OTP IN PRODUCTION ******/
  // var id = req.body.id;
  // var token = req.body.token;
  // messagebird.verify.verify(id, token, function (err, response) {
  //   if (err) {
  //     console.log(err);
  //     res.send({
  //       error: err.errors[0].description,
  //       id: id
  //     });
  //   } else {
  //     console.log(response);
  //     res.send('verified');
  //   }
  // });
};

exports.signupEmail = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }

  const user = new User(req.body);
  console.log(user);
  user.save((err, user) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        err: 'NOT able to save user in DB try choosing a different email address'
      });
    }
    res.json({
      message: 'User Signed Up Successfully',
      user: {
        name: user.name,
        email: user.email,
        id: user._id
      }
    });
  });
};

exports.signinEmail = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'USER email does not exists'
      });
    }

    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: 'Email and password do not match'
      });
    }

    // create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token in cookie
    res.cookie('token', token, { expire: new Date() + 9999 });

    // send response to front end
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie('token');
  res.json({
    message: 'User signout successfully'
  });
};

//protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: 'auth'
});

// custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: 'ACCESS DENIED'
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: 'You are not ADMIN, Access denied'
    });
  }
  next();
};

exports.isDeveloper = (req, res, next) => {
  if (req.profile.role === 0 || req.profile.role === 1) {
    return res.status(403).json({
      error: 'Access denied'
    });
  }
  next();
};
