const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");

//Load custom functions
const postsAndComments = require("../functions/postsAndComments");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");

router.get("/test", (req, res) => res.json({msg: "Posts Works"}));

////get request for post stream
////get /stream/:page; (private)
router.get("/stream/:page", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.getStream(req, res)
});


//post request for form for creating a new post
//post /post/create; (private)
router.post("/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.createPost(req, res)
})

//post request for deleting a post
//post /post/post/delete; (private)
router.post('/post/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.deletePost(req, res)
});

//post request for form for creating a new comment for post
//post /post/comment/create; (private)
router.post("/comment/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.createComment(req, res)
})

//post request for form for creating a new subComment for comment
//post /post/subcomment/create; (private)
router.post("/subcomment/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.createSubComment(req, res)
});

//post request for deleting a post-comment
//post /post/comment/delete; (private)
router.post('/comment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.deleteComment(req, res)
});


//post request for deleting a subcomment
//post /post/subcomment/delete; (private)
router.post('/subcomment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.deleteSubComment(req, res)
});

//get posts by in in params(Private)
//Get /post/id/:id
router.get('/id/:id', authenticate.checkLogIn, authenticate.reqSessionProfile,(req, res) => {
    postsAndComments.getPost(req, res)
});

//report content (posts/comments/subcomments)(Private)
//POST /post/report
router.post('/reportcontent', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.reportContent(req, res)
});





module.exports = router;