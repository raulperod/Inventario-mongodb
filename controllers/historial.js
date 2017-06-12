/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const MovimientoModel = require("../models/movimiento"),
      BajaModel = require("../models/baja"),
      TecnicaModel = require("../models/tecnica"),
      ProductoModel = require("../models/producto"),
      SucursalModel = require("../models/sucursal")

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
    BasicoModel.getBasicos( (error, basicos) => {
        (error) ? (
            Utilidad.printError(res, {msg:`Error al obtener los productos basicos: ${error}` , tipo: 0})
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

    EstadisticaModel.getTopTen(idSucursal, inicio, final, (error, topten) => {
        if(!error){
            res.send(topten)
        }
    })
}

function historialSucursalBasicosPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciob,
        final = sumarDia( req.body.finalb ),
        idSucursal = req.session.user.idSucursal,
        nombreProducto = req.body.basico

    // obtener el id del producto a comparar
    ProductoModel.getIdProductoAndIdCategoriaByName(nombreProducto,(error, producto) => {
        if(!error){
            EstadisticaModel.getComparacion(idSucursal, producto.idProducto, inicio, final, (error, comparacion) => {
                if(!error){
                    res.send(comparacion)
                }
            })
        }
    })
}

function historialGeneralGet(req, res) {
    SucursalModel.getPlazasOfSucursales((error, sucursales) => {
        if(error){
            Utilidad.printError(res, {msg:`Error al obtener las sucursales: ${error}` , tipo: 0})
            return
        }
        BasicoModel.getBasicos( (error, basicos) => {
            (error) ? (
                Utilidad.printError(res, {msg:`Error al obtener los productos basicos: ${error}` , tipo: 0})
            ) : (
                res.render('./historial/general', {basicos, sucursales, usuario: req.session.user} )
            )
        })
    })
}

function historialGeneralTopPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciot,
        final = sumarDia( req.body.finalt ),
        sucursal = req.body.sucursaltop

    // busco la sucursal por el nombre de la plaza
    SucursalModel.getIdSucursalByPlaza(sucursal, (error, idSucursal) => {
        if(!error){
            EstadisticaModel.getTopTen(idSucursal, inicio, final, (error, topten) => {
                if(!error){
                    res.send(topten)
                }
            })
        }
    })
}

function historialGeneralBasicosPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciob,
        final = sumarDia( req.body.finalb ),
        sucursal = req.body.sucursalbas,
        nombreProducto = req.body.basico

    SucursalModel.getIdSucursalByPlaza(sucursal, (error, idSucursal) => {
        if(!error){
            // obtener el id del producto a comparar
            ProductoModel.getIdProductoAndIdCategoriaByName(nombreProducto,(error, producto) => {
                if(!error) {
                    EstadisticaModel.getComparacion(idSucursal, producto.idProducto, inicio, final, (error, comparacion) => {
                        if(!error){
                            res.send(comparacion)
                        }
                    })
                }
            })
        }
    })
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