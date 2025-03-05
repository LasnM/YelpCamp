const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

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
app.engine('ejs', ejsMate);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds }); 
}));

app.get('/campgrounds/new', (req, res) => { //order is important here when routing
  res.render('campgrounds/new');
});

app.post('/campgrounds', catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id); //error handling missing
  res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  console.log("Received ID for deletion:", req.params.id);
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

app.use((err, req, res, next) => {
  res.send('Something went wrong'); //error handling
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});