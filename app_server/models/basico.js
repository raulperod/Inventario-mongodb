var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// validaciones
var basico_schema = new Schema({
  sucursal: {
    type: Schema.Types.ObjectId,
    ref:"Sucursal"
  },
  tecnica:{
    type: Schema.Types.ObjectId,
    ref:"Tecnica"
  }
  producto:{
    type: Schema.Types.ObjectId,
    ref:"Producto"
  },
  cantidad: {
    type: Number,
    require: true,
    min:[0,"No puede haber numeros negativos"]
  },

});

// exporta al usuario
var Basico = mongoose.model("Basico",basico_schema);

module.exports.Basico = Basico;
