'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      baja_schema = new Schema({
          sucursal: {
              type: Schema.Types.ObjectId,
              ref:"Sucursal"
          },
          usuario: {
              type: Schema.Types.ObjectId,
              ref:"Usuario"
          },
          producto:{
              type: Schema.Types.ObjectId,
              ref:"Producto"
          },
          categoria:{
              type: Schema.Types.ObjectId,
              ref:"Categoria"
          },
          cantidad: {
              type: Number,
              require: true,
              min:[0,"No puede haber numeros negativos"]
          },
          fecha:{
              type: Date,
              default: Date.now
          }
    }),
    Baja = mongoose.model("Baja",baja_schema)

module.exports = Baja
