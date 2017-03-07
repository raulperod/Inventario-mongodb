var express = require("express");
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var Usuario = require("../models/usuario").Usuario;
var Producto = require("../models/producto").Producto;
var Sucursal = require("../models/sucursal").Sucursal;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var router = express.Router();
// gelishtime/almacen
router.get("/",function(req,res){
  if(res.locals.usuario.permisos == 2){ // si es administrador general
    // busca todos pruductos del almacen de todas las sucursales
    Almacen.find({ })
          .populate("producto sucursal")
          .exec(function(err,almacen){

      if(!err){ // si no hubo error
        // le mandas los productos del almacen
        res.render("./almacen/manager",{almacen:almacen});
      }else{ // si hubo error
        console.log(err);
        res.redirect("/almacen");
      }
    });
  }else{ // si es administrador de sucursal o recepcionista
    // busca los pruductos del almacen donde sea de la sucursal del usuario
    Almacen.find({ sucursal:res.locals.usuario.sucursal })
            .populate("producto sucursal")
            .exec(function(err,almacen){

      if(!err){ // si no hubo error
        // le mandas los productos del almacen
        res.render("./almacen/manager",{almacen:almacen});
      }else{ // si hubo error
        console.log(err);
        res.redirect("/almacen");
      }
    });
  }
});
// gelishtime/new
router.route("/new")
      // Metodo GET
      .get(function(req,res){
        // si entra el admin general lo redirecciona, no debe estar aqui
        if(res.locals.usuario.permisos == 2) res.redirect("/almacen")
        Producto.find({},function(err,productos){ // busca todos los productos
          if(!err){ // si no hubo error
            res.render("./almacen/new",{AlertProducto:false,productos:productos});
          }else{ // si hubo un error
            console.log(err);
            res.redirect("/almacen");
          }
        });
      })
      //
      .post(function(req,res){
        // busca al usuario logeado
        // si no hay producto repetido, entonces crea uno nuevo
        Producto.findOne({nombre:req.body.producto},function(err,producto){
          if(!err && producto){
            Almacen.findOne( {producto:producto._id,"sucursal":res.locals.usuario.sucursal },function(err,productoSucursal){
              if(!err && !productoSucursal){ // si no esta repetido
                var almacen = new Almacen({
                  cantidad:parseInt(req.body.cantidad),
                  producto:producto._id,
                  sucursal:res.locals.usuario.sucursal
                });
                // guarda al usuario en la base de datos
                almacen.save().then(function(us){
                  res.redirect("/almacen");
                }, function(err){ // si ocurre un error lo imprime
                  console.log(err);
                  res.redirect("/almacen");
                });
                // guarda el movimiento
                // genera el registro
                var registro = new RegistroDeMovimiento({
                  sucursal:res.locals.usuario.sucursal,
                  usuario:req.session.user_id,
                  cantidad:parseInt(req.body.cantidad),
                  producto:producto._id,
                  tipo: 1
                });
                // guarda el registro
                registro.save().then(function(us){
                  res.redirect("/almacen");
                }, function(err){ // si ocurre un error lo imprime
                  console.log(err);
                });

              }else{
                console.log(err);
                res.redirect("/almacen");
              }
            });

          }else{
            console.log(err);
            res.redirect("/almacen");
          }
        });


});
// para editar un producto en el almacen
router.route("/:idAlmacen")
      .put(function(req,res){
        // si no mandaron cambios
        if(parseInt(req.body.cantidad) == 0) res.redirect("/almacen");

        Almacen.findById(req.params.idAlmacen,function(err,productoAlm){
          if(!err && productoAlm){
            res.locals.productoAlmUpdate = productoAlm;
            // se restan al producto
            if(typeof req.body.botton1 == "undefined"){
              // si el numero que pusieron es mayor que el que tenian, entonces quedan 0 productos
              if( parseInt(req.body.cantidad) > res.locals.productoAlmUpdate.cantidad ){
                // genera el registro
                var registro = new RegistroDeMovimiento({
                  sucursal:res.locals.usuario.sucursal,
                  usuario:req.session.user_id,
                  cantidad:res.locals.productoAlmUpdate.cantidad,
                  producto:productoAlm.producto,
                  tipo: 0
                });
                Consumo.findOne({producto:productoAlm.producto,sucursal:res.locals.usuario.sucursal},function(err,consumo){
                  if(!err){
                    if(!consumo){
                      // si habia consumo, entonces lo crea
                      var consumo = new Consumo({
                        sucursal:res.locals.usuario.sucursal,
                        cantidad:res.locals.productoAlmUpdate.cantidad,
                        producto:productoAlm.producto
                      });
                      res.locals.productoAlmUpdate.cantidad = 0;
                      consumo.save().then(function(us){
                      }, function(err){ // si ocurre un error lo imprime
                        console.log(err);
                      });

                    }else{ // si ya habia uno, aumenta su cantidad
                      res.locals.consumo = consumo;
                      res.locals.consumo.cantidad += res.locals.productoAlmUpdate.cantidad;
                      res.locals.consumo.save(function(err){
                        if(err) console.log(err);
                      });
                      res.locals.productoAlmUpdate.cantidad = 0;
                    }
                    // guarda al producto en la base de datos
                    res.locals.productoAlmUpdate.save(function(err){
                      if(err) console.log(err);
                    });
                    // guarda el registro
                    registro.save().then(function(us){
                      res.redirect("/almacen");
                    }, function(err){ // si ocurre un error lo imprime
                      console.log(err);
                    });
                  }else{
                    console.log(err);
                    res.redirect("/almacen");
                  }
                });
                // guarda al producto en la base de datos
              }else{ // si no, solamente se resta la cantidad que mando

                // genera el registro
                var registro = new RegistroDeMovimiento({
                  sucursal:res.locals.usuario.sucursal,
                  usuario:req.session.user_id,
                  cantidad:parseInt(req.body.cantidad),
                  producto:productoAlm.producto,
                  tipo: 0
                });
                res.locals.productoAlmUpdate.cantidad -= parseInt(req.body.cantidad);
                Consumo.findOne({producto:productoAlm.producto,sucursal:res.locals.usuario.sucursal},function(err,consumo){
                  if(!err){
                    if(!consumo){
                      // si habia consumo, entonces lo crea
                      var consumo = new Consumo({
                        sucursal:res.locals.usuario.sucursal,
                        cantidad:parseInt(req.body.cantidad),
                        producto:productoAlm.producto
                      });
                      consumo.save().then(function(us){
                      }, function(err){ // si ocurre un error lo imprime
                        console.log(err);
                      });

                    }else{ // si ya habia uno, aumenta su cantidad
                      res.locals.consumo = consumo;
                      res.locals.consumo.cantidad += parseInt(req.body.cantidad);
                      res.locals.consumo.save(function(err){
                        if(err) console.log(err);
                      });
                    }

                  }else{
                    console.log(err);
                    res.redirect("/almacen");
                  }
                });
                // guarda al producto en la base de datos
                res.locals.productoAlmUpdate.save(function(err){
                  if(err) console.log(err);
                });
                // guarda el registro
                registro.save().then(function(us){
                  res.redirect("/almacen");
                }, function(err){ // si ocurre un error lo imprime
                  console.log(err);
                });

              }

            }else{ // se agregan al producto
              res.locals.productoAlmUpdate.cantidad += parseInt(req.body.cantidad);
              // genera el registro
              var registro = new RegistroDeMovimiento({
                sucursal:res.locals.usuario.sucursal,
                usuario:req.session.user_id,
                cantidad:parseInt(req.body.cantidad),
                producto:productoAlm.producto,
                tipo: 1
              });
              // guarda al producto en la base de datos
              res.locals.productoAlmUpdate.save(function(err){
                if(err) console.log(err);
              });
              // guarda el registro
              registro.save().then(function(us){
                res.redirect("/almacen");
              }, function(err){ // si ocurre un error lo imprime
                console.log(err);
              });
            }


          }else{
            console.log(err);
            res.redirect("/almacen");
          }
        });
});

module.exports = router;
