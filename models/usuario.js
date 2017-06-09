'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      usuario_schema = new Schema({
          username: {
              type: String,
              require: true,
              maxlength: [20,"Username muy grande"],
              unique: true,
              trim: true
          },
          password: {
              type: String,
              require: true,
              maxlength: [20,"Password muy grande"],
              trim: true
          },
          sucursal: {
              type: Schema.Types.ObjectId,
              ref:"Sucursal"
          },
          permisos:{
              type: Number,
              require: true,
              enum:{
                  values: [0,1,2], // Admin General , Admin Sucursal y Usuario Normal,
                  message: "Opcion no valida"
              }
          },
          nombre: {
              type: String,
              require: true,
              maxlength: [50,"Nombre muy largo"],
              trim: true
          },
          apellido: {
              type: String,
              require: true,
              maxlength: [50,"Apellido muy largo"],
              trim: true
          },
          status:{
              type: Boolean,
              require: true,
              default: true
          }
      }),
      Usuario = mongoose.model("Usuario",usuario_schema)

module.exports = Usuario
