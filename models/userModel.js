const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        default: ''
    }
});

const user = mongoose.model('User', userSchema);

const userModel = {
    fetchUser: (details) => {
        return user.findOne(details).lean().exec();
    },

    saveUser: (details, cb) => {
        const newUser = new user(details);
        newUser.save(function(err) {
            if (err) {
                return cb(false);
            }
            return cb(true);
        });
    }
};

module.exports = userModel;