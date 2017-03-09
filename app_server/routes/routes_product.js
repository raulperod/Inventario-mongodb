var express = require("express");
var Categoria = require("../models/categoria").Categoria;
var Producto = require("../models/producto").Producto;
var Almacen = require("../models/almacen").Almacen;
var Consumo = require("../models/consumo").Consumo;
var RegistroDeMovimiento = require("../models/registroDeMovimiento").RegistroDeMovimiento;
var Baja = require("../models/baja").Baja;
var router = express.Router();
// para el excel
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var fs = require('fs');
var storage = multer.diskStorage(
        {
          destination:function(req,file,cb){
                        cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null,file.fieldname+'-'+datetimestamp+'.'+file.originalname.split('.')[file.originalname.split('.').length-1])
        }
      });
var upload = multer({storage:storage}).single('file');
// ------------
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
        Categoria.findOne({nombre:req.body.categoria}).exec(function(err,categoria){
          if(!err && categoria){
            //verificar que no se repita el nombre ni el codigo
            Producto.findById(req.params.idProducto).exec(function(err,producto){
              if(!err && producto){ // si no hay error y el producto existe
                if(producto.nombre == req.body.nombre && producto.codigo == req.body.codigo){ // si no modifico el nombre ni el codigo
                  // edito el producto
                  res.locals.productoUpdate = producto;
                  res.locals.productoUpdate.descripcion = req.body.descripcion;
                  res.locals.productoUpdate.minimo = parseInt(req.body.minimo);
                  res.locals.productoUpdate.categoria = categoria._id;
                  res.locals.productoUpdate.save(function(err){
                    if(err) console.log(err);
                    res.redirect("/products");
                  });

                }else if(producto.nombre != req.body.nombre && producto.codigo == req.body.codigo){ // si modifico el nombre y el codigo es el mismo
                  // verifico si el nombre esta repetido
                  Producto.findOne({nombre:req.body.nombre}).exec(function(err,p){
                    if(!err && !p){ // si no hay error y el nombre no se repite
                      // edito el producto
                      res.locals.productoUpdate = producto;
                      res.locals.productoUpdate.nombre = req.body.nombre;
                      res.locals.productoUpdate.descripcion = req.body.descripcion;
                      res.locals.productoUpdate.minimo = parseInt(req.body.minimo);
                      res.locals.productoUpdate.categoria = categoria._id;
                      res.locals.productoUpdate.save(function(err){
                        if(err) console.log(err);
                        res.redirect("/products");
                      });
                    }else{ // si paso algo
                      if(p){ //si se repite el nombre
                        Categoria.find({}).exec(function(err,categorias){
                          if(!err && categorias){ //si no hay error y hay categorias
                            res.render("./products/update",{categorias:categorias,AlertNombre:true,AlertCodigo:false,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto});
                          }else{ // si paso algo
                            if(!categorias){ // si no hay categorias
                              res.redirect("/categories/new");
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

                }else if(producto.nombre == req.body.nombre && producto.codigo != req.body.codigo){ // si modifico el codigo y el nombre es el mismo
                  // verifico si el codigo esta repetido
                  Producto.findOne({codigo:req.body.codigo}).exec(function(err,p){
                    if(!err && !p){ // si hubo error y no se repite el codigo
                      // edito el producto
                      res.locals.productoUpdate = producto;
                      res.locals.productoUpdate.codigo = req.body.codigo;
                      res.locals.productoUpdate.descripcion = req.body.descripcion;
                      res.locals.productoUpdate.minimo = parseInt(req.body.minimo);
                      res.locals.productoUpdate.categoria = categoria._id;
                      res.locals.productoUpdate.save(function(err){
                        if(err) console.log(err);
                        res.redirect("/products");
                      });
                    }else{
                      if(p){ //si se repite el codigo
                        Categoria.find({}).exec(function(err,categorias){
                          if(!err && categorias){ // si no hubo error
                            res.render("./products/update",{categorias:categorias,AlertNombre:false,AlertCodigo:true,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto});
                          }else{ // si paso algo
                            if(!categorias){ // si no hay categorias
                              res.redirect("/categories/new");
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

                }else{ // si modifico ambos

                  // verifico si el codigo  o el nombre esta repetido
                  Producto.findOne({ $or: [ {nombre:req.body.nombre} , {codigo:req.body.codigo} ] }).exec(function(err,p){
                    if(!err && !p){ // si no hubo error y no se repite el nombre o el codigo
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
                    }else{ // si paso algo
                      if(p){ //si se repite el codigo
                        Categoria.find({}).exec(function(err,categorias){
                          if(!err && categorias){ // si no hubo error
                            if(p.nombre == req.body.nombre ){ // si se repite el nombre
                              res.render("./products/update",{categorias:categorias,AlertNombre:true,AlertCodigo:false,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto});
                            }else{ // si se repite el codigo
                              res.render("./products/update",{categorias:categorias,AlertNombre:false,AlertCodigo:true,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto});
                            }
                          }else{ // si paso algo
                            if(!categorias){ // si no hay categorias
                              res.redirect("/categories/new");
                            }else{ // si hubo un error
                              console.log(err);
                              res.redirect("/products");
                            }
                          }
                        });
                      }else{ // si hubo error
                        console.log(err);
                        res.redirect("/products");
                      }
                    }
                  });

                }
              }else{ // si hubo un error
                if(err) console.log(err);
                res.redirect("/products");
              }
            });
          }else{ // si hubo un error
            if(err) console.log(err);
            res.redirect("/products");
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
// gelishtime/products/new-excel
router.route("/new/excel")
      // Metodo GET
      .get(function(req,res){
        res.render("./products/excel");
      })
      // Metodo POST
      .post(function(req,res){
        var exceltojson;
        upload(req,res,function(err){
          if(err){
           res.redirect("/products");
          }
          /** Multer gives us file info in req.file object */
          if(!req.file){
            res.redirect("/products");
          }

          if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
          }else{
            exceltojson = xlstojson;
          }
          try{
            exceltojson({
              input: req.file.path,
              output: null, //since we don't need output.json
              lowerCaseHeaders:true
            },function(err,productosExcel){
                if(!err && productosExcel){
                  // borrar el archivo
                  try{
                   fs.unlinkSync(req.file.path);
                  }catch(e) {
                    console.log(e);
                    res.redirect("/products");
                  }
                  // crear los productos
                  for(let productoExcel of productosExcel){
                    // registo cada producto que se haya pasado
                    if(productoExcel.categoria){
                      Categoria.findOne({nombre:productoExcel.categoria},{_id:1}).exec(function(err,categoria){
                        if(!err && categoria){
                          Producto.findOne({nombre:productoExcel.nombre},{_id:1}).exec(function(err,prod){
                            if(!err && !prod){
                              var productoNuevo = new Producto({
                                nombre: productoExcel.nombre,
                                codigo: productoExcel.codigo,
                                descripcion: productoExcel.descripcion,
                                minimo: parseInt(productoExcel.minimo),
                                categoria: categoria._id
                              });
                              // guarda al producto en la base de datos
                              productoNuevo.save().then(function(pdt){
                              }, function(err){ // si ocurre un error lo imprime
                                console.log(err);
                              });

                            }else{ // si paso algo
                              if(err) console.log(err);
                              if(prod) console.log("El producto "+productoExcel.nombre+" existe");
                            }
                          });
                        }else{ // si paso algo
                          if(!categoria){ // si la categoria no existe
                            // crea una categoria nueva con sus respectivos atributos
                            var categoriaNueva = new Categoria({
                              nombre:productoExcel.categoria,
                            });
                            // guarda la categoria en la base de datos
                            categoriaNueva.save().then(function(cat){
                              // ya con la categoria creada creo al producto
                              Producto.findOne({nombre:productoExcel.nombre},{_id:1}).exec(function(err,prod){
                                if(!err && !prod){
                                  var productoNuevo = new Producto({
                                    nombre: productoExcel.nombre,
                                    codigo: productoExcel.codigo,
                                    descripcion: productoExcel.descripcion,
                                    minimo: parseInt(productoExcel.minimo),
                                    categoria: cat._id
                                  });
                                  // guarda al producto en la base de datos
                                  productoNuevo.save().then(function(pdt){
                                  }, function(err){ // si ocurre un error lo imprime
                                    console.log(err);
                                  });
                                }else{ // si paso algo
                                  if(err) console.log(err);
                                  if(prod) console.log("El producto "+productoExcel.nombre+" existe");
                                }
                              });
                            }, function(err){ // si ocurre un error lo imprime
                              console.log(err);
                            });

                          }else{ // si paso un error
                            console.log(err);
                            res.redirect("/products");
                          }
                        }
                      });
                    }
                  }
                  res.redirect("/products/new/excel");
                  //----------------------
                }else{
                  if(err) console.log(err);
                  res.redirect("/products");
                }
            });

          }catch(e){
            console.log(e);
            res.redirect("/products");
          }

        });

      });


module.exports = router;
