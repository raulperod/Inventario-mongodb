/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const Tecnica = require("../models/tecnica"),
      Sucursal = require("../models/sucursal")

function tecnicasGet(req, res) {
    let usuario = req.session.user
    // si es administrador de sucursal
    if( usuario.permisos === 1){
        // busca todas las tecnicas de la sucursal del administrador
        Tecnica.find({sucursal: usuario.sucursal}).exec( (err, tecnicas) => {
            if(!err && tecnicas){ // si no hubo error
                // paso a las tecnicas a la vista
                res.render("./tecnicas/manager",{tecnicas, usuario})
            }else{ // si hubo error
                console.log(err) // imprimo el error
                res.redirect("/tecnicas/new") // redirecciono al almacen
            }
        })
    }else{ // si es administador general
        // busca a todas las tecnicas que existen
        Tecnica.find({}).populate("sucursal").exec( (err, tecnicas) => {
            if(!err && tecnicas){ // si no hubo error
                // paso a las tecnicas a la vista
                res.render("./tecnicas/manager",{tecnicas, usuario})
            }else{ // si hubo error
                console.log(err) // imprimo el error
                res.redirect("/tecnicas") // redirecciono al inicio
            }
        })
    }
}

function tecnicasNewGet(req, res) {
    let usuario = req.session.user
    // si es administrador general
    if( usuario.permisos === 2){
        // busca todas las sucursales
        Sucursal.find({}).exec( (err, sucursales) => {
            if(!err && sucursales ){ // si no hubo un error
                res.render("./tecnicas/new",{sucursales, usuario})
            }else if(!sucursales){ // si no hay sucursales
                res.redirect("/sucursales")
            }else{ // si hubo un error
                console.log(err)
                res.redirect("/users")
            }
        })
    }else{ // si es administador de sucursal
        res.render("./tecnicas/new", { usuario })
    }
}

function tecnicasNewPost(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 1){ // si es administador de sucursal
        // crea una Tecnica nueva con sus respectivos atributos
        let tecnica = new Tecnica({
            nombre: req.body.name,
            apellido: req.body.last_name,
            nombreCompleto: req.body.name + " " + req.body.last_name,
            sucursal: usuario.sucursal
        })
        // guarda la tecnica en la base de datos
        tecnica.save().then( tec => {
            res.redirect("/tecnicas")
        }, err => { // si ocurre un error lo imprime y redirecciona al almacen
            console.log(err)
            res.redirect("/almacen")
        })
    }else{ // si es administrador general
        // busca la sucursal con el nombre de la plaza
        Sucursal.findOne({ plaza: req.body.plaza }).exec( (err, sucursal) => {
            if(!err && sucursal){
                // crea una nueva tecnica con sus respectivos atributos
                let tecnica = new Tecnica({
                    nombre: req.body.name,
                    apellido: req.body.last_name,
                    nombreCompleto:req.body.name+" "+req.body.last_name,
                    sucursal: sucursal._id
                })
                // guarda la tecnica en la base de datos
                tecnica.save().then( tec => {
                    res.redirect("/tecnicas")
                }, err => { // si ocurre un error lo imprime
                    console.log(err)
                    res.redirect("/almacen")
                })
            }else if(!sucursal){ // si no existe la sucursal
                res.redirect("/sucursales")
            }else{ // si hubo un error
                console.log(err)
                res.redirect("/tecnicas")
            }
        })
    }
}

function tecnicasIdTecnicaGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 2){ // si es administador general
        Sucursal.find({}).exec( (err, sucursales) => { // busca todas las sucursales
            if(!err && sucursales){ // si no hubo error y existen sucursales
                // busco a la tecnica a editar
                Tecnica.findById(req.params.idTecnica).exec( (err, tecnicaUpdate) => {
                    if(!err && tecnicaUpdate){ // si no hubo error y la tecnica existe
                        res.render("./tecnicas/update",{sucursales ,tecnicaUpdate, usuario});
                    }else{ // si hubo error o la tecnica no existe
                        // imprimo el error y lo redirecciono a la lista de tecnicas
                        if(err) console.log(err)
                        res.redirect("/tecnicas")
                    }
                })
            }else if(!sucursales){ // si no existe la sucursal
                res.redirect("/sucursales")
            }else{ // si hubo un error lo imprime
                console.log(err)
                res.redirect("/tecnicas")
            }
        })
    }else{ // si es administrador de sucursal
        // busco a la tecnica a editar
        Tecnica.findById(req.params.idTecnica).exec( (err, tecnicaUpdate) => {
            if(!err && tecnicaUpdate){ // si no hubo error y la tecnica existe
                res.render("./tecnicas/update",{tecnicaUpdate, usuario})
            }else{ // si hubo error o la tecnica no existe
                // imprimo el error y lo redirecciono a la lista de tencias
                if(err) console.log(err)
                res.redirect("/tecnicas")
            }
        })
    }
}

function tecnicasIdTecnicaPut(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 2){ // si es administrador general
        Sucursal.findOne({plaza:req.body.plaza}).exec( (err, sucursal) => { // busco la sucursal
            if(!err && sucursal){ // si no hubo error y la sucursal existe
                // busco al usuario
                Tecnica.findById(req.params.idTecnica).exec( (err, tecnica) => {
                    if(!err && tecnica){ // si no hubo error y la tecnica existe
                        res.locals.tecnicaUpdate = tecnica
                        res.locals.tecnicaUpdate.nombre = req.body.name
                        res.locals.tecnicaUpdate.apellido = req.body.last_name
                        res.locals.tecnicaUpdate.nombreCompleto = req.body.name+" "+req.body.last_name
                        res.locals.tecnicaUpdate.sucursal = sucursal._id
                        res.locals.tecnicaUpdate.save( err => {
                            if(err) console.log(err)
                            res.redirect("/tecnicas")
                        })
                    }else{ // si hubo un error
                        if(err) console.log(err)
                        res.redirect("/tecnicas")
                    }
                })
            }else if(!sucursal){ // si no existe la sucursal
                res.redirect("/sucursales")
            }else{ // si hubo un error lo imprime
                console.log(err)
                res.redirect("/tecnicas")
            }
        })

    }else{ // si es administrador de sucursal

        // busco a la tecnica
        Tecnica.findById(req.params.idTecnica).exec( (err,tecnica) => {
            if(!err && tecnica){ // si no hubo error y el usuario existe
                res.locals.tecnicaUpdate = tecnica
                res.locals.tecnicaUpdate.nombre = req.body.name
                res.locals.tecnicaUpdate.apellido = req.body.last_name
                res.locals.tecnicaUpdate.nombreCompleto = req.body.name+" "+req.body.last_name
                res.locals.tecnicaUpdate.save( err => {
                    if(err) console.log(err)
                    res.redirect("/tecnicas")
                })
            }else{ // si hubo error
                if(err) console.log(err)
                res.redirect("/tecnicas")
            }
        })
    }
}

module.exports = {
    tecnicasGet,
    tecnicasNewGet,
    tecnicasNewPost,
    tecnicasIdTecnicaGet,
    tecnicasIdTecnicaPut
}