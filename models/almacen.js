'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      almacen_schema = new Schema({
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
      Almacen = mongoose.model("Almacen",almacen_schema)

module.exports = Almacen
