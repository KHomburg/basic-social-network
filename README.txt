Instruction:
1.  Clone the repo
2.  install dependencies via "npm install"
4.  Create a keys.js file in /config/folder (details below)
5. Run command "gulp default"
3. run command "node app"


Structure of the keys.js file:

module.exports = {
    secretOrKey: "YourKey", //key for password encryption
    db: 'YourDB', //db key/connection (standard local: 'mongodb://localhost:27017/trami')
    port: "YourPort", //localhost port 
};


TODO:
- implement error handling strategie