/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const CategoriaModel = require("../models/categoria"),
      ProductoModel = require("../models/producto"),
      AlmacenModel = require("../models/almacen"),
      MovimientoModel = require("../models/movimiento"),
      BajaModel = require("../models/baja"),
      Utilidad = require("../ayuda/utilidad")

function categoriesGet(req, res) {
    // muestra la lista de categorias
    CategoriaModel.find({}).exec( (error, categorias) => {
        if(error){ // si no hubo error
            console.log(`Error al obtener las categorias`) // imprimo el error
            res.redirect("/almacen") // redirecciono al almacen
        }else{ // si hubo error
            res.render("./categories/manager",{categorias, usuario: req.session.user })
        }
    })
}

function categoriesNewGet(req, res) {
    res.render("./categories/new",{ usuario: req.session.user})
}

function categoriesNewPost(req, res) {
    // si no hay categoria repetida, entonces la crea
    // crea una categoria nueva con sus respectivos atributos
    let categoria = new CategoriaModel({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion
    })
    // guarda la categoria en la base de datos
    categoria.save( error => {
        if(error){
            Utilidad.printError(res, {msg:`Error al guardar el producto: ${error}`, tipo:1})
        }else{
            res.json({msg:"Productos guardados correctamente", tipo:3})
        }
    })
}

function categoriesIdCategoryGet(req, res) {
    // busco la categoria
    CategoriaModel.findById(req.params.idCategoria).exec( (error, categoryUpdate) => {
        if(error){// si no hubo error y la categoria existe
            console.log(err)
            res.redirect("/categories")
        }else{
            res.render("./categories/update",{ usuario: req.session.user, categoryUpdate})
        }
    })
}

function categoriesIdCategoryPut(req, res) {
    // obtengo el id
    let idCateroria = req.params.idCategoria
    // creo la categoria actualizada
    let categoriaUpdate = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion
    }
    // actualizo la categoria
    CategoriaModel.findByIdAndUpdate(idCateroria, categoriaUpdate).exec((error, categoriaUp) => {
        if(error){
            Utilidad.printError(res, {msg:`Error al actualizar la categoria: ${error}`, tipo:1})
        }else{
            res.json({msg:`Categoria actualizada correctamente`, tipo:3})
        }
    })
}

function categoriesIdCategoryDelete(req, res) {
    // busco todos los productos que tengan la catedoria
    ProductoModel.find({categoria:req.params.idCategoria}).exec( (error, productos) => {
        if(error){ // si paso un error
            console.log(`Error al borrar categoria: ${error}`)
            res.redirect("/categories")
        }else{  // si no hubo error
            // borro en cascada todos lo que contenia esa categoria
            productos.forEach( producto => {
                // borro los usos con las tecnicas en caso
                BasicoModel.remove({producto}).exec( error => { if(error) console.log(error) })
                // borro el historial de bajas de ese producto
                BajaModel.remove({producto: producto._id}).exec( error => { if(error) console.log(error) })
                // borro los movimientos de ese producto
                MovimientoModel.remove({producto:producto._id}).exec( error => { if(error) console.log(error) })
                // borro los almacenes de ese producto
                AlmacenModel.remove({producto:producto._id}).exec( error => { if(error) console.log(error) })
                // borro el producto
                ProductoModel.findByIdAndRemove(producto._id).exec( error => { if(error) console.log(error) })
            })
        }
    })
    // por ultimo borro la categoria
    CategoriaModel.findByIdAndRemove(req.params.idCategoria).exec( error => {
        (error) ? console.log(`Error al borrar categoria: ${error}`) : res.redirect("/categories")
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