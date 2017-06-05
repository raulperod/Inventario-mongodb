'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      producto_schema = new Schema({
          nombre: {
              type: String,
              require: true,
              maxlength: [50,"nombre de producto muy largo"],
              unique: true,
              trim: true
          },
          descripcion: {
              type: String,
              require: true,
              maxlength: [50,"descripcion muy larga"],
              trim: true
          },
          categoria:{
              type: Schema.Types.ObjectId,
              ref:"Categoria"
          },
          codigo:{
              type: String,
              require: true,
              maxlength: [20,"codigo de producto muy largo"],
              unique: true,
              trim: true
          },
          minimo:{
              type:Number,
              require:true,
              min:[0,"El minimo no puede ser cero"]
          },
          esBasico:{
              type: Boolean,
              require: true
          }
      }),
      Producto = mongoose.model("Producto",producto_schema)

module.exports = Producto
