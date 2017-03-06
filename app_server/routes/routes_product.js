var express = require("express");
var Categoria = require("../models/categoria").Categoria;
var Producto = require("../models/producto").Producto;
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();
// gelishtime/products
router.get("/",function(req,res){
    // busca todos los productos de la base de datos
    Producto.find({})
            .populate("categoria")
            .exec(function(err,productos){
      if(!err){ // si no hubo error
        // paso a los productos a la vista
        res.render("./products/manager",{productos:productos});
      }else{ // si hubo error
        if(err) console.log(err); // imprimo el error
        res.redirect("/almacen"); // redirecciono al almacen
      }
    });
});
// gelishtime/products/new
router.route("/new")
      // Metodo GET
      .get(function(req,res){
          // busca todas las categorias
          Categoria.find({}).exec(function(err,categorias){
            if(!err && categorias){ // si no hay error y hay categorias
              res.render("./products/new",{categorias:categorias,AlertNombre:false,AlertCodigo:false});
            }else{ // si hubo un error
              if(!categorias){ // si no hay categorias
                res.redirect("/categories/new"); // se redirecciona a crear una
              }else{ // si hubo un error
                console.log(err);
                res.redirect("/products");
              }
            }
          });
      })
      // Metodo POST
      .post(function(req,res){
        // crea un producto
        // validar que existe un prodcuto con el mismo nombre o el mismo codigo
        Producto.findOne({ $or: [ {nombre:req.body.nombre} , {codigo:req.body.codigo} ] } ).exec(function(err,producto){
          // si no hay error y no hay producto repetido, entonces lo crea
          if(!err && !producto){
            // busca la sucursal para
            Categoria.findOne({nombre:req.body.categoria}).exec(function(err,categoria){
              if(!err && categoria){
                // crea un producto nuevo con sus respectivos atributos
                var producto = new Producto({
                  nombre: req.body.nombre,
                  codigo: req.body.codigo,
                  descripcion: req.body.descripcion,
                  minimo: parseInt(req.body.minimo),
                  categoria: categoria._id
                });
                // guarda al producto en la base de datos
                producto.save().then(function(us){
                  res.redirect("/products");
                }, function(err){ // si ocurre un error lo imprime
                  console.log(err);
                });
              }else{ // si hubo un error
                if(!categoria){ // si no existe la categoria
                  res.redirect("/categories/new");
                }else{ // si hubo un error
                  console.log(err);
                  res.redirect("/products");
                }
              }
            });
          }else{
            if(producto){ // si el producto ya existe
              // busca todas las categorias
              Categoria.find({}).exec(function(err,categorias){
                if(!err && categorias){ // si no hay error y hay categorias
                  if(producto.nombre == req.body.nombre){ // si lo que se repitio fue el nombre
                    res.render("./products/new",{categorias:categorias,AlertNombre:true,AlertCodigo:false,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo});
                  }else{// si lo que se repitio fue el codigo
                    res.render("./products/new",{categorias:categorias,AlertNombre:false,AlertCodigo:true,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo});
                  }
                }else{ // si hubo un error
                  if(!categorias){ // si no hay categorias
                    res.redirect("/categories/new"); // se redirecciona a crear una
                  }else{ // si hubo un error
                    console.log(err);
                    res.redirect("/products");
                  }
                }
              });
            }else{ // si hubo un error
              console.log(err);
              res.redirect("/products");
            }
          }
        });
      });
// gelishtime/products/:idProducto
router.route("/:idProducto")
      // Metodo GET
      .get(function(req,res){
        // busco todas las categorias
        Categoria.find({}).exec(function(err,categorias){
          if(!err && categorias){ // si no hay error y hay categorias
            // busco al producto
            Producto.findById(req.params.idProducto).exec(function(err,producto){
              if(!err && producto){ // si no hay error y el producto existe
                res.render("./products/update",{categorias:categorias,productoUpdate:producto,AlertNombre:false,AlertCodigo:false});
              }else{ // si hubo un error
                if(!producto){ // si no hay producto
                  res.redirect("/products/new");
                }else{ // si hubo un error
                  console.log(err);
                  res.redirect("/products");
                }
              }
            });
          }else{ // si hubo un error
            if(!categorias){ // si no hay categorias
              res.redirect("/categories/new");
            }else{ // si hubo un error
              console.log(err);
              res.redirect("/products");
            }
          }
        });
      })
      // Metodo PUT
      .put(function(req,res){
        // busco la categoria
        Categoria.findOne({nombre:req.body.categoria}).exec(function(err,categoria){
          if(!err && categoria){ // si no hubo error y la categoria existe
            // busco el producto
            Producto.findOne( { or: [ {nombre:req.body.nombre} , {codigo:req.body.codigo} ] } ).exec(function(err,prod){
              if(!err && !prod || !err && prod._id == req.params.idProducto ){ // si no hubo error y el nombre o codigo no se repite
                Producto.findById(req.params.idProducto).exec(function(err,producto){
                  if(!err && producto){ // si no hubo error y el producto existe
                    // edito el producto
                    res.locals.productoUpdate = producto;
                    res.locals.productoUpdate.nombre = req.body.nombre;
                    res.locals.productoUpdate.codigo = req.body.codigo;
                    res.locals.productoUpdate.descripcion = req.body.descripcion;
                    res.locals.productoUpdate.minimo = parseInt(req.body.minimo);
                    res.locals.productoUpdate.categoria = categoria._id;
                    res.locals.productoUpdate.save(function(err){
                      if(err) console.log(err);
                      res.redirect("/products");
                    });
                  }else{ // si hubo un error
                    if(!producto){ // si el producto no existe
                      res.redirect("/products/new");
                    }else{ // si hubo un error
                      console.log(err);
                      res.redirect("/products");
                    }
                  }
                });
              }else{ // si hubo un error o se repite un campo
                if(prod){ // si se repitio un campo
                    if(prod.nombre == req.body.nombre){ // si se repite el nombre
                      res.render("./products/update",{categorias:categorias,AlertNombre:true,AlertCodigo:false,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto});
                    }else{ // si se repite el codigo
                      res.render("./products/update",{categorias:categorias,AlertNombre:false,AlertCodigo:true,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto});
                    }
                }else{ // si hubo error
                  console.log(err);
                  res.redirect("/products");
                }
              }
            });

          }else{ // si hubo un error
            if(!categoria){ // si la categoria no existe
              res.redirect("/categories/new");
            }else{ // si hubo un error
              console.log(err);
              res.redirect("/products");
            }
          }
        });
      })
      // Metodo DELETE
      .delete(function(req,res){
        // borra las bajas produccidas por el producto
        Baja.remove({producto:req.params.idProducto}).exec(function(err){
          if(err) console.log(err);
        });
        // borra los movimientos produccidos por el producto
        RegistroDeMovimiento.remove({producto:req.params.idProducto}).exec(function(err){
          if(err) console.log(err);
        });
        // borra los productos en consumo del producto
        Consumo.remove({producto:req.params.idProducto}).exec(function(err){
          if(err) console.log(err);
        });
        // borra los productos en el almacen del producto
        Almacen.remove({producto:req.params.idProducto}).exec(function(err){
          if(err) console.log(err);
        });
        // borra el producto
        Producto.findOneAndRemove({_id: req.params.idProducto}).exec(function(err){
            if(err) console.log(err);
            res.redirect("/products");
        });
  });

module.exports = router;
