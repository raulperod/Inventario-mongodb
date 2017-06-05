'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      basico_schema = new Schema({
          sucursal: {
              type: Schema.Types.ObjectId,
              ref:"Sucursal"
          },
          tecnica:{
              type: Schema.Types.ObjectId,
              ref:"Tecnica"
          },
          producto:{
              type: Schema.Types.ObjectId,
              ref:"Producto"
          },
          enUso: {
              type: Boolean,
              require: true
          }
      }),
      Basico = mongoose.model("Basico",basico_schema)

module.exports = Basico;
