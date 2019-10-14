Instruction:
1.  Clone the repo
2.  install dependencies via "npm install"
3.  Create a keys.js file in /config/folder (details below)
4.  Create folder "images" in the root of this repo, and inside this folder three more folders: "Avatars", "contentImages", "unprocessed"
5.  Run command "gulp default"
6.  run command "node app"


Structure of the keys.js file:

module.exports = {
    secretOrKey: "YourKey", //key for password encryption
    db: 'YourDB', //db key/connection (standard local: 'mongodb://localhost:27017/trami')
    port: "YourPort", //localhost port 
};


=> Plenty of work left to do
