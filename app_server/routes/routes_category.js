var express = require("express");
var Categoria = require("../models/categoria").Categoria;
var Producto = require("../models/producto").Producto;
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();
// gelishtime/categories
router.get("/",function(req,res){
  // muestra la lista de categorias
  Categoria.find({}).exec(function(err,categorias){
    if(!err){ // si no hubo error
      res.render("./categories/manager",{categorias:categorias});
    }else{ // si hubo error
      console.log(err); // imprimo el error
      res.redirect("/almacen"); // redirecciono al almacen
    }
  });
});
// gelishtime/categories/new
router.route("/new")
      // Metodo GET
      .get(function(req,res){
        res.render("./categories/new",{AlertNombre:false});
      })
      // Metodo POST
      .post(function(req,res){
        // validar que el nombre no este repetida
        Categoria.findOne({nombre:req.body.nombre}).exec(function(err,categoria){
          if(!err && !categoria){
            // si no hay categoria repetida, entonces la crea
            // crea una categoria nueva con sus respectivos atributos
            var categoria = new Categoria({
              nombre: req.body.nombre,
              descripcion: req.body.descripcion
            });
            // guarda la categoria en la base de datos
            categoria.save().then(function(us){
              res.redirect("/categories");
            }, function(err){ // si ocurre un error lo imprime
              console.log(err);
            });
          }else{ // si paso algo
            if(categoria){ // si el nombre de la categoria se repite
              res.render("./categories/new",{AlertNombre:true,nombre:req.body.nombre,descripcion:req.body.descripcion});
            }else{// si paso un error
              console.log(err);
              res.redirect("/categories/new");
            }
          }
        });
      });
// gelishtime/categories/:idCategoria
router.route("/:idCategoria")
      .get(function(req,res){
        // busco la categoria
        Categoria.findById(req.params.idCategoria).exec(function(err,categoria){
          if(!err && categoria){// si no hubo error y la categoria existe
            res.render("./categories/update",{categoryUpdate:categoria,AlertNombre:false});
          }else{
            // imprimo el error y lo redirecciono al administrador de sucursales
            if(err) console.log(err);
            res.redirect("/categories");
          }
        });
      })
      .put(function(req,res){
        // busco la categoria
        Categoria.findById(req.params.idCategoria).exec(function(err,categoria){
          if(!err && categoria){// si no hay error y la categoria existe
            if(categoria.nombre == req.body.nombre){ // si no modifico su nombre
              res.locals.categoryUpdate = categoria;
              res.locals.categoryUpdate.descripcion = req.body.descripcion;
              res.locals.categoryUpdate.save(function(err){
                if(err) console.log(err);
                res.redirect("/categories");
              });
            }else{ // si modifico su nombre
              // verifica que el nuevo nombre no este repetido
              Categoria.findOne({nombre:req.body.nombre}).exec(function(err,categoriaNew){
                if(!err && !categoriaNew){
                  // si no se repite entonces actualizo la categoria
                  res.locals.categoryUpdate = categoria;
                  res.locals.categoryUpdate.nombre = req.body.nombre;
                  res.locals.categoryUpdate.descripcion = req.body.descripcion;
                  res.locals.categoryUpdate.save(function(err){
                    if(err) console.log(err);
                    res.redirect("/categories");
                  });
                }else{ // si paso algo
                  if(categoriaNew){ // si hay una categoria con el nuevo nombre
                    // mando una alerta
                    res.render("./categories/update",{AlertNombre:true,nombre:req.body.nombre,descripcion:req.body.descripcion,id:req.params.idCategoria}});
                  }else{ // si hay error
                    console.log(err);
                    res.redirect("/categoria");
                  }
                }
              });
            }
          }else{ // si paso algo
            if(err) console.log(err);
            res.redirect("/categories");
          }
        });
      });
      // Metodo DELETE
      .delete(function(req,res){
        // busco todos los productos que tengan la catedoria
        Producto.find({categoria:req.params.idCategoria},function(err,productos){
            if(!err && productos){
              // borro todos los productos de la categoria a eliminar
              for(let producto of productos){
                Baja.remove({producto:producto._id},function(err){
                  if(err) console.log(err);
                });
                RegistroDeMovimiento.remove({producto:producto._id},function(err){
                  if(err) console.log(err);
                });
                Consumo.remove({producto:producto._id},function(err){
                  if(err) console.log(err);
                });
                Almacen.remove({producto:producto._id},function(err){
                  if(err) console.log(err);
                });
                Producto.findOneAndRemove({_id:producto._id},function(err){
                    if(err) console.log(err);
                });
              }
            }else{ // si paso un error
              if(err) console.log(err);
              res.redirect("/categories");
            }
        });
        // por ultimo borro la categoria
        Categoria.findOneAndRemove({_id: req.params.idCategoria},function(err){
            if(err) console.log(err);
            res.redirect("/categories");
        });

  });

module.exports = router;
