var express = require("express");
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();
// gelishtime/movimientos
// Metodo GET
router.get("/movimientos",function(req,res){
  if(res.locals.usuario.permisos == 1){ // si es administrador de sucursales
    // busca los movimientos de la sucursal del administrador
    RegistroDeMovimiento.find({sucursal:res.locals.usuario.sucursal})
                        .populate("usuario producto")
                        .exec(function(err,movimientos){
      if(!err && movimientos){ // si no hay error y hay movimientos
        res.render("./historial/movimientos",{movimientos:movimientos});
      }else{ // si hubo error
        if(err) console.log(err);
        res.redirect("/almacen");
      }
    });
  }else{ // si es administrador general
    // busca los movimientos de todas las sucursales
    RegistroDeMovimiento.find({})
                        .populate("usuario producto sucursal")
                        .exec(function(err,movimientos){
      if(!err && movimientos){ // si no hubo error y hay movimientos
        res.render("./historial/movimientos",{movimientos:movimientos});
      }else{ // si hubo error
        if(err) console.log(err);
        res.redirect("/almacen");
      }
    });
  }
});
// gelishtime/bajas
// Metodo GET
router.get("/bajas",function(req,res){
  if(res.locals.usuario.permisos == 1){ // si es administrador de sucursal
    // busca las bajas de la sucursal
    Baja.find({sucursal:res.locals.usuario.sucursal})
        .populate("usuario producto")
        .exec(function(err,bajas){
      if(!err && bajas){ // si no hubo error y hay bajas
        res.render("./historial/bajas",{bajas:bajas});
      }else{ // si hubo un error
        if(err) console.log(err);
        res.redirect("/almacen");
      }
    });
  }else{ // si es administrador general
    // busca todas las bajas de las sucursales
    Baja.find({}).populate("usuario producto sucursal").exec(function(err,bajas){
      if(!err && bajas){ // si no hay error y existen bajas
        res.render("./historial/bajas",{bajas:bajas});
      }else{ // si hubo un error
        if(err) console.log(err);
        res.redirect("/almacen");
      }
    });
  }
});
// gelishtime/estadisticas/general
// Metodo GET
router.get("/estadisticas/general",function(req,res){
  res.render("./historial/estadisticas/general");
});
// gelishtime/estadisticas/sucursal
// Metodo GET
router.get("/estadisticas/sucursal",function(req,res){
  res.render("./historial/estadisticas/sucursal");
});
module.exports = router;
