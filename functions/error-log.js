const ErrorLog = require("../models/ErrorLog");

//create a new error object
const createError = (errLog, message, route, profile, group) => {
    return new Promise((reject, resolve) => {
        if(errLog){
            const newErrorLog = new ErrorLog({
                message: message,
                profile: profile,
                route: route,
                errLog: errLog,
                group: group,
            })
            newErrorLog.save()
                .then((ErrLog) => {
                    console.log("ERROR: " + ErrLog)
                    resolve(ErrLog)
                })
                .catch((err) => {
                    console.log("ERROR in ERROR Handler: Failed saving Error:   " + newErrorLog + " Error while trying to save:" + err)
                })
        }else{
            reject("Error in error handler: no error message")
            res.render("pages/error-page", {})
        }
        
    })
}

//ERROR MESSAGE DISPLAYER
const errDisplay = (function(err, req, res, next){
    const newErrorLog = new ErrorLog({
        errLog: err,
    })
    newErrorLog.save()
        .then((ErrLog) => {
            console.log("ERROR: " + ErrLog)
            resolve(ErrLog)
            res.status(500);
            res.render("pages/error-page", {})
        })
        .catch((err) => {
            console.log("ERROR in ERROR Handler: Failed saving Error:   " + newErrorLog + " Error while trying to save:" + err)
            res.status(500);
            res.render("pages/error-page", {})
        })
});


module.exports = {
    createError,
    errDisplay,
}