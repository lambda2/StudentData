module.exports = function(app) {
  // Module dependencies.
  var mongoose = require('mongoose'),
      Eleve = mongoose.models.presence_log,
      api = {};

  // ALL
  api.all = function (req, res) {
    console.log(Eleve.find());
    Eleve.find({}, function(err, eleves) {
      if (err) {
        res.json(500, err);
      } else {
        res.json({eleves: eleves});
      }
    });
  };

  app.get('/api/all', api.all);
};
