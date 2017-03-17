var express = require("express");
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var Tecnica = require("../models/tecnica").Tecnica;
var Producto = require("../models/producto").Producto;
var Sucursal = require("../models/tecnica").Sucursal;
var router = express.Router();
// gelishtime/movimientos
// Metodo GET
router.get("/movimientos",function(req,res){
  if(res.locals.usuario.permisos == 1){ // si es administrador de sucursales
    // busca los movimientos de la sucursal del administrador
    RegistroDeMovimiento.find({sucursal:res.locals.usuario.sucursal})
                        .populate("usuario producto tecnica")
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
                        .populate("usuario producto sucursal tecnica")
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
        .populate("usuario producto tecnica")
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
  // mandar bajas de productos basicos y no basicos
  // primero busco las bajas de los productos basicos
  Baja.find({tecnica: { "$exists" : true }},{_id:0,sucursal:1,producto:1,tecnica:1,cantidad:1,fecha:1}).populate("sucursal producto tecnica").exec(function(err,bajasBasicos){
    if(!err && bajasBasicos){ // si no hubo error y hay bajas
      Baja.find({tecnica: { "$exists" : false }},{_id:0,sucursal:1,producto:1,cantidad:1,fecha:1}).populate("sucursal producto").exec(function(err,bajasProductos){
        if(!err && bajasProductos){ // si no hubo error y hay bajas
          // busco todas las tecnicas
          Tecnica.find({},{_id:0,nombreCompleto:1,sucursal:1}).populate("sucursal").exec(function(err,tecnicas){
            if(!err && tecnicas){ // si no hubo error y hay tecnicas
              // busco los productos basicos
              Producto.find({esBasico:true},{_id:0,nombre:1}).exec(function(err,basicos){
                if(!err && basicos){ // si no hubo error y hay basicos
                  // busco los productos no basicos
                  Producto.find({esBasico:false},{_id:0,nombre:1}).exec(function(err,productos){
                    if(!err && productos){ // si no hubo error y hay productos
                      // busco las sucursales
                      Sucursal.find({},{_id:0,plaza:1}).exec(function(err,sucursales){
                        if(!err && sucursales){ // si no hubo error y hay sucursales
                          res.render("./historial/estadisticas/general",{bajasProductos:bajasProductos,bajasBasicos:bajasBasicos,tecnicas:tecnicas,basicos:basicos,productos:productos,sucursales:sucursales});
                        }else{ // si paso algo
                          if(err) console.log(err);
                          res.redirect("/almacen");
                        }
                      });
                    }else{ // si paso algo
                      if(err) console.log(err);
                      res.redirect("/almacen");
                    }
                  });
                }else{ // si paso algo
                  if(err) console.log(err);
                  res.redirect("/almacen");
                }
              });
            }else{ // si paso un error
              if(err) console.log(err);
              res.redirect("/almacen");
            }
          });
        }else{ // si hubo error
          if(err) console.log(err);
          res.redirect("/almacen");
        }
      });
    }else{ // si hubo error
      if(err) console.log(err);
      res.redirect("/almacen");
    }
  });
});
// gelishtime/estadisticas/sucursal
// Metodo GET
router.get("/estadisticas/sucursal",function(req,res){
  // mandar bajas de productos basicos y no basicos
  // primero busco las bajas de los productos basicos
  Baja.find({sucursal:res.locals.usuario.sucursal,tecnica: { "$exists" : true }},{_id:0,producto:1,tecnica:1,cantidad:1,fecha:1}).populate("producto tecnica").exec(function(err,bajasBasicos){
    if(!err && bajasBasicos){ // si no hubo error y hay bajas
      Baja.find({sucursal:res.locals.usuario.sucursal,tecnica: { "$exists" : false }},{_id:0,producto:1,cantidad:1,fecha:1}).populate("producto").exec(function(err,bajasProductos){
        if(!err && bajasProductos){ // si no hubo error y hay bajas
          // busco todas las tecnicas
          Tecnica.find({sucursal:res.locals.usuario.sucursal},{_id:0,nombreCompleto:1}).exec(function(err,tecnicas){
            if(!err && tecnicas){ // si no hubo error y hay tecnicas
              // busco los productos basicos
              Producto.find({esBasico:true},{_id:0,nombre:1}).exec(function(err,basicos){
                if(!err && basicos){ // si no hubo error y hay basicos
                  // busco los productos no basicos
                  Producto.find({esBasico:false},{_id:0,nombre:1}).exec(function(err,productos){
                    if(!err && productos){ // si no hubo error y hay productos
                      res.render("./historial/estadisticas/sucursal",{bajasProductos:bajasProductos,bajasBasicos:bajasBasicos,tecnicas:tecnicas,basicos:basicos,productos:productos});
                    }else{ // si paso algo
                      if(err) console.log(err);
                      res.redirect("/almacen");
                    }
                  });
                }else{ // si paso algo
                  if(err) console.log(err);
                  res.redirect("/almacen");
                }
              });
            }else{ // si paso un error
              if(err) console.log(err);
              res.redirect("/almacen");
            }
          });
        }else{ // si hubo error
          if(err) console.log(err);
          res.redirect("/almacen");
        }
      });
    }else{ // si hubo error
      if(err) console.log(err);
      res.redirect("/almacen");
    }
  });
});
module.exports = router;
