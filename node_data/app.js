'use strict';

// Module dependencies.
var express = require('express'),
    exphbs  = require('express3-handlebars'),
    path = require('path'),
    fs = require('fs');

var app = module.exports = exports.app = express();

app.locals.siteName = "Node_data";

// Connect to database
var db = require('./config/db');

// Classes
var classesPath = path.join(__dirname, 'classes');
fs.readdirSync(classesPath).forEach(function (file) {
  require(classesPath + '/' + file);
});



// Bootstrap models
var modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

app.configure('development', function() {
  app.use(express.logger('dev'));
  app.use(express.errorHandler({
    dumpExceptions: true , showStack: true
  }));
  app.set('view options', { pretty: true });
});

app.configure('test', function() {
  app.use(express.logger('test'));
  app.set('view options', { pretty: true });
});

app.configure('production', function() {
  app.use(express.logger());
  app.use(express.errorHandler());
});

app.configure(function(){
  app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');
	app.use(express.methodOverride());
  app.use(express.urlencoded());
  app.use(express.json());
  // Router needs to be last
	app.use(app.router);
});

// Bootstrap routes/api
var routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(function(file) {
  require(routesPath + '/' + file)(app);
});

// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});
