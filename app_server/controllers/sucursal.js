/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const Sucursal = require("../models/sucursal"),
      Usuario = require("../models/usuario"),
      Almacen = require("../models/almacen"),
      Consumo = require("../models/consumo"),
      RegistroDeMovimiento = require("../models/registroDeMovimiento"),
      Baja = require("../models/baja")

function sucursalesGet(req, res) {
    // busca todas las sucursales de la base de datos
    Sucursal.find({}).exec( (err,sucursales) => {
        if(!err){ // si no hubo error
            res.render("./sucursales/manager",{sucursales, usuario: req.session.user })
        }else{ // si hubo error
            console.log(err) // imprimo el error
            res.redirect("/almacen") // redirecciono al inicio
        }
    })
}

function sucursalesNewGet(req, res) {
    res.render('./sucursales/new', { alertSucursal: false, usuario : req.session.user })
}

function sucursalesNewPost(req, res) {
    // validar que la sucursal no este repetida
    Sucursal.findOne({ plaza: req.body.plaza, ciudad: req.body.ciudad }).exec( (err, sucursal) => {
        if(!err && !sucursal){ // si no hay error y no hay sucursal repetida
            // crea una sucursal nueva con sus respectivos atributos
            let sucursal = new Sucursal({
                plaza: req.body.plaza,
                ciudad: req.body.ciudad
            })
            // guarda la sucursal en la base de datos
            sucursal.save().then( (suc) => {
                res.redirect("/sucursales")
            }, err => { // si ocurre un error lo imprime
                console.log(err)
            })
        }else{ // si hubo un error
            if(sucursal){ // si la sucursal ya existe
                res.render("./sucursales/new",{ usuario : req.session.user, alertSucursal:true,plaza:req.body.plaza,ciudad:req.body.ciudad})
            }else{ // si hubo un error
                console.log(err)
                res.redirect("/sucursales/new")
            }
        }
    })
}

function sucursalesIdSucursalGet(req, res) {
    // busco la sucursal
    Sucursal.findById(req.params.idSucursal).exec( (err, sucursalUpdate) => {
        if(!err && sucursalUpdate){ // si no hubo error y la sucursal existe
            res.render("./sucursales/update",{sucursalUpdate, usuario: req.session.user , alertSucursal:false})
        }else{
            // imprimo el error y lo redirecciono al administrador de sucursales
            if(err) console.log(err)
            res.redirect("/sucursales")
        }
    })
}

function sucursalesIdSucursalPut(req, res) {
    // busco la sucursal
    Sucursal.findById(req.params.idSucursal).exec( (err, sucursal) => {
        if(!err && sucursal){ // si no hay error y la sucursal a editar existe
            Sucursal.findOne({plaza:req.body.plaza,ciudad:req.body.ciudad}).exec( (err, sucursalC) => {
                if(!err && !sucursalC){ // si no hay error y no existe una sucursal con los mismos campos
                    // edito la sucursal
                    res.locals.sucursalUpdate = sucursal
                    res.locals.sucursalUpdate.plaza = req.body.plaza
                    res.locals.sucursalUpdate.ciudad = req.body.ciudad
                    res.locals.sucursalUpdate.save( err => {
                        if(err) console.log(err)
                        res.redirect("/sucursales")
                    })
                }else{
                    if(sucursalC){
                        res.render("./sucursales/update",{ usuario: req.session.user, id:req.params.idSucursal,alertSucursal:true,plaza:req.body.plaza,ciudad:req.body.ciudad})
                    }else{
                        console.log(err)
                        res.redirect("/sucursales")
                    }
                }
            })
        }else{
            if(err) console.log(err)
            res.redirect("/sucursales")
        }
    })
}

function sucursalesIdSucursalDelete(req, res) {
    let sucursal = req.params.idSucursal

    Usuario.remove({sucursal}).exec( err => {
        if(err) console.log(err)
    })
    Baja.remove({sucursal}).exec( err => {
        if(err) console.log(err)
    })
    RegistroDeMovimiento.remove({sucursal}).exec( err => {
        if(err) console.log(err)
    })
    Consumo.remove({sucursal}).exec( err => {
        if(err) console.log(err)
    })
    Almacen.remove({sucursal}).exec( err => {
        if(err) console.log(err)
    })
    Sucursal.findOneAndRemove({_id: sucursal}).exec( err => {
        if(err) console.log(err)
        res.redirect("/sucursales")
    })
}

module.exports = {
    sucursalesGet,
    sucursalesNewGet,
    sucursalesNewPost,
    sucursalesIdSucursalGet,
    sucursalesIdSucursalPut,
    sucursalesIdSucursalDelete
}