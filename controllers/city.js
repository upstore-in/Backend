const City = require('../models/city');

exports.addCity = (req, res, next) => {
  const city = new City(req.body);
  city
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'City added successfully',
        addedCity: {
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

exports.getCities = (req, res, next) => {
  City.find()
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        cities: docs.map(doc => {
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
