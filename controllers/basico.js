/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const AlmacenModel = require("../models/almacen"),
      MovimientoModel = require("../models/movimiento"),
      TecnicaModel = require('../models/tecnica'),
      ProductModel = require('../models/producto'),
      BajaBasicoModel = require("../models/bajaBasico"),
      BasicoModel = require("../models/basico"),
      Utilidad = require('../ayuda/utilidad')

function basicosGet(req, res) {
    let usuario = req.session.user
    // busco las tecnicas de la sucursal del usuario
    TecnicaModel.find({ sucursal: usuario.sucursal },{sucursal:0}).exec( (error, tecnicas) => {
        if(error){ // si no hubo error y existen tecnicas
            console.log(`Error al obtener las tecnicas: ${error}`)
            res.redirect("/tecnicas/new")
        }else{ // si paso algun error
            // salvo las tecnicas
            req.session.tecnicas = tecnicas
            // busca los productos basicos
            ProductModel.find({ esBasico: true }, { nombre:1,categoria:1 }).exec( (error, productos) => {
                if(error){ // si hubo error
                    console.log(`Error al obtener los basicos: ${error}`)
                    res.redirect("/producto/new")
                }else{ // si no hubo error
                    // salvo las tecnicas
                    req.session.productos = productos
                    res.render("./basicos/manager",{ usuario, tecnicas ,productos })
                }
            })
        }
    })
}

function basicosPut(req, res) {
    let nombreTecnica = req.body.tecnica,
        nombreProducto = req.body.producto,
        sucursal = req.session.user.sucursal,
        tecnicas = req.session.tecnicas,
        productos = req.session.productos,
        tecnica =  obtenerIdTecnica(nombreTecnica,tecnicas),
        producto = obtenerIdsBasico(nombreProducto, productos),
        basico = null,
        promesa = new Promise((resolve, reject) =>{
            // busco el basico en uso
            BasicoModel.findOne({sucursal,tecnica,producto: producto._id},{enUso:1}).exec((error, basico) => {
                return(error) ? reject({msg:`Error al obtener el basico en uso: ${error}`, tipo: 0}) : resolve(basico)
            })
        })
    promesa
        .then(resolved => {
            return new Promise((resolve, reject) =>{
                basico = resolved
                if(basico.enUso){
                    return reject({msg:`Error el producto esta en uso`, tipo: 11})
                }else{
                    // busco en el almacen si hay productos disponibles
                    AlmacenModel.findOne({sucursal,producto: producto._id},{cantidadAlmacen:1,cantidadConsumo:1}).exec((error, almacen) => {
                        return(error) ? reject({msg:`Error al obtener el almacen: ${error}`, tipo: 0}) : resolve(almacen)
                    })
                }
            })
        })
        .then(almacen => {
            return new Promise((resolve, reject) =>{
                if(almacen.cantidadAlmacen > 0){
                    // se hacen los cambios necesarios
                    almacen.cantidadAlmacen--
                    almacen.cantidadConsumo++
                    AlmacenModel.findByIdAndUpdate(almacen._id, almacen).exec( error => {
                        return(error) ? reject({msg:`Error al actualizar el almacen: ${error}`,tipo: 0}) : resolve(true)
                    })
                } else {
                    // se manda una alerta de que no hay productos
                    return reject({msg:`Error no hay productos disponibles`, tipo: 12})
                }
            })
        })
        .then(resolved => {
            return new Promise((resolve, reject) => {
                // se genera el movimiento
                let movimiento = new MovimientoModel({
                    sucursal,
                    usuario: req.session.user._id,
                    tecnica,
                    producto: producto._id,
                    categoria: producto.categoria,
                    cantidad: 1,
                    tipo: 0
                })
                movimiento.save( error => {
                    return(error) ? ( reject({msg:`Error al crear el movimiento: ${error}`,tipo: 0}) ) : ( resolve(true) )
                })
            })
        })
        .then(resolved => {
            return new Promise((resolve, reject) => {
                // se actualiza el basico de la tecnica
                basico.enUso = true
                BasicoModel.findByIdAndUpdate(basico._id, basico).exec( error => {
                    return(error) ? (reject({msg:`Error al actualizar el basico: ${error}`,tipo: 0})) : (resolve(true))
                })
            })
        })
        .then(resolved => {
            // se asigno correctamente y se manda una alerta
            res.json({msg:`Producto asignado correctamente`, tipo: 13})
        })
        .catch(error => {
            Utilidad.printError(res, error)
        })
}

function basicosDelete(req, res) {
    let nombreTecnica = req.body.tecnica,
        nombreProducto = req.body.producto,
        sucursal = req.session.user.sucursal,
        tecnicas = req.session.tecnicas,
        productos = req.session.productos,
        tecnica =  obtenerIdTecnica(nombreTecnica,tecnicas),
        producto = obtenerIdsBasico(nombreProducto, productos),
        basico = null,
        promesa = new Promise((resolve, reject) =>{
            // busco el basico en uso
            BasicoModel.findOne({sucursal,tecnica,producto: producto._id},{enUso:1}).exec((error, basico) => {
                return(error) ? reject({msg:`Error al obtener el basico en uso: ${error}`, tipo: 0}) : resolve(basico)
            })
        })

    promesa
        .then(resolved => {
            return new Promise((resolve, reject) =>{
                basico = resolved
                if(basico.enUso){
                    // busco el almacen
                    AlmacenModel.findOne({sucursal,producto: producto._id},{cantidadConsumo:1}).exec((error, almacen) => {
                        return(error) ? reject({msg:`Error al obtener el almacen: ${error}`, tipo: 0}) : resolve(almacen)
                    })
                }else{
                    // mandar alerta que esta en uso
                    reject({msg:`Error el producto no esta en uso`, tipo: 21})
                }
            })
        })
        .then(almacen => {
            return new Promise((resolve, reject) =>{
                // se hacen los cambios necesarios
                almacen.cantidadConsumo--
                AlmacenModel.findByIdAndUpdate(almacen._id, almacen).exec( error => {
                    (error) ? reject({msg:`Error al actualizar el almacen: ${error}`,tipo: 0}) : resolve(true)
                })
            })
        })
        .then(resolved => {
            return new Promise((resolve, reject) => {
                // se genera la baja
                let baja = new BajaBasicoModel({
                    sucursal,
                    usuario: req.session.user._id,
                    tecnica,
                    producto: producto._id
                })
                baja.save( error => {
                    return(error) ? ( reject({msg:`Error al realizar la baja: ${error}`,tipo: 0}) ) : ( resolve(true) )
                })
            })
        })
        .then(resolved => {
            return new Promise((resolve, reject) => {
                // se actualiza el basico de la tecnica
                basico.enUso = false
                BasicoModel.findByIdAndUpdate(basico._id, basico).exec( error => {
                    return(error) ? (reject({msg:`Error al actualizar el basico: ${error}`,tipo: 0})) : (resolve(true))
                })
            })
        })
        .then(resolved => {
            // se desasigno correctamente y se manda una alerta
            res.send({msg:`Baja realizada correctamente`, tipo: 23})
        })
        .catch(error => {
            Utilidad.printError(res, error)
        })
}

function obtenerIdTecnica(nombre, tecnicas) {
    let longitud = tecnicas.length,
        id = null
    for( let i = 0 ; i < longitud ; i++){
        if(tecnicas[i].nombre+' '+tecnicas[i].apellido === nombre) {
            id = tecnicas[i]._id
            break
        }
    }
    return id
}

function obtenerIdsBasico(nombre, productos) {
    let longitud = productos.length,
        producto = null
    for( let i = 0 ; i < longitud ; i++){
        if(productos[i].nombre === nombre) {
            producto = { _id: productos[i]._id, categoria: productos[i].categoria}
            break
        }
    }
    return producto
}

module.exports = {
    basicosGet,
    basicosPut,
    basicosDelete
}