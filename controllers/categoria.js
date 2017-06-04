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

function categoriesGet(req, res) {
    // muestra la lista de categorias
    Categoria.find({}).exec( (err,categorias) => {
        if(!err){ // si no hubo error
            res.render("./categories/manager",{categorias, usuario: req.session.user })
        }else{ // si hubo error
            console.log(err) // imprimo el error
            res.redirect("/almacen") // redirecciono al almacen
        }
    })
}

function categoriesNewGet(req, res) {
    res.render("./categories/new",{ usuario: req.session.user, AlertNombre: false})
}

function categoriesNewPost(req, res) {
    // validar que el nombre no este repetida
    Categoria.findOne({ nombre: req.body.nombre }).exec( (err, categoria) => {
        if(!err && !categoria){
            // si no hay categoria repetida, entonces la crea
            // crea una categoria nueva con sus respectivos atributos
            let categoria = new Categoria({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion
            })
            // guarda la categoria en la base de datos
            categoria.save().then( cat => {
                res.redirect("/categories")
            }, err => { // si ocurre un error lo imprime
                console.log(err)
            })
        }else{ // si paso algo
            if(categoria){ // si el nombre de la categoria se repite
                res.render("./categories/new",{ usuario: req.session.user, AlertNombre: true, nombre: req.body.nombre, descripcion: req.body.descripcion })
            }else{// si paso un error
                console.log(err)
                res.redirect("/categories/new")
            }
        }
    })
}

function categoriesIdCategoryGet(req, res) {
    // busco la categoria
    Categoria.findById(req.params.idCategoria).exec( (err, categoryUpdate) => {
        if(!err && categoryUpdate){// si no hubo error y la categoria existe
            res.render("./categories/update",{ usuario: req.session.user, categoryUpdate, AlertNombre:false})
        }else{
            // imprimo el error y lo redirecciono al administrador de sucursales
            if(err) console.log(err)
            res.redirect("/categories")
        }
    })
}

function categoriesIdCategoryPut(req, res) {
    // busco la categoria
    Categoria.findById(req.params.idCategoria).exec( (err,categoria) => {
        if(!err && categoria){// si no hay error y la categoria existe
            if(categoria.nombre === req.body.nombre){ // si no modifico su nombre
                res.locals.categoryUpdate = categoria
                res.locals.categoryUpdate.descripcion = req.body.descripcion
                res.locals.categoryUpdate.save( err => {
                    if(err) console.log(err)
                    res.redirect("/categories")
                })
            }else{ // si modifico su nombre
                // verifica que el nuevo nombre no este repetido
                Categoria.findOne({nombre:req.body.nombre}).exec( (err, categoriaNew) => {
                    if(!err && !categoriaNew){
                        // si no se repite entonces actualizo la categoria
                        res.locals.categoryUpdate = categoria
                        res.locals.categoryUpdate.nombre = req.body.nombre
                        res.locals.categoryUpdate.descripcion = req.body.descripcion
                        res.locals.categoryUpdate.save( err => {
                            if(err) console.log(err)
                            res.redirect("/categories")
                        })
                    }else{ // si paso algo
                        if(categoriaNew){ // si hay una categoria con el nuevo nombre
                            // mando una alerta
                            res.render("./categories/update",{ usuario: req.session.user, AlertNombre: true, nombre: req.body.nombre, descripcion: req.body.descripcion, id: req.params.idCategoria})
                        }else{ // si hay error
                            console.log(err)
                            res.redirect("/categoria")
                        }
                    }
                })
            }
        }else{ // si paso algo
            if(err) console.log(err)
            res.redirect("/categories")
        }
    })
}

function categoriesIdCategoryDelete(req, res) {
    // busco todos los productos que tengan la catedoria
    Producto.find({categoria:req.params.idCategoria}).exec( (err, productos) => {
        if(!err && productos){
            // borro todos los productos de la categoria a eliminar
            for(let producto of productos){
                Baja.remove({producto: producto._id}).exec( err => {
                    if(err) console.log(err)
                })
                RegistroDeMovimiento.remove({producto:producto._id}).exec( err => {
                    if(err) console.log(err)
                })
                Consumo.remove({producto:producto._id}).exec( err => {
                    if(err) console.log(err)
                })
                Almacen.remove({producto:producto._id}).exec( err => {
                    if(err) console.log(err)
                })
                Producto.findOneAndRemove({_id:producto._id}).exec( err => {
                    if(err) console.log(err)
                })
            }
        }else{ // si paso un error
            if(err) console.log(err) // imprimo el error
            res.redirect("/categories")
        }
    })
    // por ultimo borro la categoria
    Categoria.findOneAndRemove({_id: req.params.idCategoria}).exec( err => {
        if(err) console.log(err)
        res.redirect("/categories")
    })
}

module.exports = {
    categoriesGet,
    categoriesNewGet,
    categoriesNewPost,
    categoriesIdCategoryGet,
    categoriesIdCategoryPut,
    categoriesIdCategoryDelete
}