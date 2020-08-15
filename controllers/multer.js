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

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './csvFiles');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const csvFileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

exports.uploadCsv = multer({ storage, fileFilter: csvFileFilter });
exports.upload = multer({ storage: fileStorage, limits: { fileSize: 10000000 }, fileFilter: fileFilter });
