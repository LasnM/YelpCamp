const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');  
const User = require('./models/user');  


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const { Http2ServerRequest } = require('http2');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('Database connected');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);

const sessionConfig = {
  secret: 'testsecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires in a week, time in milliseconds
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true //security measure to prevent client side javascript from accessing the cookie
  }
}

app.use(session(sessionConfig));
app.use(flash());

//see passport documentation for more info
app.use(passport.initialize());
app.use(passport.session()); //needs to be after session
passport.use(new LocalStrategy(User.authenticate())); //using local strategy for authentication 

passport.serializeUser(User.serializeUser()); //how to store a user in a session
passport.deserializeUser(User.deserializeUser()); //how to get a user out of a session

//flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/campgrounds', campgrounds); //using campgrounds router for endpoint mapping
app.use('/campgrounds/:id/reviews', reviews); //using reviews router for endpoint mapping

app.get('/', (req, res) => {
  res.render('home');
});

app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const {statusCode = 500} = err;
  if(!err.message) err.message = 'Something went wrong!';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});