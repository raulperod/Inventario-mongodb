/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const SucursalModel = require("../models/sucursal"),
      UsuarioModel = require("../models/usuario"),
      AlmacenModel = require("../models/almacen"),
      MovimientoModel = require("../models/movimiento"),
      BajaModel = require("../models/baja"),
      Utilidad = require('../ayuda/utilidad')

function sucursalesGet(req, res) {
    // busca todas las sucursales de la base de datos
    SucursalModel.find({}).exec( (error,sucursales) => {
        if(error){ // si hubo error
            console.log(`Error al obtener las sucursales`) // imprimo el error
            res.redirect("/almacen") // redirecciono al inicio
        }else{ // si no hubo error
            res.render("./sucursales/manager",{ sucursales, usuario: req.session.user })
        }
    })
}

function sucursalesNewGet(req, res) {
    res.render('./sucursales/new', { usuario : req.session.user })
}

function sucursalesNewPost(req, res) {
    // validar que la sucursal no este repetida
    let sucursal = new SucursalModel({
        plaza: req.body.plaza,
        ciudad: req.body.ciudad
    })

    sucursal.save((error, nuevaSucursal) => {
        if(error){
            Utilidad.printError(res, {msg: `Error al guardar la nueva sucursal: ${error}`, tipo: 1})
        } else {
            res.json({ msg:"Se guardo la sucursal correctamente", tipo:3})
            // genero los almacenes
            generarAlmacenes(nuevaSucursal)
        }
    })
}

function sucursalesIdSucursalGet(req, res) {
    // busco la sucursal
    SucursalModel.findById(req.params.idSucursal).exec( (error, sucursalUpdate) => {
        if(error){ // si hubo error
            // imprimo el error y lo redirecciono al administrador de sucursales
            console.log(`Error al obtener la sucursal: ${error}`)
            res.redirect("/sucursales")
        }else{
            res.render("./sucursales/update",{sucursalUpdate, usuario: req.session.user })
        }
    })
}

function sucursalesIdSucursalPut(req, res) {
    // busco la sucursal
    let idSucursal = req.params.idSucursal,
        sucursalUpdate = {
            plaza: req.body.plaza,
            ciudad: req.body.ciudad
        }

    SucursalModel.findByIdAndUpdate(idSucursal,sucursalUpdate).exec( (error, sucursalUpdate) => {
        if(error){
            Utilidad.printError(res, {msg: `Error al actualizar la sucursal: ${error}`, tipo: 1})
        } else {
            // res.redirect('/sucursales')
            res.json({msg:"Sucursal actualizada correctamente", tipo:3})
        }
    })
}

function sucursalesIdSucursalDelete(req, res) {
    let sucursal = req.params.idSucursal

    UsuarioModel.remove({sucursal}).exec( error => {
        if(error) console.log(error)
    })
    BajaModel.remove({sucursal}).exec( error => {
        if(error) console.log(error)
    })
    MovimientoModel.remove({sucursal}).exec( error => {
        if(error) console.log(error)
    })
    AlmacenModel.remove({sucursal}).exec( error => {
        if(error) console.log(error)
    })
    SucursalModel.findByIdAndRemove(sucursal).exec( error => {
        if(error) console.log(error)
        res.redirect("/sucursales")
    })
}

function generarAlmacenes(nuevaSucursal) {
    // busco todos los productos registrados
    ProductModel.find({},{categoria:1}).exec( (error, productos) => {
        (error) ? (
            console.log(`Error al obtener los ids de los productos: ${error}`)
        ) : (
            productos.forEach(producto => generarAlmacen(nuevaSucursal._id, producto))
        )
    })
}

function generarAlmacen(sucursal, producto) {
    // genero un almacen, con la sucursal y el producto dado
    let nuevoAlmacen = new AlmacenModel({
        producto: producto._id,
        categoria: producto.categoria,
        sucursal
    })
    nuevoAlmacen.save( error => {
        if(error) console.log(`Error al crear el almacen: ${error}`)
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