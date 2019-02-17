const express = require("express");
const router = express.Router();
const authenticate = require("./authenticate");
const config = require("../config/config");
const multer = require('multer');


const avatar = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads/avatar')
	},
	filename: function(req, file, callback) {
		let newAvatar = new Avatar({
		})
		callback(null, newAvatar._id.toString())
	}
})

const contentImage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads/images')
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
		console.log(req.file) //log file here

		//create and save new avatar model which has the id of the filename
		const newAvatar = new Avatar({
            _id : id,
            profile : currentUserProfile,
        })
        newAvatar.save()

		res.end('File is uploaded') //the message that is sent after file upload
	})
	//console.log(req.file)


*/


module.exports = {avatar, contentImage}