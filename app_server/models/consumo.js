'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      consumo_schema = new Schema({
        sucursal: {
          type: Schema.Types.ObjectId,
          ref:"Sucursal"
        },
        cantidad: {
          type: Number,
          require: true,
          min:[0,"No puede haber numeros negativos"]
        },
        producto:{
          type: Schema.Types.ObjectId,
          ref:"Producto"
        }
      }),
      Consumo = mongoose.model("Consumo",consumo_schema)

module.exports = Consumo
