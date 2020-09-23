'use strict';

var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
    add: function (req, res) {

        // Recoger id de comentario por Url
        var commentId = req.params.commentId;
        var topicId = req.params.topicId;

        Topic.findById(topicId)
            .exec((err, topic) => {
                if ( err ) {
                    return res.status(500).send({
                        'status': 'error',
                        'message': 'Error en la petición'
                    });
                }

                if ( !topic ) {
                    return res.status(404).send({
                        'status': 'error',
                        'message': 'No existe el topic'
                    });
                }

                if ( req.body.value ) {
                    // Recoger parámetros
                    var params = req.body;
    
                    // Validar datos
                    try{
                        var validate_value = !validator.isEmpty(params.value);
                    }catch(err) {
                        return res.status(200).send({
                            message: 'No has valorado nada !!'
                        });
                    }
    
                    if ( validate_value ) {
                        var rating = {
                            user: req.user.sub,
                            value: req.body.value
                        };
    
                        // Seleccionar el subdocumento (comentario)
                        var comment = topic.comments.id(commentId);
                        var user = comment.ratings.id(req.user.sub);

                        comment.ratings.push(rating);
                        
                        // Guardar el topic completo
                        topic.save((err) => {
                            if ( err ) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error en la petición'
                                });
                            }
                            
                            // Delvover un resultado
                            Topic.findById(topic._id)
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
                        
    
                        });
                    }else {
                        return res.status(200).send({
                            message: 'No se han validado los datos de la valoración !!'
                        }); 
                    }
                }else {
                    return res.status(500).send({
                        message: 'No se ha enviado ninguna información'
                    }); 
                }
            });
    },
    usersByRating: function (req, res) {
        // Obtener parámetros enviados por Url
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        Topic.findById(topicId)
            .populate('comments.ratings.user')
            .exec((err, topic) => {
                if ( err ) {
                    return res.status(500).send({
                        'message': 'Hubo un error'
                    });
                }

                if ( !topic ) {
                    return res.status(404).send({
                        'message': 'No existe el topic'
                    });
                }

                var comment = topic.comments.id(commentId);
                var users = [];

                comment.ratings.forEach((rating) => {
                    users.push(rating.user);
                });

                return res.status(200).send({
                    'data': users
                });
            })
    }
}

module.exports = controller;