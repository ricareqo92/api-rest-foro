'use strict'

var moment = require('moment');
var secret = 'La llave para encriptar la clave999';
var jwt = require('jwt-simple');

exports.authenticated = function (req, res, next) {
    // Comprobar si llega authentización
    if ( !req.headers.authorization ) {
        return res.status(403).send({
            message: 'La petición no tiene la cabezera de autorización'
        });
    }

    // Limpiar el token y quitar comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        // Decodificar token
        var payload = jwt.decode(token, secret);

        // Comprobar si el token ha expirado
        if ( payload.exp <= moment().unix() ) {
            return res.status(404).send({
                message: 'El token ha expirado'
            });
        }
    }catch(ex){
        return res.status(404).send({
            message: 'El token no es válido'
        });
    }

    // Adjustar usuario identificado a request
    req.user = payload;

    // Pasar a la acción
    next();
}