'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');

var controller = {
    probando: function (req, res) {
        return res.status(200).send({
            message: 'Probando el Controlador'
        });
    },
    testeando: function (req, res) {
        return res.status(200).send({
            message: 'Testeando el Controlador'
        });
    },
    save: function (req, res) {
        // Recoger los parámetros de la petición
        var params = req.body;

        // Validar los datos
        var validate_name = !validator.isEmpty(params.name);
        var validate_surname = !validator.isEmpty(params.surname);
        var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password);

        if ( validate_name && validate_surname && validate_email && validate_password ) {
            // Crear objeto de usuario
            var user = new User();

            // Asignar valores al objeto

            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.password = params.password;
            user.role = 'ROLE_USER';
            user.image = null;

            // Comprobar si el usuario existe
            User.findOne({ email: params.email.toLowerCase()}, (err, issetUser) => {
                if ( err ) {
                    return res.status(400).send({
                        message: "Error al comprobar duplicidad de usuario"
                    });
                }

                if ( !issetUser ) {
                    // Si no existe,
                    

                    // Cifrar la contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        // Y guardar usuarios
                        user.save((err, userStored) => {
                            if ( err ) {
                                return res.status(500).send({
                                    message: "Error al guardar el usuario"
                                });
                            }

                            if ( !userStored ) {
                                return res.status(400).send({
                                    message: "EL usuario no se ha guardado"
                                });
                            }

                            // Devolver respuesta
                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            });
                        });
                    });
                    
                } else {
                    return res.status(200).send({
                        message: "El usuario ya está registrado"
                    });
                }
            });
            
        } else {
            return res.status(200).send({
                message: "Validación de los datos del usuario incorrecta, intentalo de nuevo"
            });
        }
    },
    login: function (req, res) {
        // Recoger los parámetros de la petición
        var params = req.body;

        // Validar los datos
        var validator_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validator_password = !validator.isEmpty(params.password);

        if ( !validator_email || !validator_password ) {
            return res.status(200).send({
                message: "Los datos son incorrectos, envialos bien"
            });
        }
        
        // Buscar usuarios que coincidan con el email
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {

            if ( err ) { 
                return res.status(404).send({
                    message: "ha ocurrido un error"
                });
            }

            if ( !user ) {
                return res.status(404).send({
                    message: "El usuario no se encuentra"
                });
            }

            // Si lo encuentra,
            // Comprobar la contraseñan (coincidencia de email y password / bcrypt)
            bcrypt.compare(params.password, user.password, (err, check) => {
                // Si es correcto,
                if ( check ) {
                    // Generar token de jwt y devolverlo (mas tarde) ***
                    if ( params.gettoken ) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // Limpiar el objecto
                        user.password = undefined;
                        // Devolver los datos
                        return res.status(200).send({
                            status: "success",
                            user
                        });
                    }
                } else {
                    return res.status(200).send({
                        message: "Las credenciales no son correctas"
                    });
                }
            }); 
        });
    },
    update: function (req, res) {
        // Recoger datos del usuario
        var params = req.body;
    
        // Validar datos
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        }catch(err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
        

        // Eliminar propiedades innecesarias
        delete params.password;

        var userId = req.user.sub;

        if ( params.email != req.user.email ) {
            User.findOne({email: params.email}, (err, user) => {
                if ( err ) { 
                    return res.status(404).send({
                        message: "ha ocurrido un error"
                    });
                }
    
                if ( user && user.email == params.email ) {
                    return res.status(404).send({
                        message: "El email no puede ser modificado"
                    });
                } else {
                    // Buscar y actualizar documento
                    User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                        
                        if ( err || !userUpdated ) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar el usuario'
                            });
                        }

                        if ( !userUpdated ) {
                            return res.status(200).send({
                                status: 'error',
                                user: 'No se ha actualizado el usuario'
                            });
                        }
                        // Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userUpdated
                        });
                    });
                }
            });
        } else {
            // Buscar y actualizar documento
            User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                
                if ( err || !userUpdated ) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar el usuario'
                    });
                }

                if ( !userUpdated ) {
                    return res.status(200).send({
                        status: 'error',
                        user: 'No se ha actualizado el usuario'
                    });
                }
                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });
            });
        }
    },
    UploadAvatar: function (req, res) {
        // Configurar el módulo multiparty (md)

        // Recoger el fichero de la petición
        var file_name = 'Avatar no subido...';

        if ( !req.files ) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        // Conseguir el nombre y la extensión del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // ** Advertencia ** En linux o mac
        // var file_split = file_path.split('\');

        // Nombre del archivo
        var file_name = file_split[2];

        // Extensión del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        // Comprobar extensión (solo imagenes)
        if ( file_ext != 'png' && (file_ext != 'jpg') && ( file_ext != 'jpeg' && file_ext != 'gif') ) {
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión del archivo no es válida',
                });
            
            });
        } else {
            // Sacar el id del usuario identificado
            var userId = req.user.sub;

            // Buscar y actualizar documento bd
            User.findOneAndUpdate({_id: userId}, {image: file_name}, {new: true}, (err, userUpdated) => {
                if ( err || !userUpdated ) {
                    // Devolver respuesta
                    return res.status(200).send({
                        status: 'success',
                        message: 'Upload AVATAR',
                        file: file_ext
                    });
                }

                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });
            });
            
        }
        
    },
    avatar: function (req, res) {
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/' + fileName;

        fs.exists(pathFile, (exists) => {
            if ( exists) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    message: 'La imagen no existe'
                });
            }
        });
    },
    getUsers: function (req, res) {
        User.find().exec((err, users) => {
            if ( err || !users ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            }); 
        });
    },
    getUser: function (req, res) {
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if ( err || !user ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            }); 
        })
    }
}

module.exports = controller;