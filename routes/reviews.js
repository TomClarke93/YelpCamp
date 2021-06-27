const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressErorr = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {validateReview, isReviewAuthor, isLoggedIn} = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();
    campground.reviews.push(newReview)
    await campground.save();
    req.flash('success', 'Thanks for adding a review')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;