'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      producto_schema = new Schema({
        nombre: {
          type: String,
          require: true,
          maxlength: [50,"nombre de producto muy largo"]
        },
        descripcion: {
          type: String,
          require: true,
          maxlength: [50,"descripcion muy larga"]
        },
        categoria:{
          type: Schema.Types.ObjectId,
          ref:"Categoria"
        },
        codigo:{
          type: String,
          require: true,
          maxlength: [20,"codigo de producto muy largo"]
        },
        minimo:{
          type:Number,
          require:true,
          min:[0,"El minimo no puede ser cero"]
        },
        esBasico:{
          type: Boolean
        }
      }),
      Producto = mongoose.model("Producto",producto_schema)

module.exports = Producto
