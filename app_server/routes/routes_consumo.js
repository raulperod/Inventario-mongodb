var express = require("express");
var Consumo = require("../models/consumo").Consumo;
var Usuario = require("../models/usuario").Usuario;
var Producto = require("../models/producto").Producto;
var Sucursal = require("../models/sucursal").Sucursal;
var Baja = require("../models/baja").Baja;
var router = express.Router();
// gelishtime/consumos
router.get("/",function(req,res){
  if(res.locals.usuario.permisos == 2){ // si es administrador general
    // busca los productos en consumo de todas las sucursales
    Consumo.find({ })
          .populate("producto sucursal")
          .exec(function(err,consumos){

      if(!err && consumos){ // si no hay error
        // le mandas los productos del almacen
        res.render("./consumos/manager",{consumos:consumos});
      }else{ // si hubo error
        console.log(err);
        res.redirect("/almacen");
      }
    });
  }else{ // si es administrador de sucursal o recepcionista
    // busca los pruductos en consumo donde sean de la sucursal del usuario
    Consumo.find({ sucursal:res.locals.usuario.sucursal })
            .populate("producto sucursal")
            .exec(function(err,consumos){

      if(!err && consumos){ // si no hubo error
        // le mandas los productos del almacen
        res.render("./consumos/manager",{consumos:consumos});
      }else{ // si hubo error
        console.log(err);
        res.redirect("/almacen");
      }
    });
  }
});
// gelishtime/consumos/:idConsumo
router.route("/:idConsumo")
      .put(function(req,res){
        // si no mandaron cambios, redirecciona a consumo
        if(parseInt(req.body.cantidad) == 0){
          res.send("");
        }else{
          // busca el producto que cambiaron
          Consumo.findById(req.params.idConsumo,function(err,productoCon){
            if(!err && productoCon){ // si no hay error y el producto existe
              res.locals.productoConUpdate = productoCon;
              // si el numero que pusieron es mayor que el que tenian, entonces quedan 0 productos
              if( parseInt(req.body.cantidad) > res.locals.productoConUpdate.cantidad ){
                // genera la baja
                // creo la fecha
                var fecha = new Date();
                fecha.setHours(fecha.getHours()-7);
                var baja = new Baja({
                  sucursal:res.locals.usuario.sucursal,
                  usuario:req.session.user_id,
                  cantidad:res.locals.productoConUpdate.cantidad,
                  producto:productoCon.producto,
                  fecha:fecha
                });
                fecha= null;
                res.locals.productoConUpdate.cantidad = 0;
                // guarda al producto en la base de datos
              }else{ // si no, solamente se resta la cantidad que mando
                // genera el registro
                // creo la fecha
                var fecha = new Date();
                fecha.setHours(fecha.getHours()-7);
                var baja = new Baja({
                  sucursal:res.locals.usuario.sucursal,
                  usuario:req.session.user_id,
                  cantidad:parseInt(req.body.cantidad),
                  producto:productoCon.producto,
                  fecha:fecha
                });
                fecha= null;
                // se le resta la cantidad
                res.locals.productoConUpdate.cantidad -= parseInt(req.body.cantidad);
              }
              // actualiza el producto en consumo
              res.locals.productoConUpdate.save(function(err){
                if(err) console.log(err);
              });
              // guarda la baja
              baja.save().then(function(us){
                res.send(""+res.locals.productoConUpdate.cantidad);
              }, function(err){ // si ocurre un error lo imprime
                console.log(err);
              });
            }else{ // si hubo un error
              console.log(err);
              res.redirect("/consumos");
            }
          });
        }
});

module.exports = router;
