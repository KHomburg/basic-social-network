const Validator = require("validator");
const isEmpty = require("./is-empty");



module.exports = function changeEmail(data){
    let errors = {};


    data.newEmail = !isEmpty(data.newEmail) ? data.newEmail : "";
    data.password = !isEmpty(data.password) ? data.password : "";

    if(Validator.isEmpty(data.newEmail)){
        errors.email = "Email field is required";
    }

    if(!Validator.isEmail(data.newEmail)){
        errors.email = "Email is invalid";
    }

    if(Validator.isEmpty(data.password)){
        errors.password = "Password field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}