'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      almacen_schema = new Schema({
          sucursal: {
              type: Schema.Types.ObjectId,
              ref:"Sucursal"
          },
          producto:{
              type: Schema.Types.ObjectId,
              ref:"Producto"
          },
          categoria:{
              type: Schema.Types.ObjectId,
              ref:"Categoria"
          },
          cantidadAlmacen: {
              type: Number,
              require: true,
              min:[0,"No puede haber numeros negativos"],
              default: 0
          },
          cantidadConsumo: {
              type: Number,
              require: true,
              min:[0,"No puede haber numeros negativos"],
              default: 0
          }
      }),
      Almacen = mongoose.model("Almacen",almacen_schema,"almacenes")

module.exports = Almacen
