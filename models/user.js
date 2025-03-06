const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

//not gonna specify password and username, passport-local-mongoose will add those fields
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose); //this will add username and password fields to the schema

module.exports = mongoose.model('User', UserSchema);