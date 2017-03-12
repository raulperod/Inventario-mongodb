var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// lo que contiene al usuario y sus
// validaciones
var tecnica_schema = new Schema({
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
  },
  nombreCompleto:{
    type: String,
    require: true,
    maxlength: [45,"nombre completo muy largo"]
  }
});

// exporta al usuario
var Tecnica = mongoose.model("Tecnica",tecnica_schema);
module.exports.Tecnica = Tecnica;
