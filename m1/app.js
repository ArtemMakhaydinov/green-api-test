var createError = require('http-errors');
var express = require('express');
const cookieParser = require('cookie-parser');
var logger = require('morgan');
const routes = require('./routes');

// ========== GENERAL SETUP ==========

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ========== AMQP CONNECTION ==========

require('./config/amqplib')

// ========== ROUTES ==========

app.use(routes);

// ========== ERRORS ==========

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;
    // render the error page
    res.status(err.status || 500);
    res.json(JSON.stringify(err));
});

module.exports = app;
