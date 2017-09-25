var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);

//----------------
// configURL.URL
// var configURL = require('../public/database/config.js');
var url = 'mongodb://Chabbe:Charbel1234@ds143754.mlab.com:43754/gamestore';

var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 60000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 60000 } } };
//mongoose.connect(url,options);
mongoose.createConnection(url, options);
var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:')); 
conn.once('open', function() {
  // Wait for the database connection to establish, then start the app.                         
console.log('db connection established');
});
//----------------

var index = require('./routes/index');
var userRoutes = require('./routes/user');

var app = express();  
console.log("app-express");


// var promise = mongoose.connect('mongodb://localhost:27017/shopping', { // ORIGINAL
//   useMongoClient: true,
//   /* other options */
// });

require('./config/passport');
require('./models/product-seeder');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
// app.use(session({ // ORIGINAL!!
//   secret: 'myCurrentSession', 
//   resave: false, 
//   saveUninitialized: false,
//   store: new MongoStore({ mongooseConnection: mongoose.connection }),
//   cookie: { maxAge: 10 * 60 * 1000 }
// }));
console.log("before-session");

app.use(session({
  secret: 'myCurrentSession', 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: conn }),
  cookie: { maxAge: 10 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use('/user', userRoutes);
app.use('/', index);
console.log("use-routers");
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);  
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');  
});

module.exports = app;
console.log("app-export");

