var express = require("express");
var Sucursal = require("../models/sucursal").Sucursal;
var Usuario = require("../models/usuario").Usuario;
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();

router.get("/",function(req,res){
    // busca todas las sucursales de la base de datos
    Sucursal.find({},function(err,sucursales){
      if(!err){ // si no hubo error
        res.render("./sucursales/manager",{sucursales:sucursales});
      }else{ // si hubo error
        console.log(err); // imprimo el error
        res.redirect("/almacen"); // redirecciono al inicio
      }
    });
});
// para registrar una sucursal
router.route("/new")
      .get(function(req,res){
          res.render("./sucursales/new");
      })
      .post(function(req,res){
        // validar que la plaza no este repetida
        Sucursal.findOne({plaza:req.body.plaza,ciudad:req.body.ciudad},function(err,sucursal){
          if(!err && !sucursal){
            // si no hay sucursal repetida, entonces la crea
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
          }else{
            res.redirect("/sucursales/new");
          }
        });
      });
// para editar una sucursal
router.route("/:plaza")
      .get(function(req,res){
        // busco la sucursal
        Sucursal.findOne({ plaza: req.params.plaza },function(err,sucursal){
          if(!err && sucursal){
            res.render("./sucursales/update",{sucursalUpdate:sucursal});
          }else{
            // imprimo el error y lo redirecciono al administrador de sucursales
            if(err) console.log(err);
            res.redirect("/sucursales");
          }
        });
      })
      .put(function(req,res){
        // busco la sucursal
        Sucursal.findOne({ plaza: req.params.plaza },function(err,sucursal){
          // si no hay error
          if(!err && sucursal){
            res.locals.sucursalUpdate = sucursal;
            res.locals.sucursalUpdate.plaza = req.body.plaza;
            res.locals.sucursalUpdate.ciudad = req.body.ciudad;
            res.locals.sucursalUpdate.save(function(err){
              if(err) console.log(err);
              res.redirect("/sucursales");
            });
          }else{
            if(err) console.log(err);
            res.redirect("/sucursales");
          }
        });
      })
router.route("/:idSucursal/delete")       
      .delete(function(req,res){

        Usuario.remove({sucursal:req.params.idSucursal},function(err){
          if(err) console.log(err);
        });
        Baja.remove({sucursal:req.params.idSucursal},function(err){
          if(err) console.log(err);
        });
        RegistroDeMovimiento.remove({sucursal:req.params.idSucursal},function(err){
          if(err) console.log(err);
        });
        Consumo.remove({sucursal:req.params.idSucursal},function(err){
          if(err) console.log(err);
        });
        Almacen.remove({sucursal:req.params.idSucursal},function(err){
          if(err) console.log(err);
        });
        Sucursal.findOneAndRemove({_id: req.params.idSucursal},function(err){
            if(err) console.log(err);
            res.redirect("/sucursales");
        });
      });

module.exports = router;
