const mongoose = require('mongoose');
const joi = require('@hapi/joi');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    token : {
        type : String,
        unique : true
    },
    password: {
        type : String,
    },
    email : {
        type : String,
        unique : true
    },
    sex: {
        type : String,
        enum : ['male','female'],
    },
    about: {
        type : String,
    },
    token: {
        type : String,
    }
});

userSchema.statics.signUpValidation = function(object){
    const sex = ["male", "female"];
    const schema = joi.object({
        name: joi.string().min(4).max(15).required(),
        password: joi.string().min(6).required(),
        email: joi.string().email().required().lowercase(),
        sex : joi.string().required().valid(...sex),
        about : joi.string(),
    });
    return schema.validate(object)
}

module.exports = mongoose.model('User',userSchema);