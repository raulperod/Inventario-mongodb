'use strict'

const express = require("express"),
      UsuarioController = require('../controllers/usuario'),
      usuario = express.Router()

// gelishtime/users
// Metodo GET
usuario
        .get("/", UsuarioController.usersGet )
// gelishtime/users/new
usuario
        .route("/new")
        // Metodo GET
        .get( UsuarioController.usersNewGet )
        // Metodo POST
        .post( UsuarioController.usersNewPost )
// gelishtime/users/:username
usuario
        .route("/:idUsuario")
        // Metodo GET
        .get( UsuarioController.usersIdUsuarioGet )
        // Metodo PUT
        .put( UsuarioController.usersIdUsuarioPut )

module.exports = usuario;
