'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Modelo de Rating
var RatingSchema = Schema({
    value: Number,
    user: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Rating', RatingSchema);