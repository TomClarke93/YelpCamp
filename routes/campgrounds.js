const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressErorr = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas')

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
        if(error) {
            const msg = error.details.map(el => el.message).join(',')
            throw new ExpressErorr(msg, 400);
    } else {
        next();
    }
}

router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressErorr('Invalid Campground', 400);
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}))

router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', {campground: foundCampground});
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground: foundCampground});
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${foundCampground._id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;