const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema({
    email: {
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
    fetchOrSaveUser: (details) => {
        return user.findOneAndUpdate(details, details, { upsert: true });
    }
};

module.exports = userModel;