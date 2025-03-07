const express = require('express');
const router = express.Router({ mergeParams: true }); //mergeParams is set to true to allow access to the id parameter from the app.use() method in app.js
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');  

router.post('/', validateReview, isLoggedIn, catchAsync(reviews.postReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;