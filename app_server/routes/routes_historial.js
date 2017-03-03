var express = require("express");
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();

router.get("/movimientos",function(req,res){
  if(res.locals.usuario.permisos == 1){
    RegistroDeMovimiento.find({sucursal:res.locals.usuario.sucursal})
                        .populate("usuario producto")
                        .exec(function(err,movimientos){
      if(!err && movimientos){
        res.render("./historial/movimientos",{movimientos:movimientos});
      }else{
        if(err) console.log(err);
        res.redirect("/almacen");
      }
    });
  }else{
    RegistroDeMovimiento.find({})
                        .populate("usuario producto sucursal")
                        .exec(function(err,movimientos){
      if(!err && movimientos){
        res.render("./historial/movimientos",{movimientos:movimientos});
      }else{
        if(err) console.log(err);
        res.redirect("/almacen");
      }
    });
  }
});
router.get("/bajas",function(req,res){
  if(res.locals.usuario.permisos == 1){
    Baja.find({sucursal:res.locals.usuario.sucursal}).populate("usuario producto").exec(function(err,bajas){
      if(!err && bajas){
        res.render("./historial/bajas",{bajas:bajas});
      }else{
        if(err) console.log(err);
        res.redirect("/almacen");
      }
    });
  }else{
    Baja.find({}).populate("usuario producto sucursal").exec(function(err,bajas){
      if(!err && bajas){
        res.render("./historial/bajas",{bajas:bajas});
      }else{
        if(err) console.log(err);
        res.redirect("/almacen");
      }
    });
  }
});

router.get("/estadisticas/general",function(req,res){
  res.render("./historial/estadisticas/general");
});
router.get("/estadisticas/sucursal",function(req,res){
  res.render("./historial/estadisticas/sucursal");
});
module.exports = router;
