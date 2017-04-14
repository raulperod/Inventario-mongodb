'use strict'

const express = require("express"),
      TecnicaController = require('../controllers/tecnica'),
      tecnica = express.Router()

// gelishtime/tecnicas
// Metodo GET
tecnica
        .get("/", TecnicaController.tecnicasGet )
// gelishtime/tecnicas/new
tecnica
        .route("/new")
        // Metodo GET
        .get( TecnicaController.tecnicasNewGet )
        // Metodo POST
        .post( TecnicaController.tecnicasNewPost )
// gelishtime/tecnicas/:idTecnica
tecnica
        .route("/:idTecnica")
        // Metodo GET
        .get( TecnicaController.tecnicasIdTecnicaGet )
        // Metodo PUT
        .put( TecnicaController.tecnicasIdTecnicaPut )

module.exports = tecnica;
