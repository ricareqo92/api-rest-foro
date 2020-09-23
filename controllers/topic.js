'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    test: function (req, res) {
        res.status(200).send({
            message: 'testeando'
        });
    },
    save: function (req, res) {

        // Recoger parámetros por post
        var params = req.body;

        // Validar datos

        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }catch(err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }
        
        if ( validate_content && validate_title && validate_lang ) {
            // Crear objeto a guardar
            var topic = new Topic();

            // Asignar Valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            // Guardar el topic
            topic.save((err, topicStored) => {

                if ( err || !topicStored ) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tema no se ha guardado'
                    });
                }
                // Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    topic: topicStored
                });
            });
        } else {
            // Devolver una respuesta
            return res.status(200).send({
                message: 'Los datos no son válidos'
            });
        }
        
    },
    getTopics: function (req, res) {

        // Cargar la librería de paginación en la clase

        // Recoger la página actual
        if ( !req.params.page || req.params.page == 0 || req.params.page == null || req.params.page == undefined ) {
            var page = 1;
        } else {
            var page = parseInt(req.params.page);
        }

        // Indicar las opciones de paginación
        var options = {
            sort: {date: -1},
            populate: 'user',
            limit: 5,
            page
        };

        // Fin paginado
        Topic.paginate({}, options, (err, topics) => {
            // Devolver una respuesta (topics, total de topic, total de páginas)
            
            if ( err ) {
                return res.status(500).send({
                    status: 'success',
                    message: 'Error al hacer la consulta'
                });
            }

            if ( !topics ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay topics'
                });
            }

            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });
        
    },
    getTopicsByUser: function (req, res) {
        // Conseguir el id del usuario
        var userId = req.params.user;

        // Find con una condición de usuario
        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {

            if ( err ) {
                // Devolver resultado
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                }); 
            }

            if ( !topics ) {
                // Devolver resultado
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar'
                }); 
            }

            // Devolver resultado
            return res.status(200).send({
                status: 'success',
                topics
            });
        });
    },
    getTopic: function (req, res) {
        // Sacar el id del topic de la url
        var topicId = req.params.id;

        // Find por id del topic
        Topic.findById(topicId)
            .populate('user')
            .populate('comments.user')
            .populate('comments.ratings.user')
            .exec((err, topic) => {
                if ( err ) {
                    // Devolver resultado
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if ( !topic ) {
                    // Devolver resultado
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el topic'
                    });
                }

                // Devolver resultado
                return res.status(200).send({
                    status: 'success',
                    topic
                });
            });
        
    },
    update: function (req, res) {
        // Recoger el id del topic de la url
        var topicId = req.params.id;

        // Recoger los datos que llegan desde put
        var params = req.body;

        // Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }catch(err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if ( validate_title && validate_content && validate_lang ) {
            // Montar un json con los datos modificables
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };

            // Find and update del topic por id y por id de usuario
            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new: true}, (err, topicUpdate) => {
                if ( err ) {
                    // Devolver resultado
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if ( !topicUpdate ) {
                    // Devolver resultado
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se ha actualizado el tema'
                    });
                }

                // Devolver resultado
                return res.status(200).send({
                    status: 'success',
                    topic: topicUpdate
                });
            });
        } else {
            // Devolver resultado
            return res.status(500).send({
                status: 'error',
                message: 'Datos enviados incorrectamente'
            });
        }  
    },
    delete: function (req, res) {

        // Sacar el id del topic de la url
        var topicId = req.params.id;

        // Find and delete por topicID y por userID
        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved) => {
            if ( err ) {
                // Devolver resultado
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if ( !topicRemoved ) {
                // Devolver resultado
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el tema'
                });
            }

            // Devolver resultado
            return res.status(200).send({
                status: 'success',
                topic: topicRemoved
            });
        });
        
    },
    search: function (req, res) {
        
        // Sacar string a buscar de la url
        var searchString = req.params.search;

        // Find or 
        Topic.find({
            "$or": [
                {"title": {"$regex": searchString, "$options": "i"}},
                {"content": {"$regex": searchString, "$options":"i"}},
                {"code": {"$regex": searchString, "$options":"i"}},
                {"lang": {"$regex": searchString, "$options":"i"}},
            ]
        })
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if ( err ) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if ( !topics ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas disponibles'
                });
            }

            // Devolver resultado
            return res.status(200).send({
                status: 'success',
                topics
            });
        });
    }
}

module.exports = controller;