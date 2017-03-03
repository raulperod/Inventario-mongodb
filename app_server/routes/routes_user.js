var express = require("express");
var Usuario = require("../models/usuario").Usuario;
var Sucursal = require("../models/sucursal").Sucursal;
var router = express.Router();

router.get("/",function(req,res){
    if(res.locals.usuario.permisos == 1){
      // busca todos los usuarios de la base de datos donde
      // permisos es igual a "Normal"
      Usuario.find({permisos:0,sucursal:res.locals.usuario.sucursal},function(err,usuarios){
        if(!err){ // si no hubo error
          // paso a los usuarios a la vista
          res.render("./users/manager",{usuarios:usuarios});
        }else{ // si hubo error
          if(err) console.log(err); // imprimo el error
          res.redirect("/almacen"); // redirecciono al inicio
        }
      });
    }else{
      // busca todos los usuarios de la base de datos`
      Usuario.find({permisos:{ $ne: 2 }})
        .populate("sucursal")
        .exec(function(err,usuarios){
        if(!err){ // si no hubo error
          // paso a los usuarios a la vista
          res.render("./users/manager",{usuarios:usuarios});
        }else{ // si hubo error
          if(err) console.log(err); // imprimo el error
          res.redirect("/almacen"); // redirecciono al inicio
        }
      });
    }
});
// para registrar usuario
router.route("/new")
      .get(function(req,res){
        if(res.locals.usuario.permisos == 2){
          Sucursal.find({},function(err,sucursales){
            if(!err){
              res.render("./users/new",{AlertContrasena:false,sucursales:sucursales});
            }else{
              console.log(err);
              res.redirect("/users");
            }
          });
        }else{
          res.render("./users/new",{AlertContrasena:false});
        }
      })
      .post(function(req,res){
        if(req.body.password != req.body.password_confirmation ){
          if(res.locals.usuario.permisos==1){
            res.render("./users/new",{AlertContrasena:true});
          }else{
            Sucursal.find({},function(err,sucursales){
              if(!err){
                res.render("./users/new",{AlertContrasena:true,sucursales:sucursales});
              }else{
                console.log(err);
                res.redirect("/users");
              }
            });
          }
        }
        // crea al usuario
        // validar que el username no este repetido
        Usuario.findOne({username:req.body.username},function(err,usuario){
          // si no hay error y no hay username repetido, entonces lo crea
          if(!err && !usuario){
            // busca la sucursal para
            if(res.locals.usuario.permisos==1){

              // crea un usuario nuevo con sus respectivos atributos
              var usuario = new Usuario({
                username: req.body.username,
                nombre: req.body.name,
                apellido: req.body.last_name,
                password: req.body.password,
                password_confirmation:  req.body.password_confirmation,
                sucursal: res.locals.usuario.sucursal,
                permisos: 0
              });
              // guarda al usuario en la base de datos
              usuario.save().then(function(us){
                res.redirect("/users");
              }, function(err){ // si ocurre un error lo imprime
                console.log(err);
                res.redirect("/almacen");
              });

            }else{
              Sucursal.findOne({plaza:req.body.plaza},function(err,sucursal){
                // crea un usuario nuevo con sus respectivos atributos
                var usuario = new Usuario({
                  username: req.body.username,
                  nombre: req.body.name,
                  apellido: req.body.last_name,
                  password: req.body.password,
                  password_confirmation:  req.body.password_confirmation,
                  sucursal: sucursal._id,
                  permisos: 1
                });
                // guarda al usuario en la base de datos
                usuario.save().then(function(us){
                  res.redirect("/users");
                }, function(err){ // si ocurre un error lo imprime
                  console.log(err);
                  res.redirect("/almacen");
                });
              });
            }

          }else{
            console.log(err);
            res.redirect("/users");
          }
        });
      });
// para editar un usuario
router.route("/:username")
      .get(function(req,res){

        if(res.locals.usuario.permisos == 2){
          Sucursal.find({},function(err,sucursales){
            if(!err){
              // busco al usuario
              Usuario.findOne({ username: req.params.username },function(err,usuario){
                if(!err && usuario){
                  res.render("./users/update",{sucursales:sucursales,usuarioUpdate:usuario});
                }else{
                  // imprimo el error y lo redirecciono al administrador de usuarios
                  console.log(err);
                  res.redirect("/users");
                }
              });
            }else{
              console.log(err);
              res.redirect("/users");
            }
          });
        }else{
          // busco al usuario
          Usuario.findOne({ username: req.params.username },function(err,usuario){
            if(!err && usuario){
              res.render("./users/update",{usuarioUpdate:usuario});
            }else{
              // imprimo el error y lo redirecciono al administrador de usuarios
              console.log(err);
              res.redirect("/users");
            }
          });
        }
      })
      .put(function(req,res){
        // si el password es diferente a la confirmacion
        if(req.body.password != req.body.password_confirmation ){
          if(res.locals.usuario.permisos==1){
            Usuario.findOne({ username: req.params.username },function(err,usuario){
              if(!err && usuario){
                res.render("./users/update",{AlertContrasena:true,usuarioUpdate:usuario,pw:req.body.password,pwc:req.body.password_confirmation});
              }else{
                // imprimo el error y lo redirecciono al administrador de usuarios
                console.log(err);
                res.redirect("/users");
              }
            });
          }else{
            Sucursal.find({},function(err,sucursales){
              if(!err && sucursales){
                Usuario.findOne({ username: req.params.username },function(err,usuario){
                  if(!err && usuario){
                    res.render("./users/update",{AlertContrasena:true,usuarioUpdate:usuario,sucursales:sucursales,pw:req.body.password,pwc:req.body.password_confirmation});
                  }else{
                    // imprimo el error y lo redirecciono al administrador de usuarios
                    if(err) console.log(err);
                    res.redirect("/users");
                  }
                });
              }else{
                console.log(err);
                res.redirect("/users");
              }
            });
          }
        }else{

          //---------------------------------------------------------------------------------------------
          if(res.locals.usuario.permisos == 2){
            Sucursal.findOne({plaza:req.body.plaza},function(err,sucursal){
              if(!err){
                // busco al usuario
                Usuario.findOne({ username: req.params.username },function(err,usuario){
                  if(!err && usuario){
                    res.locals.usuarioUpdate = usuario;
                    res.locals.usuarioUpdate.username = req.body.username;
                    res.locals.usuarioUpdate.password = req.body.password;
                    res.locals.usuarioUpdate.password_confirmation = req.body.password_confirmation;
                    res.locals.usuarioUpdate.nombre = req.body.name;
                    res.locals.usuarioUpdate.apellido = req.body.last_name;
                    res.locals.usuarioUpdate.sucursal = sucursal._id;
                    if(req.body.status == "Activo"){
                      res.locals.usuarioUpdate.status = true;
                    }else{
                      res.locals.usuarioUpdate.status = false;
                    }
                    if(req.body.permisos == "Recepcionista"){
                      res.locals.usuarioUpdate.permisos = 0;
                    }else{
                      res.locals.usuarioUpdate.permisos = 1;
                    }
                    res.locals.usuarioUpdate.save(function(err){
                      if(err) console.log(err);
                      res.redirect("/users");
                    });
                  }else{
                    console.log(err);
                    res.redirect("/users");
                  }
                });
              }else{
                console.log(err);
                res.redirect("/users");
              }
            });

          }else{

            // busco al usuario
            Usuario.findOne({ username: req.params.username },function(err,usuario){
              if(!err && usuario){
                res.locals.usuarioUpdate = usuario;
                res.locals.usuarioUpdate.username = req.body.username;
                res.locals.usuarioUpdate.password = req.body.password;
                res.locals.usuarioUpdate.password_confirmation = req.body.password_confirmation;
                res.locals.usuarioUpdate.nombre = req.body.name;
                res.locals.usuarioUpdate.apellido = req.body.last_name;
                if(req.body.status == "Activo"){
                  res.locals.usuarioUpdate.status = true;
                }else{
                  res.locals.usuarioUpdate.status = false;
                }
                res.locals.usuarioUpdate.save(function(err){
                  if(err) console.log(err);
                  res.redirect("/users");
                });
              }else{
                console.log(err);
                res.redirect("/users");
              }
            });

          }

        }
      })

module.exports = router;
