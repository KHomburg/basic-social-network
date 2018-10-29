const Validator = require("validator");
const isEmpty = require("./is-empty");



module.exports = function validateChangePassword(data){
    let errors = {};

    data.newPW = !isEmpty(data.newPW) ? data.newPW : "";
    data.newPW2 = !isEmpty(data.newPW2) ? data.newPW2 : "";

    if(Validator.isEmpty(data.newPW)){
        errors.newPW = "Password field is required";
    }

    if(!Validator.isLength(data.newPW, {min: 6, max: 30})){
        errors.newPW = "Password must be between 6 and 30 characters";
    }

    if(Validator.isEmpty(data.newPW2)){
        errors.newPW2 = "Confirm password field is required";
    }

    if(!Validator.equals(data.newPW, data.newPW2)){
        errors.newPW2 = "Passwords must match";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}