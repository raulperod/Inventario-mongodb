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

      })
      // Metodo DELETE
      .delete(function(req,res){

  });

module.exports = router;
