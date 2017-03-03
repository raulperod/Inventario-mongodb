var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// validaciones
var categoria_schema = new Schema({
  nombre: {
    type: String,
    require: true,
    maxlength: [50,"nombre de categoria muy largo"]
  },
  descripcion:{
    type: String,
    require: true,
    maxlength: [50,"descripcion de categoria muy grande"]
  }
});
// at
// exporta al usuario
var Categoria = mongoose.model("Categoria",categoria_schema);
module.exports.Categoria = Categoria;
