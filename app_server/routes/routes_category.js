'use strict'

const express = require("express"),
      CategoryController = require('../controllers/categoria'),
      category = express.Router()
// gelishtime/categories
category
        .get("/", CategoryController.categoriesGet )
// gelishtime/categories/new
category
        .route("/new")
        // Metodo GET
        .get( CategoryController.categoriesNewGet )
        // Metodo POST
        .post( CategoryController.categoriesNewPost )
// gelishtime/categories/:idCategoria
category
        .route("/:idCategoria")
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
                      res.render("./categories/update",{AlertNombre:true,nombre:req.body.nombre,descripcion:req.body.descripcion,id:req.params.idCategoria});
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
        })
        // Metodo DELETE
        .delete(function(req,res){
        // busco todos los productos que tengan la catedoria
        Producto.find({categoria:req.params.idCategoria}).exec(function(err,productos){
            if(!err && productos){
              // borro todos los productos de la categoria a eliminar
              for(let producto of productos){
                Baja.remove({producto:producto._id}).exec(function(err){
                  if(err) console.log(err);
                });
                RegistroDeMovimiento.remove({producto:producto._id}).exec(function(err){
                  if(err) console.log(err);
                });
                Consumo.remove({producto:producto._id}).exec(function(err){
                  if(err) console.log(err);
                });
                Almacen.remove({producto:producto._id}).exec(function(err){
                  if(err) console.log(err);
                });
                Producto.findOneAndRemove({_id:producto._id}).exec(function(err){
                    if(err) console.log(err);
                });
              }
            }else{ // si paso un error
              if(err) console.log(err); // imprimo el error
              res.redirect("/categories");
            }
        });
        // por ultimo borro la categoria
        Categoria.findOneAndRemove({_id: req.params.idCategoria}).exec(function(err){
            if(err) console.log(err);
            res.redirect("/categories");
        });
  })

module.exports = category