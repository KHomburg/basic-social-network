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
                    resolve(ErrLog)
                })
        }else{
            reject("Error in error handler: no error message")
        }
        
    })
}


module.exports = {
    createError,
}