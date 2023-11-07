var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var multer = require('multer');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require("mongoose");
require('dotenv').config();
var fs = require('fs');
var product = require("./model/product.js");
var user = require("./model/user.js");

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log('Connected to the database');
});

mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
});

var dir = './uploads';
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './uploads');
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  }),

  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback( null, false);
    }
    callback(null, true);
  }
});

app.use(cors());
app.use(express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* jwt token if authorized */
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});

/* login api */
app.post("/login", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      user.find({ username: req.body.username }, (err, data) => {
        if (data.length > 0) {

          if (bcrypt.compareSync(data[0].password, req.body.password)) {
            checkUserAndGenerateToken(data[0], req, res);
          } else {

            res.status(400).json({
              errorMessage: 'Username or password is incorrect!',
              status: false
            });
          }

        } else {
          res.status(400).json({
            errorMessage: 'Username or password is incorrect!',
            status: false
          });
        }
      })
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

/* register api */
app.post("/register", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {

      user.find({ username: req.body.username }, (err, data) => {

        if (data.length == 0) {

          let User = new user({
            username: req.body.username,
            password: req.body.password
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
            } else {
              res.status(200).json({
                status: true,
                title: 'Registered Successfully.'
              });
            }
          });

        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.username} Already Exist!`,
            status: false
          });
        }

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.username, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true
      });
    }
  });
}

/* Api to get user profile */
app.get("/get-user-profile", (req, res) => {
  try {
    user.findById(req.user.id, { password: 0 }, (err, userData) => {
      if (err) {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      } else {
        res.status(200).json({
          status: true,
          title: 'User profile retrieved.',
          user: userData
        });
      }
    });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to update user profile */
app.post("/update-user-profile", (req, res) => {
  try {
    if (req.body) {
      user.findByIdAndUpdate(req.user.id, req.body, { new: true }, (err, updatedUser) => {
        if (err) {
          res.status(400).json({
            errorMessage: err.message || err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'User profile updated.',
            user: updatedUser
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});



app.listen(8000, () => {
  console.log("Server is Running On port 8000");
});
