const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const passport = require("passport");


const app = express();

//Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());

//Passport Config
require("./config/passport")(passport);


//DB Setup
mongoose
    .connect('mongodb://localhost:27017/trami')
    .then(() => console.log('connected to DB'))
    .catch(err => console.log(err));


//Routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

//Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


//Server Setup
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running'));