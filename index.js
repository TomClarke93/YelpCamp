const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const ExpressErorr = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas')

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
        if(error) {
            const msg = error.details.map(el => el.message).join(',')
            throw new ExpressErorr(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
        if (error) {
            const msg = error.details.map(el => el.message).join(',')
            throw new ExpressErorr(msg, 400)
        } else {
            next();
        }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressErorr('Invalid Campground', 400);
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', {campground: foundCampground});
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground: foundCampground});
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${foundCampground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const newReview = new Review(req.body.review);
    await newReview.save();
    campground.reviews.push(newReview)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:campgroundId/reviews/:reviewId', catchAsync(async (req, res) => {
    const {campgroundId, reviewId} = req.params;
    Campground.findByIdAndUpdate(campgroundId, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${campgroundId}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressErorr('Page Not Found', 404))
})
app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', {err})
})

app.listen(3000, () => {
    console.log("Server Started");
    console.log("Listening on port 3000");
})




