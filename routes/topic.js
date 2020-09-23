'use strict'

var express = require('express');
var topicController = require('../controllers/topic');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

router.get('/test', topicController.test);
router.post('/topic', md_auth.authenticated, topicController.save);
router.get('/topics/:page?', topicController.getTopics);
router.get('/user-topics/:user', topicController.getTopicsByUser);
router.get('/topic/:id', topicController.getTopic);
router.put('/topic/:id', md_auth.authenticated, topicController.update);
router.delete('/topic/:id', md_auth.authenticated, topicController.delete);
router.get('/search/:search', topicController.search);
module.exports = router;

