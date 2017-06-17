/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const MovimientoModel = require("../models/movimiento"),
      BajaModel = require("../models/baja"),
      BajaBasicoModel = require("../models/bajaBasico"),
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
        BajaModel.find({sucursal: usuario.sucursal},{_id:0,sucursal:0})
            .populate("usuario", 'nombre apellido')
            .populate("producto", 'nombre')
            .exec( (error, bajas) => {
                if(error){
                    console.log(`Error al obtener las bajas: ${err}`)
                    res.redirect("/almacen")
                }else{
                    BajaBasicoModel.find({sucursal: usuario.sucursal},{_id:0,sucursal:0})
                        .populate("usuario", 'nombre apellido')
                        .populate("producto", 'nombre')
                        .populate("tecnica", 'nombre apellido')
                        .exec( (error, bajasBasicos) => {
                            if(error){
                                console.log(`Error al obtener las bajas basicas: ${err}`)
                                res.redirect("/almacen")
                            }else{
                                res.render("./historial/bajas",{bajas, bajasBasicos, usuario})
                            }
                        })
                }
            })
    }else{ // si es administrador general
        BajaModel.find({},{_id:0})
            .populate("usuario", 'nombre apellido')
            .populate("producto", 'nombre')
            .populate("sucursal", 'plaza')
            .exec( (error, bajas) => {
                if(error){
                    console.log(`Error al obtener las bajas: ${err}`)
                    res.redirect("/almacen")
                }else{
                    BajaBasicoModel.find({},{_id:0})
                        .populate("sucursal", 'plaza')
                        .populate("usuario", 'nombre apellido')
                        .populate("producto", 'nombre')
                        .populate("tecnica", 'nombre apellido')
                        .exec( (error, bajasBasicos) => {
                            if(error){
                                console.log(`Error al obtener las bajas basicas: ${err}`)
                                res.redirect("/almacen")
                            }else{
                                res.render("./historial/bajas",{bajas, bajasBasicos, usuario})
                            }
                        })
                }
            })
    }
}

function historialSucursalGet(req, res) {
    // obtengo el nombre de los productos basicos
    ProductoModel.find({esBasico:true},{nombre:1}).exec((error, basicos) => {
        (error) ? (
            console.log(`Error al obtener los productos basicos: ${error}`)
        ) : (
            res.render('./historial/sucursal', { basicos, usuario: req.session.user} )
        )
    })
}

function historialSucursalTopPost(req, res) {
    // obtengo las fechas
    let inicio = new Date(req.body.iniciot),
        final = new Date(sumarDia( req.body.finalt )),
        idSucursal = req.session.user.sucursal

    BajaModel.find({sucursal:idSucursal,fecha: { $gte: inicio, $lt: final}},{producto:1,cantidad:1})
        .populate('producto',"nombre codigo")
        .exec( (error, bajas) => {
            (error) ? res.send({}) : res.send(bajas)
        })
}

function historialSucursalBasicosPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciob,
        final = sumarDia( req.body.finalb ),
        idSucursal = req.session.user.sucursal,
        nombreProducto = req.body.basico

    ProductoModel.findOne({nombre:nombreProducto},{id:1}).exec((error, producto) => {
        if(error){
            console.log(`Error al obtener el producto: ${error}`)
            res.send({})
        }else{
            BajaBasicoModel.find({sucursal:idSucursal,fecha: { $gte: inicio, $lt: final},producto:producto._id},{tecnica:1})
                .populate('tecnica','nombre apellido')
                .exec( (error, bajasBasicos) => {
                    (error) ? res.send({}) : res.send(bajasBasicos)
                })
        }
    })

}

function historialGeneralGet(req, res) {
    SucursalModel.find({},{plaza:1}).exec((error, sucursales) => {
        if(error){
            console.log(`Error al obtener las sucursales: ${error}`)
            return
        }
        // obtengo el nombre de los productos basicos
        ProductoModel.find({esBasico:true},{nombre:1}).exec((error, basicos) => {
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
        nombreSucursal = req.body.sucursaltop

    SucursalModel.findOne({plaza:nombreSucursal},{_id:1}).exec((error, sucursal) => {
        if(error){
            console.log(`Error al obtener la sucursal: ${error}`)
            res.send({})
        }else{
            BajaModel.find({sucursal:sucursal._id,fecha: { $gte: inicio, $lt: final}},{producto:1,cantidad:1})
                .populate('producto',"nombre codigo")
                .exec( (error, bajas) => {
                    (error) ? res.send({}) : res.send(bajas)
                })
        }
    })
}

function historialGeneralBasicosPost(req, res) {
    // obtengo las fechas
    let inicio = req.body.iniciob,
        final = sumarDia( req.body.finalb ),
        nombreSucursal = req.body.sucursalbas,
        nombreProducto = req.body.basico

    SucursalModel.findOne({plaza:nombreSucursal},{_id:1}).exec((error, sucursal) => {
        if(error){
            console.log(`Error al obtener la sucursal: ${error}`)
            res.send({})
        }else{
            ProductoModel.findOne({nombre:nombreProducto},{id:1}).exec((error, producto) => {
                if(error){
                    console.log(`Error al obtener el producto: ${error}`)
                    res.send({})
                }else{
                    BajaBasicoModel.find({sucursal:sucursal._id,fecha: { $gte: inicio, $lt: final},producto:producto._id},{tecnica:1})
                        .populate('tecnica','nombre apellido')
                        .exec( (error, bajasBasicos) => {
                            (error) ? res.send({}) : res.send(bajasBasicos)
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