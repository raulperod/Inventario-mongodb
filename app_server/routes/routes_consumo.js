var express = require("express");
var Consumo = require("../models/consumo").Consumo;
var Usuario = require("../models/usuario").Usuario;
var Producto = require("../models/producto").Producto;
var Sucursal = require("../models/sucursal").Sucursal;
var Baja = require("../models/baja").Baja;
var router = express.Router();
// mostrar lista de productos de la sucursal del usuario
router.get("/",function(req,res){
  // busca al usuario logeado
  if(res.locals.usuario.permisos == 2){
    // busca los pruductos del almacen donde sean de la sucursal del usuario
    Consumo.find({ })
          .populate("producto sucursal")
          .exec(function(err,consumos){

      if(!err){
        // le mandas los productos del almacen
        res.render("./consumos/manager",{consumos:consumos});
      }else{
        console.log(err);
        res.redirect("/almacen");
      }
    });
  }else{
    // busca los pruductos del almacen donde sean de la sucursal del usuario
    Consumo.find({ sucursal:res.locals.usuario.sucursal })
            .populate("producto sucursal")
            .exec(function(err,consumos){

      if(!err){
        // le mandas los productos del almacen
        res.render("./consumos/manager",{consumos:consumos});
      }else{
        console.log(err);
        res.redirect("/almacen");
      }
    });
  }
});

// para editar un producto en el almacen
router.route("/:idConsumo")
      .put(function(req,res){
        // si no mandaron cambios
        if(parseInt(req.body.cantidad) == 0) res.redirect("/consumos");
        Consumo.findById(req.params.idConsumo,function(err,productoCon){
          if(!err && productoCon){
            res.locals.productoConUpdate = productoCon;
            // si el numero que pusieron es mayor que el que tenian, entonces quedan 0 productos
            if( parseInt(req.body.cantidad) > res.locals.productoConUpdate.cantidad ){
              // genera el registro
              var baja = new Baja({
                sucursal:res.locals.usuario.sucursal,
                usuario:req.session.user_id,
                cantidad:res.locals.productoConUpdate.cantidad,
                producto:productoCon.producto
              });
              res.locals.productoConUpdate.cantidad = 0;
              // guarda al producto en la base de datos
            }else{ // si no, solamente se resta la cantidad que mando

              // genera el registro
              var baja = new Baja({
                sucursal:res.locals.usuario.sucursal,
                usuario:req.session.user_id,
                cantidad:parseInt(req.body.cantidad),
                producto:productoCon.producto
              });
              res.locals.productoConUpdate.cantidad -= parseInt(req.body.cantidad);
            }
            // guarda al producto en la base de datos
            res.locals.productoConUpdate.save(function(err){
              if(err) console.log(err);
            });
            // guarda el registro
            baja.save().then(function(us){
              res.redirect("/consumos");
            }, function(err){ // si ocurre un error lo imprime
              console.log(err);
            });
          }else{
            console.log(err);
            res.redirect("/consumos");
          }
        });
});

module.exports = router;
