/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const MovimientoModel = require("../models/movimiento"),
      BajaModel = require("../models/baja"),
      TecnicaModel = require("../models/tecnica"),
      ProductoModel = require("../models/producto"),
      SucursalModel = require("../models/sucursal"),
      BasicoModel = require('../models/basico')

function historialMovimientosGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 1){ // si es administrador de sucursales
        // busca los movimientos de la sucursal del administrador
        MovimientoModel.find({ sucursal: usuario.sucursal },{sucursal:0,_id:0})
            .populate("usuario", 'nombre apellido')
            .populate("producto", 'nombre')
            .populate("tecnica", 'nombre apellido')
            .exec( (error, movimientos) => {
                if(error){ // si no hay error y hay movimientos
                    console.log(`Error al obtener los movimientos: ${error}`)
                    res.redirect("/almacen")
                }else{ // si hubo error
                    res.render("./historial/movimientos",{movimientos, usuario})
                }
            })
    }else{ // si es administrador general
        // busca los movimientos de todas las sucursales
        MovimientoModel.find({},{_id:0})
            .populate("usuario", 'nombre apellido')
            .populate("producto", 'nombre')
            .populate("tecnica", 'nombre apellido')
            .populate("sucursal", 'plaza')
            .exec( (error, movimientos) => {
                if(error){ // si no hay error y hay movimientos
                    console.log(`Error al obtener los movimientos: ${error}`)
                    res.redirect("/almacen")
                }else{ // si hubo error
                    res.render("./historial/movimientos",{movimientos, usuario})
                }
            })
    }
}

function historialBajasGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 1){ // si es administrador de sucursal
        // busca las bajas de la sucursal
        BajaModel.find({sucursal: usuario.sucursal},{_id:0,sucursal:0})
            .populate("usuario", 'nombre apellido')
            .populate("producto", 'nombre')
            .populate("tecnica", 'nombre apellido')
            .exec( (error, bajas) => {
                if(error){ // si no hubo error y hay bajas
                    console.log(`Error al obtener las bajas: ${err}`)
                    res.redirect("/almacen")
                }else{ // si hubo un error
                    res.render("./historial/bajas",{bajas, usuario})
                }
            })
    }else{ // si es administrador general
        // busca todas las bajas de las sucursales
        BajaModel.find({},{_id:0})
            .populate("usuario", 'nombre apellido')
            .populate("producto", 'nombre')
            .populate("tecnica", 'nombre apellido')
            .populate("sucursal", 'plaza')
            .exec( (error, bajas) => {
                if(error){ // si no hubo error y hay bajas
                    console.log(`Error al obtener las bajas: ${err}`)
                    res.redirect("/almacen")
                }else{ // si hubo un error
                    res.render("./historial/bajas",{bajas, usuario})
                }
            })
    }
}

function historialSucursalGet(req, res) {
    // obtengo el nombre de los productos basicos
    BasicoModel.find({esBasico:true},{nombre:1}).exec((error, basicos) => {
        (error) ? (
            console.log(`Error al obtener los productos basicos: ${error}`)
        ) : (
            res.render('./historial/sucursal', { basicos, usuario: req.session.user} )
        )
    })
}

function historialSucursalTopPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciot,
        final = sumarDia( req.body.finalt ),
        idSucursal = req.session.user.idSucursal


}

function historialSucursalBasicosPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciob,
        final = sumarDia( req.body.finalb ),
        idSucursal = req.session.user.idSucursal,
        nombreProducto = req.body.basico

}

function historialGeneralGet(req, res) {
    SucursalModel.find({},{plaza:1}).exec((error, sucursales) => {
        if(error){
            console.log(`Error al obtener las sucursales: ${error}`)
            return
        }
        // obtengo el nombre de los productos basicos
        BasicoModel.find({esBasico:true},{nombre:1}).exec((error, basicos) => {
            (error) ? (
                console.log(`Error al obtener los productos basicos: ${error}`)
            ) : (
                res.render('./historial/sucursal', { basicos, sucursales, usuario: req.session.user} )
            )
        })
    })
}

function historialGeneralTopPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciot,
        final = sumarDia( req.body.finalt ),
        sucursal = req.body.sucursaltop


}

function historialGeneralBasicosPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciob,
        final = sumarDia( req.body.finalb ),
        sucursal = req.body.sucursalbas,
        nombreProducto = req.body.basico


}

function sumarDia(fecha) {
    let nuevaFecha = fecha.split('-')
    let dia = parseInt( nuevaFecha[2] )
    dia++
    if ( dia < 10 ) dia = '0' + dia
    return  ( nuevaFecha[0] + '-' + nuevaFecha[1] + '-' + dia )
}

module.exports = {
    historialMovimientosGet,
    historialBajasGet,
    historialSucursalGet,
    historialSucursalTopPost,
    historialSucursalBasicosPost,
    historialGeneralGet,
    historialGeneralTopPost,
    historialGeneralBasicosPost
}