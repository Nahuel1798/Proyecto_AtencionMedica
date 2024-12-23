var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieSession = require('cookie-session');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var medicoRoutes = require('./routes/medico');
var pacienteRoutes = require('./routes/paciente');
var consultaRouter = require('./routes/consulta');
var navRouter = require('./routes/nav');
var templateRouter = require('./routes/template');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de cookie-session
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'clave_secreta'],
    maxAge: 24 * 60 * 60 * 1000, // 1 día de duración de la cookie
  })
);

// Middleware para hacer accesible `medicoId` en las vistas
app.use((req, res, next) => {
  res.locals.medicoId = req.session.medicoId;
  next();
});

// Rutas
app.use('/', indexRouter);
app.use('/', medicoRoutes);
app.use('/', pacienteRoutes);
app.use('/', navRouter);
app.use('/', templateRouter);
app.use('/', consultaRouter);
app.use('/users', usersRouter);

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
  res.render('error');
});

module.exports = app;
