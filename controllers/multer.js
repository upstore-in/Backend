const multer = require('multer');

// MULTER STORAGE
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
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
exports.upload = multer({ storage: fileStorage, limits: { fileSize: 10000000 }, fileFilter: fileFilter });
