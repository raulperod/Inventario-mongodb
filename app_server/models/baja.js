var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// validaciones
var baja_schema = new Schema({
  sucursal: {
    type: Schema.Types.ObjectId,
    ref:"Sucursal"
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref:"Usuario"
  },
  cantidad: {
    type: Number,
    require: true,
    min:[0,"No puede haber numeros negativos"]
  },
  producto:{
    type: Schema.Types.ObjectId,
    ref:"Producto"
  },
  fecha:{
        type: Date,
        default: Date.now
  },
  tecnica:{
    type: Schema.Types.ObjectId,
    ref:"Tecnica"
  }
});

// exporta al usuario
var Baja = mongoose.model("Baja",baja_schema);

module.exports.Baja = Baja;
