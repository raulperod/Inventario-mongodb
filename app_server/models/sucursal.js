'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      sucursal_schema = new Schema({
        plaza: {
          type: String,
          require: true,
          maxlength: [30,"nombre de playa muy grande"]
        },
        ciudad:{
          type: String,
          require: true,
          maxlength: [30,"nombre de ciudad muy grande"]
        }
      }),
      Sucursal = mongoose.model("Sucursal",sucursal_schema)

module.exports = Sucursal
