require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

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
const paymentRoutes = require('./routes/payment');

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

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use('./images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', cityRoutes);
app.use('/api', shopRoutes);
app.use('/api', userRoutes);
app.use('/api', paymentRoutes);
app.use('/api', orderRoutes);
app.use(express.static('public'));

app.listen(8000);
