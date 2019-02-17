const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");
const multer = require('multer');


const avatar = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads')
	},
	filename: function(req, file, callback) {
		callback(null, 'fileName (content)' + Date.now())
	}
})

const contentImage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads')
	},
	filename: function(req, file, callback) {
		callback(null, "fileName (content)" + Date.now())
	}
})

//Example of how to use the avatar-upload in the route:
//first require the file as imageUpload
/*
    var upload = multer({
        storage: imageUpload.avatar
    })
    .single('avatar')
	upload(req, res, function(err) {
		console.log(req.body) //access req.body object here

		res.end('File is uploaded') //the message that is sent after file upload
	})
	//console.log(req.file)


*/


module.exports = {avatar, contentImage}