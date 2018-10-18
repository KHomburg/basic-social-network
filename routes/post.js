const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");

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
    const currentUserProfile = req.currentUserProfile

    //creating an Array of id's of the subed groups
    const subedGroups = Array.from(
        currentUserProfile.membership.concat(currentUserProfile.moderatorOf), 
        (group) => {group._id._id}
        )

    //constants for pagination
    const perPage = 30
    const page = req.params.page || 1

    //search the posts
    Post.find({"group": { $in: subedGroups}})
        .sort({date: -1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate(        
            [
                {
                    path: "profile",
                    model: "profile"
                },
                {
                    path: "group",
                    model: "group"
                },
            ]
        )
        .exec((err, posts) => {
            res.render("pages/posts/stream", {currentUserProfile, posts});
        })
});


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
        let postID = req.body.postId
        if(post){
            const newComment = new Comment({
                profile: currentUserProfile,
                text: req.body.text,
                parentPost: req.body.postId,
            })

            newComment.save();
            post.comments.push(newComment);
            post.save(); 
            res.redirect("/post/id/" +postID)
        } else {               
                console.log(err);
        }
    })
})

//post request for form for creating a new subComment for comment
//post /post/subcomment/create; (private)
router.post("/subcomment/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Comment.findOne({_id: req.body.commentId}, (err, comment) => {
        let postID = req.body.postId
        if(comment){
            const newSubComment = new Subcomment({
                profile: currentUserProfile,
                text: req.body.text,
                parentPost: req.body.postId,
                parentComment: req.body.commentId,
            })

            newSubComment.save();
            comment.subcomments.push(newSubComment);
            comment.save(); 
            res.redirect("/post/id/" +postID)
        } else {               
                console.log(err);
        }
    })
});

//post request for deleting a post-comment
//post /post/comment/delete; (private)
router.post('/comment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    Post.findOne({_id: req.body.postId})
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

            Comment.findByIdAndDelete(findComment._id)
                .exec(
                    res.redirect("/post/id/" +req.body.postId)
                )

        })
});


//post request for deleting a subcomment
//post /post/subcomment/delete; (private)
router.post('/subcomment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    Comment.findOne({_id: req.body.commentId})
        .exec((err, comment) =>{
            var subCommentId = req.body.subCommentId

            //find subComment in subComments            
            var findSubComment = comment.subcomments.find((subComment) => {
                return subComment._id == subCommentId
            })

            //find index of deleting comment
            var index = comment.subcomments.indexOf(findSubComment);

            //splice deleting comment out
            comment.subcomments.splice(index,1)  
            comment.save()

            Subcomment.findByIdAndDelete(findSubComment._id)
                .exec(
                    res.redirect("/post/id/" +req.body.postId)
                )
        })
});

//get posts by in in params(Private)
//Get /post/id/:id
router.get('/id/:id', authenticate.checkLogIn, authenticate.reqSessionProfile,(req, res) => {
    const currentUserProfile = req.currentUserProfile
    Post.findOne({_id: req.params.id})
    .populate(
        [
            {
                path: "profile",
                model: "profile"
            },
            {
                path: "comments._id",
                model: "comment",
                populate: [
                    {
                        path: "profile",
                        model: "profile",
                    },
                    {
                        path: "subcomments._id",
                        model: "subcomment",
                        populate: {
                            path: "profile",
                            model: "profile"
                        }
                    }
                ]
            }
        ]
    )
    .exec((err,post) => {
        if(post){
            //queries:
            //console.log(post)
            //console.log("--------------------")
            //console.log(post.comments)
            //console.log("--------------------")
            //console.log(post.comments[0]._id.profile)
            //console.log("--------------------")
            //console.log(post.comments[0]._id.subcomments)
            //console.log("--------------------")
            //console.log(post.comments[0]._id.subcomments[0]._id)
            res.render("pages/posts/post", {currentUserProfile, post});
        }else{
            console.log(err)
        }        
    });
});









module.exports = router;