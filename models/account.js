var mongoose = require('mongoose')
    SALT_WORK_FACTOR = 10,
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    userName: { type: String, required: true},
    name: { type: String, required: true },
    lastNamr: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: false },
    timeZone: { type: String, required: true },
    birthDate: {type: Date},
    accessToken: { type: String }, // Used for Remember Me
    digestors: { type: Array, required: false },
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);