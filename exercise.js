const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    username: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        min: 1,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Exercise', exerciseSchema);