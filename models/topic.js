'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;
//var Rating = require('./rating');

// Modelo de Rating
var RatingSchema = Schema({
    value: String,
    user: { type: Schema.ObjectId, ref: 'User'}
});

var Rating = mongoose.model('Rating', RatingSchema);

// Modelo de COMMENT
var CommentSchema = Schema({
    content: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User'},
    ratings: [RatingSchema]
});

var Comment = mongoose.model('Comment', CommentSchema);

// Modelo de TOPIC
var TopicSchema = Schema({
    title: String,
    content: String,
    code: String,
    lang: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User'},
    comments: [CommentSchema]
});

// Cargar paginación
TopicSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Topic', TopicSchema);