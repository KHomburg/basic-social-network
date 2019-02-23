const express = require("express");
const router = express.Router();
const authenticate = require("./authenticate");
const config = require("../config/config");
const multer = require('multer');
const sharp = require("sharp");



//TODO: change directories when config.js path is fixed
const uploadAvatar = multer.diskStorage({
	destination: function(req, file, callback) {

		callback(null, './uploads/avatar')
	},
	filename: function(req, file, callback) {
		let newAvatar = new Avatar({
		})
		callback(null, newAvatar._id.toString())
	}
})

const uploadContentImage = multer.diskStorage({
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

//Example for using sharp
//Code must be insterted to route
/*
	let file = req.file.destination + "/" + req.file.filename
	console.log(file)
	sharp(file)
		.resize({height: 1000}) //resizing to max. height 1000px autoscaled
		.toFormat("jpeg")   //changes format to jpeg
		.jpeg({
			quality: 60,    //changes image quality to *number* percent
		})
		.toFile('./uploads/avatar/test' + req.file.filename) // TODO: change upload dir
		.then(info => { console.log(info)})
		.catch(err => { console.log(err)});
*/


//function to return path to avatar if available, need currentUser profile as params
let showAvatar = (currentUserProfile) => {
	if(currentUserProfile.avatar){
		return 'images/avatars/' + currentUserProfile.avatar
	} else {
		return "images/maxresdefault.jpg"
	}}


module.exports = {
	uploadAvatar, 
	uploadContentImage,
	showAvatar
}