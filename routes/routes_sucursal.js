'use strict'

const express = require('express'),
      SucursalController = require('../controllers/sucursal'),
      sucursal = express.Router()

sucursal
        .get('/', SucursalController.sucursalesGet )

sucursal
        .route('/new')
        .get( SucursalController.sucursalesNewGet )
        .post( SucursalController.sucursalesNewPost )

sucursal
        .route('/:idSucursal')
        .get( SucursalController.sucursalesIdSucursalGet )
        .put( SucursalController.sucursalesIdSucursalPut )
        .delete( SucursalController.sucursalesIdSucursalDelete )

module.exports = sucursal
