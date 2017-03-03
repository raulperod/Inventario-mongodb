var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var posibles_valores = [0,1,2]; // Admin General , Admin Sucursal y Usuario Normal
// lo que contiene al usuario y sus
// validaciones
var usuario_schema = new Schema({
  username: {
    type: String,
    require: true,
    maxlength: [20,"Username muy grande"],
    minlength: [4,"El username es muy corto"]
  },
  password: {
    type: String,
    maxlength: [20,"Password muy grande"],
    minlength: [8,"El password es muy corto"],
    validate: {
      validator: function(p){
        return this.password_confirmation == p
      },
      message: "Las contrasenas no son iguales"
    }
  },
  sucursal: {
    type: Schema.Types.ObjectId,
    ref:"Sucursal"
  },
  permisos:{
    type: Number,
    require: true,
    enum:{
      values: posibles_valores,
      message: "Opcion no valida"
    }
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
  status:{
    type: Boolean,
    require: true,
    default: true
  }
});
// atributo virtual para la validacion, este no se guarda en la base de datos
usuario_schema.virtual("password_confirmation").get(function(){
  return this.p_c;
}).set(function(password){
  this.p_c = password;
});
// exporta al usuario
var Usuario = mongoose.model("Usuario",usuario_schema);
module.exports.Usuario = Usuario;
