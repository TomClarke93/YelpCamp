const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('YelpCamp App')
})

app.listen(3000, () => {
    console.log("Server Started");
    console.log("Listening on port 3000");
})