const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const passport = require("passport");



//Route Constants
const users ={};
const profile ={};
const posts ={};
//API:
users.api = require('./routes/api/users');
profile.api = require('./routes/api/profile');
posts.api = require('./routes/api/posts');
//View:
users.view = require('./routes/users');
profile.view = require('./routes/profile');
posts.view = require('./routes/posts');



const app = express();

//Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());

//Passport Config
require("./config/passport")(passport);

//DB Setup
mongoose
    .connect('mongodb://localhost:27017/trami')
    .then(() => console.log('connected to DB'))
    .catch(err => console.log(err));




// set the view engine to ejs
app.set('view engine', 'ejs');

app.get("/", function(req, res) {
    res.render("pages/test" ,{text:"testtext"});
});


//ROUTES
//Use API routes
app.use('/api/users', users.api);
app.use('/api/profile', profile.api);
app.use('/api/posts', posts.api);

//Use View routes
app.use('/users', users.view);
app.use('/profile', profile.view);
app.use('/posts', posts.view);


//Server Setup
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running'));