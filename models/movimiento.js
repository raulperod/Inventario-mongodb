'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      posibles_valores = [0,1], // baja y alta
      registro_schema = new Schema({
          sucursal: {
              type: Schema.Types.ObjectId,
              ref:"Sucursal"
          },
          usuario: {
              type: Schema.Types.ObjectId,
              ref:"Usuario"
          },
          tecnica:{
              type: Schema.Types.ObjectId,
              ref:"Tecnica"
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
          tipo:{
              type: String,
              require: true,
              enum:{
                  values: posibles_valores,
                  message: "Opcion no valida"
              }
          },
          fecha:{
              type: Date,
              default: Date.now
          }
      }),
      RegistroDeMovimiento = mongoose.model("Movimiento",registro_schema)

module.exports = RegistroDeMovimiento
