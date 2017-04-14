'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      posibles_valores = [0,1,2], // Admin General , Admin Sucursal y Usuario Normal
      usuario_schema = new Schema({
        username: {
          type: String,
          require: true,
          maxlength: [20,"Username muy grande"],
          minlength: [4,"El username es muy corto"]
        },
        password: {
          type: String,
          maxlength: [20,"Password muy grande"],
          minlength: [8,"El password es muy corto"]
        },
        sucursal: {
          type: Schema.Types.ObjectId,
          ref:"Sucursal"
        },
        permisos:{
          type: Number,
          require: true,
          enum:{
            values: posibles_valores,
            message: "Opcion no valida"
          }
        },
        nombre: {
          type: String,
          require: true,
          maxlength: [20,"Nombre muy largo"]
        },
        apellido: {
          type: String,
          require: true,
          maxlength: [20,"Apellido muy largo"]
        },
        status:{
          type: Boolean,
          require: true,
          default: true
        }
      }),
      Usuario = mongoose.model("Usuario",usuario_schema)

module.exports = Usuario
