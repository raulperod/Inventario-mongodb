var express = require("express");
var Categoria = require("../models/categoria").Categoria;
var Producto = require("../models/producto").Producto;
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();

router.get("/",function(req,res){
  // muestra la lista de categorias
  Categoria.find({},function(err,categorias){
    if(!err){ // si no hubo error
      res.render("./categories/manager",{categorias:categorias});
    }else{ // si hubo error
      console.log(err); // imprimo el error
      res.redirect("/almacen"); // redirecciono al inicio
    }
  });
});
// para registrar una categoria
router.route("/new")
      .get(function(req,res){
        res.render("./categories/new");
      })
      .post(function(req,res){
        // validar que el nombre no este repetida
        Categoria.findOne({nombre:req.body.nombre},function(err,categoria){
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
          }else{
            res.redirect("/categories/new");
          }
        });
      });
// para editar una categoria
router.route("/:nombre")
      .get(function(req,res){
        // busco la categoria
        Categoria.findOne({ nombre: req.params.nombre },function(err,categoria){
          if(!err && categoria){
            res.render("./categories/update",{categoryUpdate:categoria});
          }else{
            // imprimo el error y lo redirecciono al administrador de sucursales
            if(err) console.log(err);
            res.redirect("/categories");
          }
        });
      })
      .put(function(req,res){
        // busco la sucursal
        Categoria.findOne({ nombre: req.params.nombre },function(err,categoria){
          // si no hay error
          if(!err && categoria){
            res.locals.categoryUpdate = categoria;
            res.locals.categoryUpdate.nombre = req.body.nombre;
            res.locals.categoryUpdate.descripcion = req.body.descripcion;
            res.locals.categoryUpdate.save(function(err){
              if(err) console.log(err);
              res.redirect("/categories");
            });
          }else{
            if(err) console.log(err);
            res.redirect("/categories");
          }
        });
      });
router.route("/:idCategoria/delete")
      .delete(function(req,res){

        Producto.find({categoria:req.params.idCategoria},function(err,productos){
            if(!err && productos){
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
            }else{
              if(err) console.log(err);
              res.redirect("/categories");
            }
        });

        Categoria.findOneAndRemove({_id: req.params.idCategoria},function(err){
            if(err) console.log(err);
            res.redirect("/categories");
        });

  });

module.exports = router;
