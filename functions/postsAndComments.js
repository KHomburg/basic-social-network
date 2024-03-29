const express = require("express");
const router = express.Router();
const authenticate = require("./authenticate");
const multer = require('multer');
const image = require("../functions/image");
const sharp = require("sharp");
const config = require("../config/config")

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");
const ContentImage = require("../models/Contentimage");
const Notification = require("../models/Notification");

//custom modules
const notification = require("../functions/notification")
const errLog = require("../functions/error-log");


/*
Creates a new Post along with Notification
Takes req Object with Attributes:
    req.file: Post image (optional)
    req.currentUserprofile: currentUserProfile (required)
    req.groupName: name of group the post belongs to (required)
    req.body.title: title of Post (required)
    req.body.text: text of Post
returns redirect as response
*/

    
const createPost = (req, res) => {
    return new Promise((resolve, reject) => {
    const currentUserProfile = req.currentUserProfile
    
    var upload = multer({
        storage: image.uploadContentImage,
        fileFilter: image.imageFilter,
    })
    .single('image')
    upload(req, res, function(err) {
        if(err){
            reject(err)
        }else if(req.file){
            //creating the Post object
            Group.findOne({name: req.body.groupName})
                .then((postGroup) => {

                    //initialize new ContentImage object
                    const id = req.file.filename.toString()
                    req.newContentImage.profile = currentUserProfile
                    req.newContentImage.group = postGroup
                    req.newContentImage.parentType = "post"

                    let file = req.file.destination + "/" + req.file.filename
                    sharp(file)
                        .resize({height: 1000}) //resizing to max. height 1000px autoscaled
                        .toFormat("jpeg")       //changes format to jpeg
                        .jpeg({
                            quality: 60,        //changes image quality to *number* percent
                        })
                        .toFile(config.uploadDirImages + req.file.filename)
                        .then((info) => { 
                            //create new Post object with image
                            const newPost = new Post({
                                profile: currentUserProfile,
                                group: postGroup,
                                title: req.body.title,
                                text: req.body.text,
                                image: req.newContentImage,
                            })
                            //create new Notification with new Post
                            const newNotification = new Notification({
                                profile: currentUserProfile,
                                group: postGroup,
                                refContent: newPost,
                                refContentType: "post",
                                addressee: currentUserProfile,
                                updatedBy: currentUserProfile
                            })

                            //add notification reference to newPost
                            newPost.notification = newNotification;

                            //save notification and post
                            newNotification.save().catch((err) => {
                                reject(err)
                            });
                            newPost.save()
                            .then((newPost) => {resolve(newPost)})
                            .catch((err) => {
                                reject(err)
                            });

                            req.newContentImage.path = config.uploadDirImages + req.file.filename
                            req.newContentImage.parentPost = newPost;

                            req.newContentImage.save()
                            .catch((err) => {
                                reject(err)
                            });
                            
                        })
                        .catch((err) => {
                            reject(err)
                        });

                })
                .catch((err) => {            
                    reject(err)
                });
        }else{
            //creating the Post object without image
            Group.findOne({name: req.body.groupName})
                .then((postGroup) => {
                    const newPost = new Post({
                        profile: currentUserProfile,
                        group: postGroup,
                        title: req.body.title,
                        text: req.body.text,
                    })

                    //create new Notification with new Post
                    const newNotification = new Notification({
                        profile: currentUserProfile,
                        group: postGroup,
                        refContent: newPost,
                        refContentType: "post",
                        addressee: currentUserProfile,
                        updatedBy: currentUserProfile
                    })

                    //add notification reference to newPost
                    newPost.notification = newNotification;

                    //save notification and post
                    newNotification.save().catch((err) => {reject(err)});

                    newPost.save()
                    .then(newPost => resolve(newPost))
                    .catch((err) => {
                        reject(err)
                    });
                })
            .catch((err) => {       
                reject(err)
            });
        }
    })
})}

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
                path: "group",
                model: "group"
            },
            {
                path: "image",
                model: "contentImage"
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
                        path: "image",
                        model: "contentImage"
                    },
                    {
                        path: "subcomments._id",
                        model: "subcomment",
                        populate: [{
                            path: "profile",
                            model: "profile"
                        },
                        {
                            path: "image",
                            model: "contentImage"
                        }]                        
                    }
                ]
            }
        ]
    )
    .then((post) => {
            res.render("pages/posts/post", {currentUserProfile, post})
    })
    .catch((err)=>{                    
        errLog.createError(err, "Error getting post", "getPost function", currentUserProfile, undefined)
            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
    })
}


/*
Creates a new Comment along with Notification
Takes req Object with Attributes:
    req.file: Comment image (optional)
    req.currentUserprofile: currentUserProfile (required)
    req.groupId: id of Group the Comment belongs to (required)
    req.postId: id of Post the Comment belongs to (required)
    req.body.text: text of Comment (required)
returns redirect as response
*/
const createComment = (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const groupID = req.body.groupId
    const postID = req.body.postId

    var upload = multer({
        storage: image.uploadContentImage,
        fileFilter: image.imageFilter,
    })
    .single('image')
    upload(req, res, function(err) {
        if(req.file){

            Post.findById(req.body.postId)
                .populate('notification')
                .then((post) => {
                        if(post){
                            //initialize new ContentImage object
                            const id = req.file.filename.toString()
                            req.newContentImage.profile = currentUserProfile
                            req.newContentImage.group = groupID
                            req.newContentImage.parentPost = post
                            req.newContentImage.parentType = "comment"

                            let file = req.file.destination + "/" + req.file.filename
                            sharp(file)
                                .resize({height: 1000}) //resizing to max. height 1000px autoscaled
                                .toFormat("jpeg")       //changes format to jpeg
                                .jpeg({
                                    quality: 60,        //changes image quality to *number* percent
                                })
                                .toFile(config.uploadDirImages + req.file.filename) // TODO: change upload dir
                                .then((info) => { 
                                    const groupID = req.body.groupId
                                    const postID = req.body.postId
                                    console.log(info)
                                    const newComment = new Comment({
                                        profile: currentUserProfile,
                                        text: req.body.text,
                                        parentPost: post._id,
                                        group: groupID,
                                        image: req.newContentImage,
                                    })

                                    //create new Notification with new comment
                                    const newNotification = new Notification({
                                        profile: currentUserProfile,
                                        group: groupID,
                                        refContent: newComment,
                                        refContentType: "comment",
                                        parentContent: post._id,
                                        parentContentType: "post",
                                        addressee: currentUserProfile,
                                        updatedBy: currentUserProfile
                                    })

                                    //add notification reference to newComment
                                    newComment.notification = newNotification;
                                    //modify post
                                    post.notification.updatedBy = currentUserProfile //update the notification for that post
                                    post.notification.addressee.push(currentUserProfile) //add currentUserProfile to addressees
                                    post.notification.lastUpdated = new Date
                                    post.comments.push(newComment._id);

                                    //finalize and save new image object
                                    req.newContentImage.path = config.uploadDirImages + req.file.filename
                                    req.newContentImage.parentComment = newComment

                                    //save new Objects
                                    newNotification.save().catch((err) => {console.log({msg: err})});  
                                    newComment.save().catch((err) => {console.log({msg: err})});  
                                    post.save().catch((err) => {console.log({msg: err})});
                                    post.notification.save().catch((err) => {console.log({msg: err})});
                                    req.newContentImage.save().catch((err) => {console.log({msg: err})});

                                    res.redirect("/post/id/" +postID); 
                                })
                                .catch((err) => {console.log({msg: err})});

                        } else {               
                                console.log(err);
                        }
                })
                .catch((err) => {console.log({msg: err})});
            }else{
                //create new comment without image
                Post.findById(req.body.postId)
                    .populate('notification')
                    .then((post) => {
                            let postID = req.body.postId
                            if(post){
                                const newComment = new Comment({
                                    profile: currentUserProfile,
                                    text: req.body.text,
                                    parentPost: req.body.postId,
                                    group: req.body.groupId,
                                })

                                //create new Notification with new comment
                                const newNotification = new Notification({
                                    profile: currentUserProfile,
                                    group: groupID,
                                    refContent: newComment,
                                    refContentType: "comment",
                                    parentContent: postID,
                                    parentContentType: "post",
                                    addressee: currentUserProfile,
                                    updatedBy: currentUserProfile
                                })

                                //add notification reference to newComment
                                newComment.notification = newNotification;

                                //modify post
                                post.notification.updatedBy = currentUserProfile //update the notification for that post
                                post.notification.addressee.push(currentUserProfile) //add currentUserProfile to addressees
                                post.notification.lastUpdated = new Date
                                post.comments.push(newComment._id)


                                //save new objects
                                newNotification.save().catch((err) => {console.log({msg: err})});
                                newComment.save().catch((err) => {console.log({msg: err})});
                                post.save().catch((err) => {console.log({msg: err})});
                                post.notification.save().catch((err) => {console.log({msg: err})});


                                res.redirect("/post/id/" +postID); 

                            } else {               
                                    console.log(err);
                            }
                    })
                    .catch((err) => {console.log({msg: err})});
            }


        })
}

/*
Creates a new Subcomment along with Notification
Takes req Object with Attributes:
    req.file: Comment image (optional)
    req.currentUserprofile: currentUserProfile (required)
    req.groupId: id of Group the Subcomment belongs to (required)
    req.postId: id of Post the Subcommment belongs to (required)
    req.body.commentId: id of Comment the Subcomment belongs to (required)
    req.body.text: text of Comment (required)
returns redirect as response
*/
const createSubComment = (req, res) => {
    const currentUserProfile = req.currentUserProfile

    var upload = multer({
        storage: image.uploadContentImage,
        fileFilter: image.imageFilter,
    })
    .single('image')
    upload(req, res, function(err) {
        if(req.file){
            //create new comment with image
            console.log(req.file)

            Comment.findById(req.body.commentId)
                .populate('notification')
                .then((comment) => {
                    let postID = req.body.postId
                    let groupID = req.body.groupId
                    if(comment){

                        //initialize new ContentImage object
                        const id = req.file.filename.toString()
                        req.newContentImage.profile = currentUserProfile
                        req.newContentImage.group = groupID
                        req.newContentImage.parentPost = comment
                        req.newContentImage.parentType = "subcomment"

                        let file = req.file.destination + "/" + req.file.filename
                        sharp(file)
                            .resize({height: 1000}) //resizing to max. height 1000px autoscaled
                            .toFormat("jpeg")       //changes format to jpeg
                            .jpeg({
                                quality: 60,        //changes image quality to *number* percent
                            })
                            .toFile(config.uploadDirImages + req.file.filename) // TODO: change upload dir
                            .then(info => { 
                                console.log(info)
                                const newSubComment = new Subcomment({
                                    profile: currentUserProfile,
                                    text: req.body.text,
                                    parentPost: postID,
                                    parentComment: req.body.commentId,
                                    group: groupID,
                                    image: req.newContentImage,
                                })
        
                                //create new Notification with new comment
                                const newNotification = new Notification({
                                    profile: currentUserProfile,
                                    group: groupID,
                                    refContent: newSubComment,
                                    refContentType: "subcomment",
                                    parentContent: comment,
                                    parentContentType: "comment",
                                    addressee: currentUserProfile,
                                    updatedBy: currentUserProfile
                                })
        
                                newSubComment.notification = newNotification

                                //modify comment
                                comment.notification.updatedBy = currentUserProfile //update the notification for that comment
                                comment.notification.addressee.push(currentUserProfile) //add currentUserProfile to addressees
                                comment.notification.lastUpdated = new Date
                                comment.subcomments.push(newSubComment._id);

                                //finalize and save new image object
                                req.newContentImage.path = config.uploadDirImages + req.file.filename;
                                req.newContentImage.parentSubcomment = newSubComment._id;

                                //save new objects
                                newSubComment.save().catch((err) => {console.log({msg: err})});
                                newNotification.save().catch((err) => {console.log({msg: err})});
                                comment.save().catch((err) => {console.log({msg: err})});
                                req.newContentImage.save().catch((err) => {console.log({msg: err})});
                                comment.notification.save().catch((err) => {console.log({msg: err})});

                                res.redirect("/post/id/" +postID)
                            })
                            .catch((err) => {console.log({msg: err})});

                    } else {               
                            console.log(err);
                    }
                })
                .catch((err) => {console.log({msg: err})});
        }else{
            Comment.findById(req.body.commentId)
                .populate('notification')
                .exec( (err, comment) => {
                    let postID = req.body.postId
                    let groupID = req.body.groupId
                    if(comment){
                        const newSubComment = new Subcomment({
                            profile: currentUserProfile,
                            text: req.body.text,
                            parentPost: postID,
                            parentComment: req.body.commentId,
                            group: groupID,
                        })

                        //create new Notification with new comment
                        const newNotification = new Notification({
                            profile: currentUserProfile,
                            group: groupID,
                            refContent: newSubComment,
                            refContentType: "subcomment",
                            parentContent: comment,
                            parentContentType: "comment",
                            addressee: currentUserProfile,
                            updatedBy: currentUserProfile
                        })

                        newSubComment.notification = newNotification._id


                        //modify comment
                        comment.notification.updatedBy = currentUserProfile //update the notification for that comment
                        comment.notification.addressee.push(currentUserProfile) //add currentUserProfile to addressees
                        comment.notification.lastUpdated = new Date 
                        comment.subcomments.push(newSubComment._id);


                        //save new/modified objects
                        newSubComment.save().catch((err) => {console.log({msg: err})});
                        newNotification.save().catch((err) => {console.log({msg: err})});
                        comment.save().catch((err) => {console.log({msg: err})});
                        comment.notification.save().catch((err) => {console.log({msg: err})});

                        res.redirect("/post/id/" +postID)

                    } else {               
                            console.log(err);
                    }
                })
        }
    })
}

/*
Deletes a Post by postId
takes a callback and hands over the groupName
*/
const deletePost = (req, res, callback) => {
    const currentUserProfile = req.currentUserProfile
    Post.findById({_id: req.body.postId})
        .populate("group")
        .then((post) => {
            const groupName = post.group.name
            post.remove()
                .then((deleted) => {
                    if(callback){
                        callback(groupName)
                    }
                })
        })
        .catch((err)=>{                    
            errLog.createError(err, "Error deleting Post (deletPost function)", "deletPost function", currentUserProfile, undefined)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
        
}


/*
deletes a comment object by a id and deletes it from the comments array of the parentPost
function need the comment id through req.body.commentId and a profile id through req.currentUserProfile
req.currentUserProfile needs to either the id of the profile in the comment object (the poster)
or the moderator of the group the parentPost has been posted to
*/
const deleteComment = (req, res, callback) => {
    const currentUserProfile = req.currentUserProfile
    const commentId = req.body.commentId

    //find comment & populate with parentPost and parentPost.group
    Comment.findById(commentId)
    .populate(
        [
            {
                path:"group",
                model:"group"
            },
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
    .then((comment) => {
        const group = comment.group;
        const groupName = group.name

        const post = comment.parentPost;
        const postsComments = post.comments;

        //Check if currentUser is moderator of the group, the comment is in
        //TODO: refactor following function with includes
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
            //save post and remove comment         
            post.save().then(comment.remove())
            if(callback){
                callback(groupName)
            }
            
        }else{
            console.log("error in post/comment/delete - not op or mod")
        }
    })
    .catch((err)=>{                    
        errLog.createError(err, "Error deleting Comment (deleteComment function)", "deleteComment function", currentUserProfile, undefined)
            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
    })
}


/*
deletes a Subcomment object by a id and deletes it from the Subcomments array of the parentComment
function needs the Subcomment id through req.body.subCommentId and a profile id through req.currentUserProfile
req.currentUserProfile needs to either the id of the profile in the comment object (the poster)
or the moderator of the group the parentPost has been posted to
*/
const deleteSubComment = (req, res, callback) => {
    const currentUserProfile = req.currentUserProfile
    const subCommentId = req.body.subCommentId

    //find comment & populate with parentPost and parentPost.group
    Subcomment.findById(subCommentId)
    .populate(
        [
            {
                path:"parentComment",
                model:"comment"
            },
            {
                path:"group",
                model:"group"
            },
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
    .then((subComment) => {        
        const group = subComment.group;
        const groupName = group.name

        //if parentPost is already deleted, delete subcomment immediately
        if(!subComment.parentPost){
            subComment.remove()
            if(callback){
                callback(groupName)
            }

        //if parentComment is already deleted, delete subcomment immediately
        }else if (!subComment.parentComment){
            subComment.remove()
            if(callback){
                callback(groupName)
            }
        }else{

            const comment = subComment.parentComment
            const post = subComment.parentPost;
            const commentsSubcomments = comment.subcomments

            //Check if currentUser is moderator of the group, the subcomment is in
            let isModerator = post.group.moderator.find((mod) => {
                return mod._id.toString() == currentUserProfile._id.toString()
            })

            //Check if currentUser is OP of the subComment
            let userIsOP = (subComment) => {
                if(currentUserProfile._id.toString() == subComment.profile._id.toString()){
                    return true
                }else{
                    return false
                }
            }

            //find subComment in parentComment->subComments array
            let subCommentInComment = commentsSubcomments.find((subComment) => {
                return subComment._id._id == subCommentId
            })

            //find index of deleting subcomment
            const index = commentsSubcomments.indexOf(subCommentInComment);
                    
            if(subCommentInComment && (isModerator || userIsOP(subComment))){
                //splice deleting subcomment out
                commentsSubcomments.splice(index,1)
                //save comment and remove subcomment            
                comment.save().then(subComment.remove())
                notification.deleteNotification(subComment.notification)
                    .then()
                    .catch((err) => console.log(err))
                if(callback){
                    callback(groupName)
                }
            }else{
                console.log("error in post/comment/delete - not op or mod")
            }
        }
    })
    .catch((err)=>{                    
        errLog.createError(err, "Error deleting Subcomment (deleteSucomment function)", "deleteSucomment function", currentUserProfile, undefined)
            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
    })
}


//Function for showing the stream of new posts on the frontpage
const getStream = (req, res) => {
    const currentUserProfile = req.currentUserProfile

    const subedGroups = [];
    currentUserProfile.membership.forEach((group) => {
        subedGroups.push(group._id._id)
        }
    )

    //constants for pagination
    const perPage = 50
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
        .then((posts) => {
            res.render("pages/posts/stream", {currentUserProfile, posts, url: "/post/stream", current: page});
        })
        .catch((err)=>{                    
            errLog.createError(err, "Error getting Post for Stream (getStream function)", "getStream function", currentUserProfile, undefined)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
}

/*
Creates a new report object in one of the group.reportedXXX arrays (if content is not already reported)
Takes req Object with Attributes:
    req.currentUserprofile: currentUserProfile (required)
    req.body.ID: id of the reported Content (required)
    req.body.contentType: type of the reported content ("post"/"comment"/"subcomment") (required)
returns redirect as response
*/
const reportContent = (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findById(req.body.groupID)
        .then((group)=> {
        if(group){
            const newReportedContent = {
                content: req.body.ID,
                contentType: req.body.contentType,
                reportedBy: currentUserProfile,
                reason: req.body.reason,
            }

            //check which kind of content is reported
            if(req.body.contentType == "post"){
                group.reprtedContent = group.reportedPosts
            } else if (req.body.contentType == "comment") {
                group.reprtedContent = group.reportedComments
            }else if(req.body.contentType == "subcomment"){
                group.reprtedContent = group.reportedSubcomments
            }

            //check if content has allready been reported
            const findDoubles = group.reprtedContent.find((report)=>{
                return report.content.toString() == newReportedContent.content.toString()
            })

            //if content has not reported => push to group.reportedContent and save
            if(!findDoubles){
                group.reprtedContent.push(newReportedContent)
                group.save()
                    .then(() =>{
                            console.log(newReportedContent + " has been reported!");
                            res.status(204).send();
                        })
                    //.catch(console.log("something went wrong while trying to report object:" + newReportedContent))  ALWAYS EXECUTES THE CATCH FOR A REASON
            }else{
                console.log("content already reported")
            }

        }else{
            console.log("something went wrong: could not find group, on /post/reportContent")
        }
    })
    .catch((err)=>{                    
        errLog.createError(err, "Error reporting Content (reportContent function)", "reportContent function", currentUserProfile, undefined)
            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
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
    reportContent,
}