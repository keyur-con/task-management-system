const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    authProvider: {
        type: String,
        default: 'local' 
    },

});

module.exports = mongoose.model('User', userSchema);