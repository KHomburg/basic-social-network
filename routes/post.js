const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");

router.get("/test", (req, res) => res.json({msg: "Posts Works"}));

//post request for form for creating a new post
//post /post/create; (private)
router.post("/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findOne({name: req.body.groupName}, (err, postGroup) => {
        if(postGroup){
            const newPost = new Post({
                profile: currentUserProfile,
                group: postGroup,
                title: req.body.title,
                text: req.body.text,
            })
            newPost.save();
            res.redirect("id/" +newPost._id)
        } else {               
                console.log(err);
        }
    })
})

//get posts by in in params(Private)
//Get /post/id/:id
router.get('/id/:id', authenticate.checkLogIn, authenticate.reqSessionProfile,(req, res) => {
    const currentUserProfile = req.currentUserProfile
    Post.findOne({_id: req.params.id})
    .populate([
        {
            path: "profile",
            model: "profile"
        },
        {
            path: "comments.profile",
            model: "profile"
        },
        {
            path: "comments.subComments.profile",
            model: "profile"
        }
    ])
    .exec((err,post) => {
        if(post){
            res.render("pages/posts/post", {currentUserProfile, post});
        }else{
            console.log(err)
        }        
    });
});

//post request for form for creating a new comment for post
//post /post/comment/create; (private)
router.post("/comment/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Post.findOne({_id: req.body.postId}, (err, post) => {
        if(post){
            const newComment = {
                profile: currentUserProfile,
                text: req.body.text,
            }
            post.comments.push(newComment);
            post.save(); 
            res.redirect("/post/id/" +post._id)
        } else {               
                console.log(err);
        }
    })
})

//post request for form for creating a new subComment for comment
//post /post/subcomment/create; (private)
router.post("/subcomment/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Post.findOne({_id: req.body.postId}, (err, post) => {
        if(post){
            const newSubComment = {
                profile: currentUserProfile,
                text: req.body.text,
            }
            var index = req.body.index.toString()

            post.comments[index].subComments.push(newSubComment);
            post.save(); 
            res.redirect("/post/id/" +post._id)
        } else {               
                console.log(err);
        }
    })
})





module.exports = router;