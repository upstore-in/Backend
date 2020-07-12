require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
let messagebird = require('messagebird')('Md7LLaFTxDeyKS7BNOcP4RQTy');

// app
const app = express();

// IMPORTING ROUTEs
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const cityRoutes = require('./routes/city');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const shopRoutes = require('./routes/shop');

// DB Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB CONNECTED');
  });

// MULTER STORAGE
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

// MULTER FILTERING MIME TYPE
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg+xml') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
const upload = multer({ storage: fileStorage, limits: { fileSize: 10000000 }, fileFilter: fileFilter });
app.use('./images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api', authRoutes);
app.use('/api', upload.array('images', 8), productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', cityRoutes);
app.use('/api', shopRoutes);
app.use('/api', userRoutes);
app.use('/api', orderRoutes);

app.listen(8000);
