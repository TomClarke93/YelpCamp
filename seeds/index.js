const cities = require("./cities");
const seedHelpers = require("./seedHelpers");
const Campground = require('../models/campground');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const generateTitles = (first, second) => {
    const a = first[Math.floor(Math.random() * first.length)];
    const b = second[Math.floor(Math.random() * second.length)];
    return `${a} ${b}`;
}

const getCity = () => {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    return `${randomCity.city}, ${randomCity.state}`;
}

const getPrice= () => {
    return Math.floor(Math.random() * 20) + 10
}

const seedDatabase = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 100; i++){
        const newCampground = new Campground({
            title: generateTitles(seedHelpers.descriptors, seedHelpers.places),
            location: getCity(),
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto consequuntur modi at dolorum, quos aut similique quia nihil ratione ad est numquam repellendus? Iusto nesciunt nulla, labore iste fuga ab.',
            price: getPrice()
        });
        await newCampground.save();
    }
}

seedDatabase().then(() => {
    mongoose.connection.close();
});
