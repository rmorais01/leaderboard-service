var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
//var redis = require('redis');
var redis = require('ioredis');


var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//REDIS connection
if(! process.env.REDIS_SENTINEL_SERVICE_HOST) { 
    console.log("ERROR: Unable to find the REDIS SERVER"); 
}

//var redisClient = redis.createClient({host:  process.env.LEADERBOARD_REDIS_SERVICE_HOST});

var redisClient = new redis({
  sentinels: [{ host: process.env.REDIS_SENTINEL_SERVICE_HOST, port: 26379 }], name: 'mymaster'
});


console.log("ENV " + process.env.REDIS_SENTINEL_SERVICE_HOST);

redisClient.on('error', function (err) {
    console.log('error event - ' + redisClient.host + ':' + redisClient.port + ' - ' + err);
});

//Make our redis client accessible to our router
app.use(function(req,res,next){
    req.redisClient = redisClient;
    next();
});

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("ERROR" + err);
});

module.exports = app;
