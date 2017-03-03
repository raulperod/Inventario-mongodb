var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// validaciones
var sucursal_schema = new Schema({
  plaza: {
    type: String,
    require: true,
    maxlength: [30,"nombre de playa muy grande"]
  },
  ciudad:{
    type: String,
    require: true,
    maxlength: [30,"nombre de ciudad muy grande"]
  }
});
// at
// exporta al usuario
var Sucursal = mongoose.model("Sucursal",sucursal_schema);
module.exports.Sucursal = Sucursal;
