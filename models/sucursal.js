'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      sucursal_schema = new Schema({
          plaza: {
              type: String,
              require: true,
              maxlength: [30,"Nombre de playa muy grande"],
              unique: true,
              trim: true
          },
          ciudad:{
              type: String,
              require: true,
              maxlength: [30,"Nombre de ciudad muy grande"],
              trim: true
          }
      }),
      Sucursal = mongoose.model("Sucursal", sucursal_schema, "sucursales")

module.exports = Sucursal
