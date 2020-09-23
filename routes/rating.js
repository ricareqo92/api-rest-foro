'use strict'

var express = require('express');
var ratingController = require('../controllers/rating');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

router.post('/rating/topic/:topicId/:commentId', md_auth.authenticated, ratingController.add);
router.get('/rating/comment/:topicId/:commentId', ratingController.usersByRating);

module.exports = router;