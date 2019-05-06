const ErrorLog = require("../models/ErrorLog");

//create a new error object
const createError = (message, route, profile, errLog, group) => {
    return new Promise((reject, resolve) => {
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
    })
}


module.exports = {
    createError,
}