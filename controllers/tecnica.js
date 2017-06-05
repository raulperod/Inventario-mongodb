/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const TecnicaModel = require("../models/tecnica"),
      SucursalModel = require("../models/sucursal"),
      Utilidad = require('../ayuda/utilidad')

function tecnicasGet(req, res) {
    let usuario = req.session.user
    // si es administrador de sucursal
    if( usuario.permisos === 1){
        // busca todas las tecnicas de la sucursal del administrador
        TecnicaModel.find({sucursal: usuario.sucursal},{sucursal:0}).exec( (error, tecnicas) => {
            if(error){ // si hubo error
                console.log(`Error al obtener las tecnicas: ${error}`)
                res.redirect("/almacen") // redirecciono al almacen
            }else{ // si no hubo error
                res.render("./tecnicas/manager",{tecnicas, usuario})
            }
        })
    }else{ // si es administador general
        // busca a todas las tecnicas que existen
        TecnicaModel.find({}).populate('sucursal','plaza').exec( (error, tecnicas) => {
            if(error){ // si hubo error
                console.log(`Error al obtener las tecnicas: ${error}`)
                res.redirect("/almacen") // redirecciono al inicio
            }else{ // si no hubo error
                res.render("./tecnicas/manager",{tecnicas, usuario})
            }
        })
    }
}

function tecnicasNewGet(req, res) {
    let usuario = req.session.user
    // si es administrador general
    if( usuario.permisos === 2){
        // busca las plazas de las sucursales
        SucursalModel.find({},{_id:0, plaza:1}).exec( (error, sucursales) => {
            if(error){ // si hubo un error
                console.log(`Error al obtener las sucursales: ${error}`)
                res.redirect("/users")
            }else{ // si no hubo un error
                res.render("./tecnicas/new",{sucursales, usuario})
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
        let tecnica = new TecnicaModel({
            nombre: req.body.name,
            apellido: req.body.last_name,
            sucursal: usuario.sucursal
        })
        // guarda la tecnica en la base de datos
        createTecnica(res, tecnica)
    }else{ // si es administrador general
        // busca el id de la sucursal con el nombre de la plaza
        SucursalModel.findOne({plaza:req.body.plaza},{_id:1}).exec((error, sucursal) => {
            if(error){ // si hubo un error
                console.log(`Error al obtener la sucursal: ${error}`)
                res.redirect("/tecnicas")
            }else{ // si no hubo un error
                // crea una Tecnica nueva con sus respectivos atributos
                let tecnica = new TecnicaModel({
                    nombre: req.body.name,
                    apellido: req.body.last_name,
                    sucursal: sucursal._id
                })
                // guarda la tecnica en la base de datos
                createTecnica(res, tecnica)
            }
        })
    }
}

function tecnicasIdTecnicaGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 2){ // si es administador general
        SucursalModel.find({},{_id:0, plaza:1}).exec( (error, sucursales) => { // busca todas las sucursales
            if(error){ // si hubo error
                console.log(`Error al obtener la sucursal: ${error}`)
                res.redirect("/tecnicas")
            }else{ // si hubo un error lo imprime
                // busco a la tecnica a editar
                TecnicaModel.findById(req.params.idTecnica).exec( (error, tecnicaUpdate) => {
                    if(error){ // si hubo error
                        console.log(`Error al obtener la tecnica: ${error}`)
                        res.redirect("/tecnicas")
                    }else{ // si no hubo error
                        res.render("./tecnicas/update",{sucursales ,tecnicaUpdate, usuario})
                    }
                })
            }
        })
    }else{ // si es administrador de sucursal
        // busco a la tecnica a editar
        TecnicaModel.findById(req.params.idTecnica).exec( (error, tecnicaUpdate) => {
            if(error){ // si hubo error
                console.log(`Error al obtener la tecnica: ${error}`)
                res.redirect("/tecnicas")
            }else{ // si no hubo error
                res.render("./tecnicas/update",{ tecnicaUpdate, usuario})
            }
        })
    }
}

function tecnicasIdTecnicaPut(req, res) {
    let usuario = req.session.user,
        body = req.body,
        idTecnica = req.params.idTecnica

    if( usuario.permisos === 2){ // si es administrador general
        SucursalModel.findOne({plaza:body.plaza},{_id:1}).exec((error, sucursal) => {
            if(error){ // si hubo error
                Utilidad.printError(res, {msg:`Error al obtener la sucursal: ${error}`, tipo: 0})
            }else{ // si no hubo error
                let tecnica = {
                    nombre: body.name,
                    apellido: body.last_name,
                    sucursal: sucursal._id
                }
                // actualiza a la tecnica
                updateTecnica(res, idTecnica, tecnica)
            }
        })

    }else{ // si es administrador de sucursal
        let tecnica = {
            nombre: body.name,
            apellido: body.last_name
        }
        // actualiza a la tecnica
        updateTecnica(res, idTecnica, tecnica)
    }
}

function createTecnica(res, tecnica) {
    // guarda la tecnica en la base de datos
    tecnica.save().then( (error, nuevaTecnica) => {
        if(error){
            Utilidad.printError(res, {msg:`Error al guardar la tecnica`, tipo:0})
        }else{
            res.redirect('/tecnicas')
            // generar basicos
        }
    })
}

function updateTecnica(res, idTecnica, tecnica) {
    // actualiza la tecnica
    TecnicaModel.findByIdAndUpdate(idTecnica, tecnica).exec((error, tecnicaUpdate) => {
        if(error){ // si hubo error
            Utilidad.printError(res, {msg:`Error al actualizar la tecnica: ${error}`, tipo: 0})
        }else{ // si no hubo error
            res.redirect('/tecnicas')
        }
    })
}

module.exports = {
    tecnicasGet,
    tecnicasNewGet,
    tecnicasNewPost,
    tecnicasIdTecnicaGet,
    tecnicasIdTecnicaPut
}