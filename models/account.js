var mongoose = require('mongoose')
    SALT_WORK_FACTOR = 10,
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    nickname: String,
    email: String,
    country: String,
    birthdate: Date,
    accessToken: { type: String }, // Used for Remember Me
    digestors: { type: Array, required: false },
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);