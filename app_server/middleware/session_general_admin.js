var Usuario = require("../models/usuario").Usuario;

module.exports = function(req,res,next){
  if(!req.session.user_id ){
    res.redirect("/login");
  }else{

    if(res.locals.usuario && res.locals.usuario.permisos == 2){
      next();
    }else{
      Usuario.findById(req.session.user_id).populate("sucursal").exec(function(err,usuario){
        if(!err){
          if(usuario.permisos == 2 ){
            res.locals.usuario = usuario;
            next();
          }else{
            res.redirect("/");
          }
        }else{
          if(err) console.log(err);
          res.redirect("/");
        }
      });
    }

  }
}
