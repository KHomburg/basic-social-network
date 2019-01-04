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


//Custom Functions for Posts/Comments/SubComments Routes

const createPost = (req, res) => {
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
}

const getPost = (req, res) => {
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
}

const createComment = (req, res) => {
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
}

const createSubComment = (req, res) => {
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
}

const deletePost = (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Post.findOneAndRemove({_id: req.body.postId})
        .populate("group")
        .exec((err, post) =>{
            res.redirect("/group/name/" +post.group.name)
        })
}

/*
deletes a comment object by a id and deletes it from the comments array of the parentPost
function need the comment id through req.body.commentId and a profile id through req.currentUserProfile
req.currentUserProfile needs to either the id of the profile in the comment object (the poster)
or the moderator of the group the parentPost has been posted to
*/
const deleteComment = (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const commentId = req.body.commentId

    //find comment & populate with parentPost and parentPost.group
    Comment.findById(commentId)
    .populate(
        [
            {
                path:"parentPost",
                model:"post",
                populate: [
                    {
                        path:"group",
                        model:"group"
                    }
                ]
            }
        ]
    )
    .exec((err, comment) => {
        const group = comment.parentPost.group;
        const post = comment.parentPost;
        const postsComments = post.comments;

        //Check if currentUser is moderator of the group, the comment is in
        let isModerator = post.group.moderator.find((mod) => {
            return mod._id.toString() == currentUserProfile._id.toString()
        })

        //Check if currentUser is OP of the comment
        let userIsOP = (comment) => {
            if(currentUserProfile._id.toString() == comment.profile._id.toString()){
                return true
            }else{
                return false
            }
        }

        //find comment in posts->comments array
        let commentInPost = postsComments.find((comment) => {
            return comment._id._id == commentId
        })

        //find index of deleting comment
        const index = postsComments.indexOf(commentInPost);
                
        if(commentInPost && (isModerator || userIsOP(comment))){

            //splice deleting comment out
            postsComments.splice(index,1)            
            post.save().then(comment.remove())
            res.redirect("/post/id/" +req.body.postId)


        }else{
            console.log("error in post/comment/delete - not op or mod")
        }
    })
}

const deleteSubComment = (req, res) => {
    const currentUserProfile = req.currentUserProfile
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
}

const getStream = (req, res) => {
    const currentUserProfile = req.currentUserProfile

    const subedGroups = [];
    currentUserProfile.membership.concat(currentUserProfile.moderatorOf).forEach((group) => {
        subedGroups.push(group._id._id)
        }
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
}



module.exports = {
    createPost,
    deletePost,
    createComment,
    createSubComment,
    deleteComment,
    deleteSubComment,
    getPost,
    getStream,
}