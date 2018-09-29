require('dotenv').config({ path: 'process.env' });
const passport = require('passport');
require('./authentication/passport');

const debug = require('debug')('example:server');

const express = require('express');
const session = require('express-session');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');
const security = require('./authentication/security');

const helpers = require('./lib/handlebarsHelpers')
const index = require('./routes/index');

const app = express();


debug( "path:%s", __dirname);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs',
    exphbs(
        {
            layoutsDir   : path.join(__dirname, '/views/layouts/'),
            partialsDir: path.join(__dirname, '/views/partials/'),
            defaultLayout: path.join(__dirname, '/views/layouts/main'),
            helpers: helpers,
            extname: '.hbs'
        }));

app.set('view engine', '.hbs');

const cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
const cookie_name = process.env.COOKIE_NAME || 'my_cookie';
const sess = {
    secret: cookie_key,
    name: cookie_name,
    proxy: true,
    resave: true,
    saveUninitialized: true
}

// Setup passport
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Setup the passport routes
app.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        debug("Already authenticated")
        res.redirect('/');
    } else {
        debug("Rendering login");
        res.render('login');
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
}));


// Setup the routes
app.use('/', security.isAuthenticated,  function (req, res) {
    let url = req.session.redirect_to;
    if (url != undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    }
    else {
        res.render('index');
    }
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
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
