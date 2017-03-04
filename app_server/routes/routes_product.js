var express = require("express");
var Categoria = require("../models/categoria").Categoria;
var Producto = require("../models/producto").Producto;
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();

router.get("/",function(req,res){
    // busca todos los productos de la base de datos donde
    // permisos es igual a "Normal"
    Producto.find({})
            .populate("categoria")
            .exec(function(err,productos){
      if(!err){ // si no hubo error
        // paso a los productos a la vista
        res.render("./products/manager",{productos:productos});
      }else{ // si hubo error
        if(err) console.log(err); // imprimo el error
        res.redirect("/almacen"); // redirecciono al inicio
      }
    });
});
// para registrar un producto
router.route("/new")
      .get(function(req,res){
          Categoria.find({},function(err,categorias){
            if(!err){
              res.render("./products/new",{categorias:categorias});
            }else{
              console.log(err);
              res.redirect("/products");
            }
          });
      })
      .post(function(req,res){
        // crea un producto
        // validar que el Producto no este repetido
        Producto.findOne({nombre:req.body.nombre},function(err,producto){
          // si no hay error y no hay producto repetido, entonces lo crea
          if(!err && !producto){
            // busca la sucursal para
            Categoria.findOne({nombre:req.body.categoria},function(err,categoria){
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
            });
          }else{
            console.log(err);
            res.redirect("/products");
          }
        });
      });
// para editar un usuario
router.route("/:idProducto")
      .get(function(req,res){
        Categoria.find({},function(err,categorias){
          if(!err){
            // busco al usuario
            Producto.findById(req.params.idProducto,function(err,producto){
              if(!err){
                res.render("./products/update",{categorias:categorias,productoUpdate:producto});
              }else{
                // imprimo el error y lo redirecciono al administrador de productos
                console.log(err);
                res.redirect("/products");
              }
            });
          }else{
            console.log(err);
            res.redirect("/products");
          }
        });
      })
      .put(function(req,res){
        Categoria.findOne({nombre:req.body.categoria},function(err,categoria){
          if(!err){
            // busco el producto
            Producto.findById(req.params.idProducto,function(err,producto){
              if(!err && producto){
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
              }else{
                console.log(err);
                res.redirect("/products");
              }
            });
          }else{
            console.log(err);
            res.redirect("/products");
          }
        });
      })
router.route("/:idProducto/delete")
      .delete(function(req,res){

        Baja.remove({producto:req.params.idProducto},function(err){
          if(err) console.log(err);
        });
        RegistroDeMovimiento.remove({producto:req.params.idProducto},function(err){
          if(err) console.log(err);
        });
        Consumo.remove({producto:req.params.idProducto},function(err){
          if(err) console.log(err);
        });
        Almacen.remove({producto:req.params.idProducto},function(err){
          if(err) console.log(err);
        });
        Producto.findOneAndRemove({_id: req.params.idProducto},function(err){
            if(err) console.log(err);
            res.redirect("/products");
        });
  });

module.exports = router;
