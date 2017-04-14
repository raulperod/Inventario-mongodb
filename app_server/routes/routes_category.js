'use strict'

const express = require("express"),
      CategoryController = require('../controllers/categoria'),
      category = express.Router()
// gelishtime/categories
category
        .get("/", CategoryController.categoriesGet )
// gelishtime/categories/new
category
        .route("/new")
        // Metodo GET
        .get( CategoryController.categoriesNewGet )
        // Metodo POST
        .post( CategoryController.categoriesNewPost )
// gelishtime/categories/:idCategoria
category
        .route("/:idCategoria")
        .get( CategoryController.categoriesIdCategoryGet )
        .put( CategoryController.categoriesIdCategoryPut )
        // Metodo DELETE
        .delete( CategoryController.categoriesIdCategoryDelete )

module.exports = category