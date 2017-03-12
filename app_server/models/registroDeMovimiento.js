var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var posibles_valores = [0,1]; // baja y alta
// validaciones
var registro_schema = new Schema({
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
  },
  tecnica:{
    type: Schema.Types.ObjectId,
    ref:"Tecnica"
  }
});

// exporta al usuario
var RegistroDeMovimiento = mongoose.model("RegistroDeMovimiento",registro_schema);

module.exports.RegistroDeMovimiento = RegistroDeMovimiento;
