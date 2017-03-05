var express = require("express");
var Sucursal = require("../models/sucursal").Sucursal;
var Usuario = require("../models/usuario").Usuario;
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();

// gelishtime/sucursales
// Metodo GET
router.get("/",function(req,res){
    // busca todas las sucursales de la base de datos
    Sucursal.find({}).exec(function(err,sucursales){
      if(!err){ // si no hubo error
        res.render("./sucursales/manager",{sucursales:sucursales});
      }else{ // si hubo error
        console.log(err); // imprimo el error
        res.redirect("/almacen"); // redirecciono al inicio
      }
    });
});
// gelishtime/sucursales/new
router.route("/new")
      // Metodo GET
      .get(function(req,res){
          res.render("./sucursales/new",{alertSucursal:false});
      })
      // Metodo POST
      .post(function(req,res){
        // validar que la sucursal no este repetida
        Sucursal.findOne({plaza:req.body.plaza,ciudad:req.body.ciudad}).exec(function(err,sucursal){
          if(!err && !sucursal){ // si no hay error y no hay sucursal repetida
            // crea una sucursal nueva con sus respectivos atributos
            var sucursal = new Sucursal({
              plaza: req.body.plaza,
              ciudad: req.body.ciudad
            });
            // guarda la sucursal en la base de datos
            sucursal.save().then(function(us){
              res.redirect("/sucursales");
            }, function(err){ // si ocurre un error lo imprime
              console.log(err);
            });
          }else{ // si hubo un error
            if(sucursal){ // si la sucursal ya existe
              res.render("./sucursales/new",{alertSucursal:true,plaza:req.body.plaza,ciudad:req.body.ciudad});
            }else{ // si hubo un error
              console.log(err);
              res.redirect("/sucursales/new");
            }
          }
        });
      });
// gelishtime/sucursales/:idSucursal
router.route("/:idSucursal")
      .get(function(req,res){
        // busco la sucursal
        Sucursal.findById(req.params.idSucursal).exec(function(err,sucursal){
          if(!err && sucursal){ // si no hubo error y la sucursal existe
            res.render("./sucursales/update",{sucursalUpdate:sucursal,alertSucursal:false});
          }else{
            // imprimo el error y lo redirecciono al administrador de sucursales
            if(err) console.log(err);
            res.redirect("/sucursales");
          }
        });
      })
      .put(function(req,res){
        // busco la sucursal
        Sucursal.findById(req.params.idSucursal).exec(function(err,sucursal){
          if(!err && sucursal){ // si no hay error y la sucursal a editar existe
            Sucursal.findOne({plaza:req.body.plaza,ciudad:req.body.ciudad}).exec(function(err,sucursalC){
              if(!err && !sucursalC){ // si no hay error y no existe una sucursal con los mismos campos
                // edito la sucursal
                res.locals.sucursalUpdate = sucursal;
                res.locals.sucursalUpdate.plaza = req.body.plaza;
                res.locals.sucursalUpdate.ciudad = req.body.ciudad;
                res.locals.sucursalUpdate.save(function(err){
                  if(err) console.log(err);
                  res.redirect("/sucursales");
                });
              }else{
                if(sucursalC){
                  res.render("./sucursales/update",{id:req.params.idSucursal,alertSucursal:true,plaza:req.body.plaza,ciudad:req.body.ciudad});
                }else{
                  console.log(err);
                  res.redirect("/sucursales");
                }
              }
            });
          }else{
            if(err) console.log(err);
            res.redirect("/sucursales");
          }
        });
      })
      .delete(function(req,res){

        Usuario.remove({sucursal:req.params.idSucursal}).exec(function(err){
          if(err) console.log(err);
        });
        Baja.remove({sucursal:req.params.idSucursal}).exec(function(err){
          if(err) console.log(err);
        });
        RegistroDeMovimiento.remove({sucursal:req.params.idSucursal}).exec(function(err){
          if(err) console.log(err);
        });
        Consumo.remove({sucursal:req.params.idSucursal}).exec(function(err){
          if(err) console.log(err);
        });
        Almacen.remove({sucursal:req.params.idSucursal}).exec(function(err){
          if(err) console.log(err);
        });
        Sucursal.findOneAndRemove({_id: req.params.idSucursal}).exec(function(err){
            if(err) console.log(err);
            res.redirect("/sucursales");
        });
      });

module.exports = router;
