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
        if(res.locals.usuario.permisos == 2) res.redirect("/almacen");
        Producto.find({},function(err,productos){ // busca todos los productos
          if(!err){ // si no hubo error
            res.render("./almacen/new",{AlertProducto:false,productos:productos});
          }else{ // si hubo un error
            console.log(err);
            res.redirect("/almacen");
          }
        });
      })
      // Metodo POST
      .post(function(req,res){
        Producto.findOne({nombre:req.body.producto},function(err,producto){ // busca el producto
          if(!err && producto){ // si no hubo error y el producto existe
            Almacen.findOne( {producto:producto._id,"sucursal":res.locals.usuario.sucursal },function(err,productoSucursal){
              if(!err && !productoSucursal){ // si no esta repetido
                // creo el nuevo producto en el almacen
                var almacen = new Almacen({
                  cantidad:parseInt(req.body.cantidad),
                  producto:producto._id,
                  sucursal:res.locals.usuario.sucursal
                });
                // guarda el almacen en la base de datos
                almacen.save().then(function(us){
                  res.redirect("/almacen");
                }, function(err){ // si ocurre un error lo imprime
                  console.log(err);
                  res.redirect("/almacen");
                });
                // guarda el movimiento
                // genera el registro
                // creo la fecha
                var fecha = new Date();
                fecha.setHours(fecha.getHours()-7);

                var registro = new RegistroDeMovimiento({
                  sucursal:res.locals.usuario.sucursal,
                  usuario:req.session.user_id,
                  cantidad:parseInt(req.body.cantidad),
                  producto:producto._id,
                  tipo: 1,
                  fecha: fecha
                });
                fecha = null;
                // guarda el registro
                registro.save().then(function(us){
                  res.redirect("/almacen");
                }, function(err){ // si ocurre un error lo imprime
                  console.log(err);
                });

              }else{ // si paso algo
                if(productoSucursal){ // si el producto ya esta en el almacen
                  Producto.find({},function(err,productos){ // busca todos los productos
                    if(!err){ // si no hubo error
                      res.render("./almacen/new",{AlertProducto:true,productos:productos,nombre:req.body.nombre,cantidad:req.body.cantidad});
                    }else{ // si hubo un error
                      console.log(err);
                      res.redirect("/almacen");
                    }
                  });
                }else{ // si hubo un error
                  console.log(err);
                  res.redirect("/almacen");
                }
              }
            });

          }else{ // si paso un error
            console.log(err);
            res.redirect("/almacen");
          }
        });
});
// gelishtime/almacen/:idAlmacen/add
router.route("/:idAlmacen/add")
      // Metodo GET
      .put(function(req,res){
        // si no mandaron cambios
        if(parseInt(req.body.cantidad) == 0){
          res.send(""); // no mando nada
        }else{
          // si no mandaron 0
          Almacen.findById(req.params.idAlmacen,function(err,productoAlm){ // busco el almacen
            if(!err && productoAlm){ // si no hay error y el almacen existe
              res.locals.productoAlmUpdate = productoAlm;
              res.locals.productoAlmUpdate.cantidad += parseInt(req.body.cantidad);
              // genera el registro
              // creo la fecha
              var fecha = new Date();
              fecha.setHours(fecha.getHours()-7);
              var registro = new RegistroDeMovimiento({
                sucursal:res.locals.usuario.sucursal,
                usuario:req.session.user_id,
                cantidad:parseInt(req.body.cantidad),
                producto:productoAlm.producto,
                tipo: 1,
                fecha: fecha
              });
              fecha = null;
              // guarda al producto en la base de datos
              res.locals.productoAlmUpdate.save(function(err){
                if(err) console.log(err);
              });
              // guarda el registro
              registro.save().then(function(us){
                // mando la nueva cantidad a mostrar
                res.send(""+res.locals.productoAlmUpdate.cantidad);
              }, function(err){ // si ocurre un error lo imprime
                console.log(err);
              });

            }else{
              if(err) console.log(err);
              res.redirect("/almacen");
            }
          });
        }
});
// gelishtime/almacen/:idAlmacen/sub
router.route("/:idAlmacen/sub")
      // Metodo GET
      .put(function(req,res){
        // si no mandaron cambios
        // si no mandaron cambios
        if(parseInt(req.body.cantidad) == 0){
          res.send(""); // no mando nada
        }else{
          Almacen.findById(req.params.idAlmacen,function(err,productoAlm){ // busco el almacen
            if(!err && productoAlm){ // si no hay error y el almacen existe
              res.locals.productoAlmUpdate = productoAlm;
              // si el numero que pusieron es mayor que el que tenian, entonces quedan 0 productos
              if( parseInt(req.body.cantidad) > res.locals.productoAlmUpdate.cantidad ){
                // genera el registro
                // creo la fecha
                var fecha = new Date();
                fecha.setHours(fecha.getHours()-7);
                var registro = new RegistroDeMovimiento({
                  sucursal:res.locals.usuario.sucursal,
                  usuario:req.session.user_id,
                  cantidad:res.locals.productoAlmUpdate.cantidad,
                  producto:productoAlm.producto,
                  tipo: 0,
                  fecha:fecha
                });
                fecha= null;
                Consumo.findOne({producto:productoAlm.producto,sucursal:res.locals.usuario.sucursal},function(err,consumo){ // verifico si hay un consumo
                  if(!err){// si no hay error
                    if(!consumo){ // si no hay consumo de ese producto
                      // entonces lo crea
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
                      // mando la nueva cantidad a mostrar
                      res.send("0");
                    }, function(err){ // si ocurre un error lo imprime
                      console.log(err);
                    });
                  }else{ // si hubo un error
                    console.log(err);
                    res.redirect("/almacen");
                  }
                });
                // guarda al producto en la base de datos
              }else{ // si no, solamente se resta la cantidad que mando

                // genera el registro
                // creo la fecha
                var fecha = new Date();
                fecha.setHours(fecha.getHours()-7);
                var registro = new RegistroDeMovimiento({
                  sucursal:res.locals.usuario.sucursal,
                  usuario:req.session.user_id,
                  cantidad:parseInt(req.body.cantidad),
                  producto:productoAlm.producto,
                  tipo: 0,
                  fecha:fecha
                });
                fecha = null;
                // resta la cantidad
                res.locals.productoAlmUpdate.cantidad -= parseInt(req.body.cantidad);
                Consumo.findOne({producto:productoAlm.producto,sucursal:res.locals.usuario.sucursal},function(err,consumo){
                  if(!err){ // si no hubo error
                    if(!consumo){ // si no habia consumo
                      // entonces lo crea
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
                  }else{ // si hubo un error
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
                  // mando la nueva cantidad a mostrar
                  res.send(""+res.locals.productoAlmUpdate.cantidad);
                }, function(err){ // si ocurre un error lo imprime
                  console.log(err);
                });
              }

            }else{ // si hubo un error
              console.log(err);
              res.redirect("/almacen");
            }
          });
      }
});
module.exports = router;
