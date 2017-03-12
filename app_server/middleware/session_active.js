var Usuario = require("../models/usuario").Usuario;

module.exports = function(req,res,next){
  if(!req.session.user_id ){
    res.redirect("/login");
  }else{

    if(res.locals.usuario){ // si el usuario todabia esta
      next();
    }else{
      Usuario.findById(req.session.user_id,function(err,usuario){
        if(!err && usuario){
          res.locals.usuario = usuario;
          next();
        }else{
          if(err) console.log(err);
          res.redirect("/almacen");
        }
      });
    }

  }
}
