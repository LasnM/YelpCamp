const express = require('express');
const router = express.Router({ mergeParams: true }); //mergeParams is set to true to allow access to the id parameter from the app.use() method in app.js
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', validateReview, isLoggedIn, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id; //adding the author to the review
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Successfully posted a review!');
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //deleting the reference to the review
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted a review!');
  res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;