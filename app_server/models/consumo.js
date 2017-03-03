var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// validaciones
var consumo_schema = new Schema({
  sucursal: {
    type: Schema.Types.ObjectId,
    ref:"Sucursal"
  },
  cantidad: {
    type: Number,
    require: true,
    min:[0,"No puede haber numeros negativos"]
  },
  producto:{
    type: Schema.Types.ObjectId,
    ref:"Producto"
  }
});

// exporta al usuario
var Consumo = mongoose.model("Consumo",consumo_schema);

module.exports.Consumo = Consumo;
