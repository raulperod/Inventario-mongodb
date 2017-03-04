var express = require("express");
var Usuario = require("../models/usuario").Usuario;
var Sucursal = require("../models/sucursal").Sucursal;
var router = express.Router();

// gelishtime/users
// Metodo GET
router.get("/",function(req,res){
    // si es administrador de sucursal
    if(res.locals.usuario.permisos == 1){
      // busca todas las recepcionistas de la sucursal del administrador
      Usuario.find({permisos:0,sucursal:res.locals.usuario.sucursal})
              .exec(function(err,usuarios){
        if(!err){ // si no hubo error
          // paso a los usuarios a la vista
          res.render("./users/manager",{usuarios:usuarios});
        }else{ // si hubo error
          console.log(err); // imprimo el error
          res.redirect("/almacen"); // redirecciono al almacen
        }
      });
    }else{ // si es administador general
      // busca todos los administadores de sucursal y recepcionistas de la base de datos
      Usuario.find({ _id:{ $ne:req.session.user_id } })
              .populate("sucursal")
              .exec(function(err,usuarios){
        if(!err){ // si no hubo error
          // paso a los usuarios a la vista
          res.render("./users/manager",{usuarios:usuarios});
        }else{ // si hubo error
          console.log(err); // imprimo el error
          res.redirect("/almacen"); // redirecciono al inicio
        }
      });
    }
});
// gelishtime/users/new
router.route("/new")
      // Metodo GET
      .get(function(req,res){
        // si es administrador general
        if(res.locals.usuario.permisos == 2){
          // busca todas las sucursales
          Sucursal.find({},function(err,sucursales){
            if(!err && sucursales ){ // si no hubo un error
              res.render("./users/new",{AlertContrasena:false,AlertUsername:false,sucursales:sucursales});
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
          res.render("./users/new",{AlertContrasena:false,AlertUsername:false});
        }
      })
      // Metodo POST
      .post(function(req,res){
        // Si la contrasena no coincide
        if(req.body.password != req.body.password_confirmation ){
          if(res.locals.usuario.permisos==1){ // si administrador de sucursal
            res.render("./users/new",{AlertContrasena:true,AlertUsername:false,un:req.body.username,nm:req.body.name,ln:req.body.last_name,pw:req.body.password,pwc:req.body.password_confirmation});
          }else{ // si es administrador general
            // busca todas las sucursales
            Sucursal.find({},function(err,sucursales){
              if(!err && sucursales){ // si no hubo error
                res.render("./users/new",{AlertContrasena:true,AlertUsername:false,sucursales:sucursales,un:req.body.username,nm:req.body.name,ln:req.body.last_name,pw:req.body.password,pwc:req.body.password_confirmation});
              }else{ // si hubo error
                if(!sucursales){ // si no hay sucursales
                  res.redirect("/sucursales");
                }else{ // si hubo un error
                  console.log(err);
                  res.redirect("/users");
                }
              }
            });
          }
        }else{ // si no hubo error en la contrasena
          // validar que el username no este repetido
          Usuario.findOne({username:req.body.username},function(err,usuario){
            // si no hay error y no hay username repetido, entonces lo crea
            if(!err && !usuario){
              // si es administrador de sucursal
              if(res.locals.usuario.permisos==1){
                // crea una Recepcionista nueva con sus respectivos atributos
                var usuario = new Usuario({
                  username: req.body.username,
                  nombre: req.body.name,
                  apellido: req.body.last_name,
                  password: req.body.password,
                  password_confirmation:  req.body.password_confirmation,
                  sucursal: res.locals.usuario.sucursal,
                  permisos: 0
                });
                // guarda la recepcionista en la base de datos
                usuario.save().then(function(us){
                  res.redirect("/users");
                }, function(err){ // si ocurre un error lo imprime y redirecciona al almacen
                  console.log(err);
                  res.redirect("/almacen");
                });
              }else{ // si es administrador general
                // busca la sucursal con el nombre de la plaza
                Sucursal.findOne({plaza:req.body.plaza},function(err,sucursal){
                  if(!err && sucursal){
                    // crea un nuevo administrador de sucural con sus respectivos atributos
                    var usuario = new Usuario({
                      username: req.body.username,
                      nombre: req.body.name,
                      apellido: req.body.last_name,
                      password: req.body.password,
                      password_confirmation: req.body.password_confirmation,
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
                  }else{
                    if(!sucursal){ // si no existe la sucursal
                      res.redirect("/sucursales");
                    }else{ // si hubo un error
                      console.log(err);
                      res.redirect("/users");
                    }
                  }

                });
              }

            }else if(usuario){ // si se repite el username
              if(res.locals.usuario.permisos==1){ // si es Administrador de sucursal
                res.render("./users/new",{AlertContrasena:false,AlertUsername:true,un:req.body.username,nm:req.body.name,ln:req.body.last_name,pw:req.body.password,pwc:req.body.password_confirmation});
              }else{ // si es Administrador general
                // busca todas las sucursales
                Sucursal.find({},function(err,sucursales){
                  if(!err && sucursales){ // si no hubo error
                    res.render("./users/new",{AlertContrasena:false,AlertUsername:true,sucursales:sucursales,un:req.body.username,nm:req.body.name,ln:req.body.last_name,pw:req.body.password,pwc:req.body.password_confirmation});
                  }else{ // si hubo error
                    if(!sucursales){ // si no existe la sucursal
                      res.redirect("/sucursales");
                    }else{ // si hubo un error lo imprime
                      console.log(err);
                      res.redirect("/users");
                    }
                  }
                });
              }
            }else if(err){ // si hubo un error
              console.log(err);
              res.redirect("/users");
            }
          });
        }
      });
// gelishtime/users/:username
router.route("/:username")
      // Metodo GET
      .get(function(req,res){
        if(res.locals.usuario.permisos == 2){ // si es administador general
          Sucursal.find({},function(err,sucursales){ // busca todas las sucursales
            if(!err && sucursales){ // si no hubo error y existen sucursales
              // busco al usuario a editar
              Usuario.findOne({ username: req.params.username },function(err,usuario){
                if(!err && usuario){ // si no hubo error y el usuario existe
                  res.render("./users/update",{sucursales:sucursales,usuarioUpdate:usuario,AlertContrasena:false,AlertUsername:false});
                }else{ // si hubo error o el usuario no existe
                  // imprimo el error y lo redirecciono al administrador de usuarios
                  if(err) console.log(err);
                  res.redirect("/users");
                }
              });
            }else{ // si hubo error
              if(!sucursales){ // si no existe la sucursal
                res.redirect("/sucursales");
              }else{ // si hubo un error lo imprime
                console.log(err);
                res.redirect("/users");
              }
            }
          });
        }else{ // si es administrador de sucursal
          // busco al usuario a editar
          Usuario.findOne({ username: req.params.username },function(err,usuario){
            if(!err && usuario){ // si no hubo error y el usuario existe
              res.render("./users/update",{usuarioUpdate:usuario,AlertContrasena:false,AlertUsername:false});
            }else{ // si hubo error o el usuario no existe
              // imprimo el error y lo redirecciono al administrador de usuarios
              if(err) console.log(err);
              res.redirect("/users");
            }
          });
        }
      })
      // Metodo PUT
      .put(function(req,res){
        // si el password es diferente a la confirmacion
        if(req.body.password != req.body.password_confirmation ){
          if(res.locals.usuario.permisos==1){ // si es administrador de sucursal
            // busco el usuario a editar
            Usuario.findOne({ username: req.params.username },function(err,usuario){
              if(!err && usuario){ // si no hubo error y el usuario existe
                res.render("./users/update",{usuarioUpdate:usuario,AlertContrasena:true,AlertUsername:false,un:req.body.username,nm:req.body.name,ln:req.body.last_name,pw:req.body.password,pwc:req.body.password_confirmation});
              }else{ // si hubo error o el usuario no existe
                // imprimo el error y lo redirecciono al administrador de usuarios
                if(err) console.log(err);
                res.redirect("/users");
              }
            });
          }else{ // si no hubo error en la confirmacion del password
            Sucursal.find({},function(err,sucursales){ // busco todas las sucursales
              if(!err && sucursales){ // si no hubo error y existen sucursales
                Usuario.findOne({ username: req.params.username },function(err,usuario){
                  if(!err && usuario){ // si no hay error y el usuario existe
                    res.render("./users/update",{sucursales:sucursales,usuarioUpdate:usuario,AlertContrasena:true,AlertUsername:false,un:req.body.username,nm:req.body.name,ln:req.body.last_name,pw:req.body.password,pwc:req.body.password_confirmation});
                  }else{
                    // imprimo el error y lo redirecciono al administrador de usuarios
                    if(err) console.log(err);
                    res.redirect("/users");
                  }
                });
              }else{
                if(!sucursales){ // si no existe la sucursal
                  res.redirect("/sucursales");
                }else{ // si hubo un error lo imprime
                  console.log(err);
                  res.redirect("/users");
                }
              }
            });
          }
        }else{ // si no hubo error en el password
          // verifica que el nuevo username no este repetido
          Usuario.findOne({username:req.body.username}).exec(function(err,usuario){
            if(!err && !usuario || !err && usuario.username == res.locals.usuario.username){ // si no hubo error y el username no esta repetido
              if(res.locals.usuario.permisos == 2){ // si es administrador general
                Sucursal.findOne({plaza:req.body.plaza},function(err,sucursal){ // busco la sucursal
                  if(!err && sucursal){ // si no hubo error y la sucursal existe
                    // busco al usuario
                    Usuario.findOne({ username: req.params.username },function(err,usuario){
                      if(!err && usuario){ // si no hubo error y el usuario existe
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
                        if(err) console.log(err);
                        res.redirect("/users");
                      }
                    });
                  }else{
                    if(!sucursal){ // si no existe la sucursal
                      res.redirect("/sucursales");
                    }else{ // si hubo un error lo imprime
                      console.log(err);
                      res.redirect("/users");
                    }
                  }
                });

              }else{

                // busco al usuario
                Usuario.findOne({ username: req.params.username },function(err,usuario){
                  if(!err && usuario){ // si no hubo error y el usuario existe
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
                  }else{ // si hubo error
                    if(err) console.log(err);
                    res.redirect("/users");
                  }
                });

              }
            }else{ // si hubo un error
              if(usuario){ // si el username esta repetido
                if(res.locals.usuario.permisos == 2){ // si es administrador general
                  Sucursal.find({},function(err,sucursales){ // busca todas las sucursales
                    if(!err && sucursales){ // si no hubo error y existen sucursales
                      res.render("./users/update",{sucursales:sucursales,usuarioUpdate:usuario,AlertContrasena:false,AlertUsername:true,un:req.body.username,nm:req.body.name,ln:req.body.last_name,pw:req.body.password,pwc:req.body.password_confirmation});
                    }else{ // si hubo un error
                      if(!sucursales){ // si no hay sucursales
                        res.redirect("/sucursales");
                      }else{ // si hubo un error
                        console.log(err);
                        res.redirect("/almacen");
                      }
                    }
                  });
                }else{ // si es administrador de sucursal
                  res.render("./users/update",{usuarioUpdate:usuario,AlertContrasena:false,AlertUsername:true,un:req.body.username,nm:req.body.name,ln:req.body.last_name,pw:req.body.password,pwc:req.body.password_confirmation})
                }
              }else{ // si hubo un error
                console.log(err);
                res.redirect("/almacen");
              }
            }
          });

        }
      });
module.exports = router;
