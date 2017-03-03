var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// validaciones
var producto_schema = new Schema({
  nombre: {
    type: String,
    require: true,
    maxlength: [50,"nombre de producto muy largo"]
  },
  descripcion: {
    type: String,
    require: true,
    maxlength: [50,"descripcion muy larga"]
  },
  categoria:{
    type: Schema.Types.ObjectId,
    ref:"Categoria"
  },
  codigo:{
    type: String,
    require: true,
    maxlength: [20,"codigo de producto muy largo"]
  }
});

// exporta al usuario
var Producto = mongoose.model("Producto",producto_schema);
module.exports.Producto = Producto;
