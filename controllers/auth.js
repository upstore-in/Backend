const User = require('../models/user');
const { check, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
const https = require('https');

exports.getPhoneNumber = (req, res, next) => {
  let phoneNumber = req.body.phoneNumber;

  /************************************** */
  https
    .get(`https://2factor.in/API/V1/${process.env.OTPAPIKEY}/SMS/+91${phoneNumber}/AUTOGEN`, resp => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        console.log(data);
        console.log(JSON.parse(data));
        const session_id = JSON.parse(data).Details;
        return res.status(200).send({
          session_id,
          phoneNumber
        });
      });
    })
    .on('error', err => {
      console.log('Error: ' + err.message);
    });
  /******************************* */
};

exports.verifyOTP = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }
  const session_id = req.body.session_id;
  const OTP = req.body.OTP;

  const phoneNumber = req.body.phoneNumber;

  /************************************** */
  https
    .get(`https://2factor.in/API/V1/${process.env.OTPAPIKEY}/SMS/VERIFY/${session_id}/${OTP}`, resp => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        console.log(JSON.parse(data));

        const { Details, Status } = JSON.parse(data);

        if (Details === 'OTP Matched') {
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
              const { _id, name, email, role, phoneNumber, shopIds } = user;
              return res.json({ token, user: { _id, name, email, role, phoneNumber, shopIds } });
            }
          });
        } else if (Details === 'OTP Mismatch') {
          return res.json({ error: 'Incorrect OTP entered' });
        } else {
          res.send(`Error Occurred. Details:${Details}`);
        }
      });
    })
    .on('error', err => {
      console.log('Error: ' + err.message);
    });
  /******************************* */
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
  console.log('signed in');
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
    const { _id, name, email, role, phoneNumber } = user;
    return res.json({ token, user: { _id, name, email, role, phoneNumber } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie('token');
  console.log('signed out');
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
