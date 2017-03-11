var express = require("express");
var Tecnica = require("../models/tecnica").Tecnica;
var Sucursal = require("../models/sucursal").Sucursal;
var router = express.Router();

// gelishtime/tecnicas
// Metodo GET
router.get("/",function(req,res){
    // si es administrador de sucursal
    if(res.locals.usuario.permisos == 1){
      // busca todas las tecnicas de la sucursal del administrador
      Tecnica.find({sucursal:res.locals.usuario.sucursal})
              .exec(function(err,tecnicas){
        if(!err){ // si no hubo error
          // paso a las tecnicas a la vista
          res.render("./tecnicas/manager",{tecnicas:tecnicas});
        }else{ // si hubo error
          console.log(err); // imprimo el error
          res.redirect("/almacen"); // redirecciono al almacen
        }
      });
    }else{ // si es administador general
      // busca a todas las tecnicas que existen
      Tecnica.find({})
              .populate("sucursal")
              .exec(function(err,tecnicas){
        if(!err){ // si no hubo error
          // paso a las tecnicas a la vista
          res.render("./users/manager",{tecnicas:tecnicas});
        }else{ // si hubo error
          console.log(err); // imprimo el error
          res.redirect("/almacen"); // redirecciono al inicio
        }
      });
    }
});
// gelishtime/tecnicas/new
router.route("/new")
      // Metodo GET
      .get(function(req,res){
        // si es administrador general
        if(res.locals.usuario.permisos == 2){
          // busca todas las sucursales
          Sucursal.find({}).exec(function(err,sucursales){
            if(!err && sucursales ){ // si no hubo un error
              res.render("./tecnicas/new",{sucursales:sucursales});
            }else{  // si hubo un error
              if(!sucursales){ // si no hay sucursales
                res.redirect("/sucursales");
              }else{ // si hubo un error
                console.log(err);
                res.redirect("/users");
              }
            }
          });
        }else{ // si es administador de sucursal
          res.render("./tecnicas/new");
        }
      })
      // Metodo POST
      .post(function(req,res){

        if(res.locals.usuario.permisos==1){ // si es administador de sucursal
          // crea una Tecnica nueva con sus respectivos atributos
          var tecnica = new Tecnica({
            nombre: req.body.name,
            apellido: req.body.last_name,
            sucursal: res.locals.usuario.sucursal
          });
          // guarda la tecnica en la base de datos
          tecnica.save().then(function(us){
            res.redirect("/tecnicas");
          }, function(err){ // si ocurre un error lo imprime y redirecciona al almacen
            console.log(err);
            res.redirect("/almacen");
          });
        }else{ // si es administrador general
          // busca la sucursal con el nombre de la plaza
          Sucursal.findOne({plaza:req.body.plaza}).exec(function(err,sucursal){
            if(!err && sucursal){
              // crea una nueva tecnica con sus respectivos atributos
              var tecnica = new Tecnica({
                nombre: req.body.name,
                apellido: req.body.last_name,
                sucursal: sucursal._id
              });
              // guarda la tecnica en la base de datos
              tecnica.save().then(function(us){
                res.redirect("/tecnicas");
              }, function(err){ // si ocurre un error lo imprime
                console.log(err);
                res.redirect("/almacen");
              });
            }else{
              if(!sucursal){ // si no existe la sucursal
                res.redirect("/sucursales");
              }else{ // si hubo un error
                console.log(err);
                res.redirect("/tecnicas");
              }
            }
          });
        }

      });
// gelishtime/tecnicas/:idTecnica
router.route("/:idTecnica")
      // Metodo GET
      .get(function(req,res){
        if(res.locals.usuario.permisos == 2){ // si es administador general
          Sucursal.find({}).exec(function(err,sucursales){ // busca todas las sucursales
            if(!err && sucursales){ // si no hubo error y existen sucursales
              // busco a la tecnica a editar
              Tecnica.findById(req.params.idTecnica).exec(function(err,tecnica){
                if(!err && tecnica){ // si no hubo error y la tecnica existe
                  res.render("./tecnicas/update",{sucursales:sucursales,tecnicaUpdate:tecnica});
                }else{ // si hubo error o la tecnica no existe
                  // imprimo el error y lo redirecciono a la lista de tecnicas
                  if(err) console.log(err);
                  res.redirect("/tecnicas");
                }
              });
            }else{ // si hubo error
              if(!sucursales){ // si no existe la sucursal
                res.redirect("/sucursales");
              }else{ // si hubo un error lo imprime
                console.log(err);
                res.redirect("/tecnicas");
              }
            }
          });
        }else{ // si es administrador de sucursal
          // busco a la tecnica a editar
          Tecnica.findById(req.params.idTecnica).exec(function(err,tecnica){
            if(!err && tecnica){ // si no hubo error y la tecnica existe
              res.render("./tecnicas/update",{tecnicaUpdate:tecnica});
            }else{ // si hubo error o la tecnica no existe
              // imprimo el error y lo redirecciono a la lista de tencias
              if(err) console.log(err);
              res.redirect("/tecnicas");
            }
          });
        }
      })
      // Metodo PUT
      .put(function(req,res){
        if(res.locals.usuario.permisos == 2){ // si es administrador general
          Sucursal.findOne({plaza:req.body.plaza}).exec(function(err,sucursal){ // busco la sucursal
            if(!err && sucursal){ // si no hubo error y la sucursal existe
              // busco al usuario
              Tecnica.findById(req.params.idTecnica).exec(function(err,tecnica){
                if(!err && tecnica){ // si no hubo error y la tecnica existe
                  res.locals.tecnicaUpdate = tecnica;
                  res.locals.tecnicaUpdate.nombre = req.body.name;
                  res.locals.tecnicaUpdate.apellido = req.body.last_name;
                  res.locals.tecnicaUpdate.sucursal = sucursal._id;
                  res.locals.tecnicaUpdate.save(function(err){
                    if(err) console.log(err);
                    res.redirect("/tecnicas");
                  });
                }else{ // si hubo un error
                  if(err) console.log(err);
                  res.redirect("/tecnicas");
                }
              });
            }else{ // si paso algo
              if(!sucursal){ // si no existe la sucursal
                res.redirect("/sucursales");
              }else{ // si hubo un error lo imprime
                console.log(err);
                res.redirect("/tecnicas");
              }
            }
          });

        }else{ // si es administrador de sucursal

          // busco a la tecnica
          Tecnica.findById(req.params.idTecnica).exec(function(err,tecnica){
            if(!err && tecnica){ // si no hubo error y el usuario existe
              res.locals.tecnicaUpdate = tecnica;
              res.locals.tecnicaUpdate.nombre = req.body.name;
              res.locals.tecnicaUpdate.apellido = req.body.last_name;
              res.locals.tecnicaUpdate.save(function(err){
                if(err) console.log(err);
                res.redirect("/tecnicas");
              });
            }else{ // si hubo error
              if(err) console.log(err);
              res.redirect("/tecnicas");
            }
          });
        }
      });
module.exports = router;
