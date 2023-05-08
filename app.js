var createError = require('http-errors');
var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var ContentRouter = require('./routes/contentRoute');
var userRouter = require('./routes/userRoute');
var bookmarkRouter = require('./routes/bookmarkRoute');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require('./models/index');

app.use('/', indexRouter);
app.use('/content', ContentRouter);
app.use('/user', userRouter);
app.use('/bookmark', bookmarkRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
