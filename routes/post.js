const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");

router.get("/test", (req, res) => res.json({msg: "Posts Works"}));

////get request for post stream
////get /stream/:page; (private)
//router.get("/stream/:page", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
//
//    //constants for pagination
//    const perPage = 3
//    const page = req.params.page || 1
//
//    const currentUserProfile = req.currentUserProfile;
//    const membershipArray = currentUserProfile.membership;
//    const moderatorArray = currentUserProfile.moderatorOf;
//
//    //concat => array of groups
//    //find in post matching groups
//    //sort
//    
//
//    Post.find()
//        //.populate("profile")
//        //.$where("profile.membership._id" == "5b7a883e4bfbc849e8defeef")
//        //.skip((perPage * page) - perPage)
//        //.limit(perPage)        
//        .exec((posts) => {
//            var streamPosts = [];
//
//            //posts.group
//            console.log(posts)
//            //res.render("pages/posts/stream", {currentUserProfile, posts});
//        })
//})

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

//post request for deleting a post
//post /post/post/delete; (private)
router.post('/post/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    Post.findOneAndRemove({_id: req.body.postId})
        .populate("group")
        .exec((err, post) =>{
            res.redirect("/group/name/" +post.group.name)
        })
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
});

//post request for deleting a post-comment
//post /post/comment/delete; (private)
router.post('/comment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    Post.findOne({_id: req.body.postId})
        .populate("group", "comments")
        .exec((err, post) =>{
            var commentId = req.body.commentId
            var comments = post.comments

            //find comment in comments array
            var findComment = comments.find((comment) => {
                return comment._id == commentId
            })
            //find index of deleting comment
            var index = comments.indexOf(findComment);
            //splice deleting comment out
            comments.splice(index,1)
            
            post.save()
            res.redirect("/post/id/" +req.body.postId)
        })
});


//post request for deleting a subcomment
//post /post/subcomment/delete; (private)
router.post('/subcomment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    Post.findOne({_id: req.body.postId})
        .populate("group", "comments")
        .exec((err, post) =>{
            var commentId = req.body.commentId
            var subCommentId = req.body.subCommentId
            var comments = post.comments
            //var subComments = findComment.subComments

            //find comment in comments array
            var findComment = comments.find((comment) => {
                return comment._id == commentId
            })

            //find suComment in subComments
            var findSubComment = findComment.subComments.find((subComment) => {
                return subComment._id == subCommentId
            })

            //find index of deleting comment
            var index = findComment.subComments.indexOf(findSubComment);

            //splice deleting comment out
            findComment.subComments.splice(index,1)

            post.save()
            res.redirect("/post/id/" +req.body.postId)
        })
});

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









module.exports = router;