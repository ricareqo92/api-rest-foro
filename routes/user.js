'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var router = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users'});
// Rutas de prueba
router.get('/Probando', UserController.probando);
router.post('/Testeando', UserController.testeando);

// Rutas de usuarios
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/user/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.UploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);

module.exports = router;
