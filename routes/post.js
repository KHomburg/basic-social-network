const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");
const multer = require('multer');
const imageUpload = require("../functions/image-upload");


//Load custom functions
const postsAndComments = require("../functions/postsAndComments");


router.get("/test",  authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => { 
    const currentUserProfile = req.currentUserProfile
    res.render("pages/test", {currentUserProfile})
});


router.post('/upload1', function (req, res, next) {
    var upload = multer({
        storage: imageUpload.avatar
    })
    .single('avatar')
	upload(req, res, function(err) {
        console.log(req.body)

		res.end('File is uploaded')
	})


})

router.post('/upload2',  function (req, res, next) {
    var upload = multer({
        storage: imageUpload.contentImage
    })
    .single('image')
	upload(req, res, function(err) {
        console.log(req.body)


		res.end('File is uploaded')
	})

})


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
    postsAndComments.deletePost(req,res, (groupName) => {
        res.redirect("/group/name/" +groupName)
    })
})


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
    postsAndComments.deleteComment(req,res, (groupName) => {
        res.redirect("/post/id/" +req.body.postId)
    })
});


//post request for deleting a subcomment
//post /post/subcomment/delete; (private)
router.post('/subcomment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    postsAndComments.deleteSubComment(req,res, (groupName) => {
        res.redirect("/post/id/" +req.body.postId)
    })
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