var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// validaciones
var almacen_schema = new Schema({
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
var Almacen = mongoose.model("Almacen",almacen_schema);

module.exports.Almacen = Almacen;
