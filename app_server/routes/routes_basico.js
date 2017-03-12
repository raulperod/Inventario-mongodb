var express = require("express");
var Producto = require("../models/producto").Producto;
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var Tecnica = require("../models/tecnica").Tecnica;
var router = express.Router();

// gelishtime/basicos
router.route("/")
      .get(function(req,res){
        // busco las tecnicas de la sucursal del usuario
        Tecnica.find({sucursal:res.locals.usuario.sucursal},{nombreCompleto:1}).exec(function(err,tecnicas){
          if(!err && tecnicas){ // si no hubo error y existen tecnicas
            // busca los productos basicos de la sucursal
            Producto.find({esBasico:true},{nombre:1}).exec(function(err,productos){
              if(!err && productos){ // si no hubo error y existen productos
                res.render("./basicos/manager",{tecnicas:tecnicas,productos:productos});
              }else{ // si hubo un error
                if(err) console.log(err); // imprime el error
                res.redirect("/producto/new");
              }
            });
          }else{ // si paso algun error
            if(err) console.log(err); // imprime el error si hubo
            res.redirect("/tecnicas/new");
          }
        });
      })
      .put(function(req,res){
        // pasar a consumo un producto basico
        // busco el producto a asignar
        Producto.findOne({nombre:req.body.producto},{_id:1}).exec(function(err,producto){
          if(!err && producto){ // si no hubo error y el producto existe
            // verifico si almenos hay un producto en el almacen
            Almacen.findOne({producto:producto._id,sucursal:res.locals.usuario.sucursal}).exec(function(err,productoAlm){
              if(!err && productoAlm){ // si no hubo error y el producto existe
                if(productoAlm.cantidad > 1){ // si hay mas de un producto en el almacen
                  // busco a la tecnica para asignarle el producto
                  Tecnica.findOne({nombreCompleto:nombre:req.body.tecnica}).exec(function(err,tecnica){
                    if(!err && tecnica){ // si no hubo error y la tecnica existe
                      // le resto un producto al almacen
                      //--------------------------------
                      // le sumo uno al consumo del producto
                      //------------------------------------
                      // creo un registro del movimiento
                      //--------------------------------
                    }else{ // si hubo un error
                      if(err) console.log(err);
                      res.redirect("/tecnicas/new");
                    }
                  });
                }else{ // si no hay producto en el almacen
                  res.redirect("/almacen");
                }
              }else{ // si hubo error o el producto no existe
                if(err) console.log(err);
                res.redirect("/almacen/new");
              }
            });

          }else{ // si hubo error
            if(err) console.log(err);
            res.redirect("/products/new");
          }
        });















      })
      // Metodo DELETE
      .delete(function(req,res){
        // dar de baja un producto basico
  });

module.exports = router;
