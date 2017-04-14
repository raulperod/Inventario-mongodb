/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const mongoose = require("mongoose"),
      config = require('./config')
// conectar a la base de datos
mongoose.Promise = global.Promise
mongoose.connect(config.MONGODB_URL)

module.exports = {
    conneccion : mongoose
}