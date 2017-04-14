/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const Categoria = require("../models/categoria"),
      Producto = require("../models/producto"),
      Almacen = require("../models/almacen"),
      Consumo = require("../models/consumo"),
      RegistroDeMovimiento = require("../models/registroDeMovimiento"),
      Baja = require("../models/baja")

function productsGet(req, res) {
    // busca todos los productos de la base de datos
    Producto.find({}).populate("categoria").exec( (err, productos) => {
        if(!err){ // si no hubo error
            // paso a los productos a la vista
            res.render("./products/manager",{ productos, usuario: req.session.user })
        }else{ // si hubo error
            if(err) console.log(err) // imprimo el error
            res.redirect("/almacen") // redirecciono al almacen
        }
    })
}

function productsNewGet(req, res) {
    // busca todas las categorias
    Categoria.find({}).exec( (err, categorias) => {
        if(!err && categorias){ // si no hay error y hay categorias
            res.render("./products/new",{ usuario: req.session.user, categorias, AlertNombre: false, AlertCodigo: false})
        }else{ // si hubo un error
            if(!categorias){ // si no hay categorias
                res.redirect("/categories/new") // se redirecciona a crear una
            }else{ // si hubo un error
                console.log(err)
                res.redirect("/products")
            }
        }
    })
}

function productsNewPost(req, res) {
    // crea un producto
    // validar que existe un prodcuto con el mismo nombre o el mismo codigo
    Producto.findOne({ $or: [ { nombre: req.body.nombre } , { codigo: req.body.codigo } ] } ).exec( (err, producto) => {
        // si no hay error y no hay producto repetido, entonces lo crea
        if(!err && !producto){
            // busca la sucursal para
            Categoria.findOne({ nombre: req.body.categoria }).exec( (err, categoria) => {
                if(!err && categoria){
                    // crea un producto nuevo con sus respectivos atributos
                    let producto = new Producto({
                        nombre: req.body.nombre,
                        codigo: req.body.codigo,
                        descripcion: req.body.descripcion,
                        minimo: parseInt(req.body.minimo),
                        categoria: categoria._id,
                        esBasico: req.body.esBasico === "Si"
                    })
                    // guarda al producto en la base de datos
                    producto.save().then( pro => {
                        res.redirect("/products")
                    }, err => { // si ocurre un error lo imprime
                        console.log(err)
                    })
                }else{ // si hubo un error
                    if(!categoria){ // si no existe la categoria
                        res.redirect("/categories/new")
                    }else{ // si hubo un error
                        console.log(err)
                        res.redirect("/products")
                    }
                }
            })
        }else{
            if(producto){ // si el producto ya existe
                // busca todas las categorias
                Categoria.find({}).exec( (err, categorias) => {
                    if(!err && categorias){ // si no hay error y hay categorias
                        if(producto.nombre === req.body.nombre){ // si lo que se repitio fue el nombre
                            res.render("./products/new",{usuario: req.session.user, categorias, AlertNombre: true, AlertCodigo: false, nombre: req.body.nombre, codigo: req.body.codigo, descripcion: req.body.descripcion, minimo:req.body.minimo, esBasico: req.body.esBasico})
                        }else{// si lo que se repitio fue el codigo
                            res.render("./products/new",{ usuario: req.session.user, categorias, AlertNombre: false, AlertCodigo: true, nombre: req.body.nombre, codigo: req.body.codigo, descripcion: req.body.descripcion, minimo: req.body.minimo, esBasico: req.body.esBasico })
                        }
                    }else{ // si hubo un error
                        if(!categorias){ // si no hay categorias
                            res.redirect("/categories/new") // se redirecciona a crear una
                        }else{ // si hubo un error
                            console.log(err)
                            res.redirect("/products")
                        }
                    }
                })
            }else{ // si hubo un error
                console.log(err)
                res.redirect("/products")
            }
        }
    })
}

function productsIdProductoGet(req, res) {
    // busco todas las categorias
    Categoria.find({}).exec( (err,categorias) => {
        if(!err && categorias){ // si no hay error y hay categorias
            // busco al producto
            Producto.findById(req.params.idProducto).exec( (err, productoUpdate) => {
                if(!err && productoUpdate){ // si no hay error y el producto existe
                    res.render("./products/update",{categorias, productoUpdate, AlertNombre: false, AlertCodigo: false })
                }else{ // si hubo un error
                    if(!productoUpdate){ // si no hay producto
                        res.redirect("/products/new")
                    }else{ // si hubo un error
                        console.log(err)
                        res.redirect("/products")
                    }
                }
            })
        }else{ // si hubo un error
            if(!categorias){ // si no hay categorias
                res.redirect("/categories/new")
            }else{ // si hubo un error
                console.log(err)
                res.redirect("/products")
            }
        }
    })
}

function productsIdProductoPut(req, res) {
    Categoria.findOne({ nombre: req.body.categoria }).exec( (err, categoria) => {
        if(!err && categoria){
            //verificar que no se repita el nombre ni el codigo
            Producto.findById(req.params.idProducto).exec( (err, producto) => {
                if(!err && producto){ // si no hay error y el producto existe
                    if(producto.nombre === req.body.nombre && producto.codigo === req.body.codigo){ // si no modifico el nombre ni el codigo
                        // edito el producto
                        res.locals.productoUpdate = producto
                        res.locals.productoUpdate.descripcion = req.body.descripcion
                        res.locals.productoUpdate.minimo = parseInt(req.body.minimo)
                        res.locals.productoUpdate.categoria = categoria._id
                        res.locals.productoUpdate.esBasico = req.body.esBasico === "Si"
                        res.locals.productoUpdate.save( err => {
                            if(err) console.log(err)
                            res.redirect("/products")
                        })

                    }else if(producto.nombre !== req.body.nombre && producto.codigo === req.body.codigo){ // si modifico el nombre y el codigo es el mismo
                        // verifico si el nombre esta repetido
                        Producto.findOne({ nombre: req.body.nombre }).exec( (err, p) => {
                            if(!err && !p){ // si no hay error y el nombre no se repite
                                // edito el producto
                                res.locals.productoUpdate = producto
                                res.locals.productoUpdate.nombre = req.body.nombre
                                res.locals.productoUpdate.descripcion = req.body.descripcion
                                res.locals.productoUpdate.minimo = parseInt(req.body.minimo)
                                res.locals.productoUpdate.categoria = categoria._id
                                res.locals.productoUpdate.esBasico = req.body.esBasico === "Si"
                                res.locals.productoUpdate.save( err => {
                                    if(err) console.log(err)
                                    res.redirect("/products")
                                })
                            }else{ // si paso algo
                                if( p ){ //si se repite el nombre
                                    Categoria.find({}).exec( (err, categorias) => {
                                        if(!err && categorias){ //si no hay error y hay categorias
                                            res.render("./products/update",{ usuario: req.session.user, categorias, AlertNombre:true,AlertCodigo:false,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto,esBasico:req.body.esBasico})
                                        }else{ // si paso algo
                                            if(!categorias){ // si no hay categorias
                                                res.redirect("/categories/new")
                                            }else{ // si hubo un error
                                                console.log(err)
                                                res.redirect("/products")
                                            }
                                        }
                                    })
                                }else{ // si hubo un error
                                    console.log(err)
                                    res.redirect("/products")
                                }
                            }
                        })

                    }else if(producto.nombre === req.body.nombre && producto.codigo !== req.body.codigo){ // si modifico el codigo y el nombre es el mismo
                        // verifico si el codigo esta repetido
                        Producto.findOne({codigo:req.body.codigo}).exec( (err, p) => {
                            if(!err && !p){ // si hubo error y no se repite el codigo
                                // edito el producto
                                res.locals.productoUpdate = producto
                                res.locals.productoUpdate.codigo = req.body.codigo
                                res.locals.productoUpdate.descripcion = req.body.descripcion
                                res.locals.productoUpdate.minimo = parseInt(req.body.minimo)
                                res.locals.productoUpdate.categoria = categoria._id
                                res.locals.productoUpdate.esBasico = req.body.esBasico === "Si"
                                res.locals.productoUpdate.save( err => {
                                    if(err) console.log(err)
                                    res.redirect("/products")
                                })
                            }else{
                                if( p ){ //si se repite el codigo
                                    Categoria.find({}).exec( (err, categorias) => {
                                        if(!err && categorias){ // si no hubo error
                                            res.render("./products/update",{ usuario: req.session.user, categorias,AlertNombre:false,AlertCodigo:true,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto,esBasico:req.body.esBasico})
                                        }else{ // si paso algo
                                            if(!categorias){ // si no hay categorias
                                                res.redirect("/categories/new")
                                            }else{ // si hubo un error
                                                console.log(err)
                                                res.redirect("/products")
                                            }
                                        }
                                    })
                                }else{ // si hubo un error
                                    console.log(err)
                                    res.redirect("/products")
                                }
                            }
                        })

                    }else{ // si modifico ambos

                        // verifico si el codigo  o el nombre esta repetido
                        Producto.findOne({ $or: [ {nombre:req.body.nombre} , {codigo:req.body.codigo} ] }).exec( (err, p) => {
                            if(!err && !p){ // si no hubo error y no se repite el nombre o el codigo
                                // edito el producto
                                res.locals.productoUpdate = producto
                                res.locals.productoUpdate.nombre = req.body.nombre
                                res.locals.productoUpdate.codigo = req.body.codigo
                                res.locals.productoUpdate.descripcion = req.body.descripcion
                                res.locals.productoUpdate.minimo = parseInt(req.body.minimo)
                                res.locals.productoUpdate.categoria = categoria._id
                                res.locals.productoUpdate.esBasico = req.body.esBasico === "Si"
                                res.locals.productoUpdate.save( err => {
                                    if(err) console.log(err)
                                    res.redirect("/products")
                                })
                            }else{ // si paso algo
                                if( p ){ //si se repite el codigo
                                    Categoria.find({}).exec( (err, categorias) => {
                                        if(!err && categorias){ // si no hubo error
                                            if(p.nombre === req.body.nombre ){ // si se repite el nombre
                                                res.render("./products/update",{usuario: req.session.user, categorias,AlertNombre:true,AlertCodigo:false,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto,esBasico:req.body.esBasico});
                                            }else{ // si se repite el codigo
                                                res.render("./products/update",{usuario: req.session.user, categorias,AlertNombre:false,AlertCodigo:true,nombre:req.body.nombre,codigo:req.body.codigo,descripcion:req.body.descripcion,minimo:req.body.minimo,id:req.params.idProducto,esBasico:req.body.esBasico});
                                            }
                                        }else{ // si paso algo
                                            if(!categorias){ // si no hay categorias
                                                res.redirect("/categories/new")
                                            }else{ // si hubo un error
                                                console.log(err)
                                                res.redirect("/products")
                                            }
                                        }
                                    })
                                }else{ // si hubo error
                                    console.log(err)
                                    res.redirect("/products")
                                }
                            }
                        })

                    }
                }else{ // si hubo un error
                    if(err) console.log(err)
                    res.redirect("/products")
                }
            })
        }else{ // si hubo un error
            if(err) console.log(err)
            res.redirect("/products")
        }
    })
}

function productsIdProductoDelete(req, res) {
    // borra las bajas produccidas por el producto
    let producto = req.params.idProducto
    Baja.remove({producto}).exec( err => {
        if(err) console.log(err)
    })
    // borra los movimientos produccidos por el producto
    RegistroDeMovimiento.remove({producto}).exec( err => {
        if(err) console.log(err)
    })
    // borra los productos en consumo del producto
    Consumo.remove({producto}).exec( err => {
        if(err) console.log(err)
    })
    // borra los productos en el almacen del producto
    Almacen.remove({producto}).exec( err => {
        if(err) console.log(err)
    })
    // borra el producto
    Producto.findOneAndRemove({_id: producto}).exec( err => {
        if(err) console.log(err)
        res.redirect("/products")
    })
}

module.exports = {
    productsGet,
    productsNewGet,
    productsNewPost,
    productsIdProductoGet,
    productsIdProductoPut,
    productsIdProductoDelete
}