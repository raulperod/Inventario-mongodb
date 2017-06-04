'use strict'

const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      tecnica_schema = new Schema({
          sucursal: {
              type: Schema.Types.ObjectId,
              ref:"Sucursal"
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
          }
      }),
      Tecnica = mongoose.model("Tecnica",tecnica_schema)

module.exports = Tecnica;
