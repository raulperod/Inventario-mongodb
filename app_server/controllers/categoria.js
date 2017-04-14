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

}

function categoriesIdCategoryPut(req, res) {

}

function categoriesIdCategoryDelete(req, res) {

}

module.exports = {
    categoriesGet,
    categoriesNewGet,
    categoriesNewPost,
    categoriesIdCategoryGet,
    categoriesIdCategoryPut,
    categoriesIdCategoryDelete
}