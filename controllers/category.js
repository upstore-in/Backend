const Category = require('../models/category');

exports.getCategories = (req, res, next) => {
  Category.find()
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        categories: docs.map(doc => {
          return {
            name: doc.name,
            _id: doc._id
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.createCategory = (req, res, next) => {
  const category = new Category(req.body);
  category
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Created category successfully',
        createdCategory: {
          name: result.name,
          _id: result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
