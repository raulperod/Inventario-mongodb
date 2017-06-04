/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const RegistroDeMovimiento = require("../models/registroDeMovimiento"),
      Baja = require("../models/baja"),
      Tecnica = require("../models/tecnica"),
      Producto = require("../models/producto"),
      Sucursal = require("../models/sucursal")

function historialMovimientosGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 1){ // si es administrador de sucursales
        // busca los movimientos de la sucursal del administrador
        RegistroDeMovimiento.find({ sucursal: usuario.sucursal })
            .populate("usuario producto tecnica")
            .exec( (err, movimientos) => {
                if(!err && movimientos){ // si no hay error y hay movimientos
                    res.render("./historial/movimientos",{movimientos, usuario})
                }else{ // si hubo error
                    if(err) console.log(err)
                    res.redirect("/almacen")
                }
            })
    }else{ // si es administrador general
        // busca los movimientos de todas las sucursales
        RegistroDeMovimiento.find({})
            .populate("usuario producto sucursal tecnica")
            .exec( (err, movimientos) => {
                if(!err && movimientos){ // si no hubo error y hay movimientos
                    res.render("./historial/movimientos",{movimientos, usuario })
                }else{ // si hubo error
                    if(err) console.log(err)
                    res.redirect("/almacen")
                }
            })
    }
}

function historialBajasGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 1){ // si es administrador de sucursal
        // busca las bajas de la sucursal
        Baja.find({sucursal: usuario.sucursal}).populate("usuario producto tecnica").exec( (err, bajas) => {
            if(!err && bajas){ // si no hubo error y hay bajas
                res.render("./historial/bajas",{bajas, usuario})
            }else{ // si hubo un error
                if(err) console.log(err)
                res.redirect("/almacen")
            }
        })
    }else{ // si es administrador general
        // busca todas las bajas de las sucursales
        Baja.find({}).populate("usuario producto sucursal tecnica").exec( (err, bajas) => {
            if(!err && bajas){ // si no hay error y existen bajas
                res.render("./historial/bajas",{bajas, usuario})
            }else{ // si hubo un error
                if(err) console.log(err)
                res.redirect("/almacen")
            }
        })
    }
}

function historialGeneralGet(req, res) {
    Sucursal.find({},{ _id: 0, plaza: 1 }).exec( (err, sucursales) => {
        if(!err){
            Producto.find({ esBasico: true }, { _id: 0, nombre: 1 }).exec( (err, basicos) =>  {
                if(!err){
                    res.render("./historial/general",{sucursales, basicos, usuario: req.session.user})
                }else{
                    console.log(err)
                    res.redirect("/almacen")
                }
            })
        }else{
            console.log(err)
            res.redirect("/almacen")
        }
    })
}

function historialSucursalGet(req, res) {
    Producto.find({ esBasico: true }, { _id: 0, nombre: 1 }).exec( (err, basicos) => {
        if(!err){
            res.render("./historial/sucursal",{basicos, usuario: req.session.user })
        }else{
            console.log(err)
            res.redirect("/almacen")
        }
    })
}

function historialDatosGeneralGet(req, res) {
    // mandar bajas de productos basicos y no basicos
    // primero busco las bajas de los productos basicos
    let datos = {},
        promesa = new Promise( (resolve, reject) => {
            Baja.find({tecnica: { "$exists" : true }},{_id:0,sucursal:1,producto:1,tecnica:1,cantidad:1,fecha:1}).populate("sucursal producto tecnica").exec( (err, bajasBasicos) => {
                return (err) ? reject( new Error('Error') ) : resolve(bajasBasicos)
            })
        })

    promesa
            .then( resolved => {
                datos.bajasBasicos = resolved
                return new Promise((resolve, reject) => {
                    Baja.find({tecnica: { "$exists" : false }},{_id:0,sucursal:1,producto:1,cantidad:1,fecha:1}).populate("sucursal producto").exec( (err, bajasProductos) => {
                        return (err) ? reject( new Error('Error') ) : resolve(bajasProductos)
                    })
                })
            })
            .then( resolved => {
                datos.bajasProductos = resolved
                return new Promise((resolve, reject) => {
                    Tecnica.find({},{_id:0,nombreCompleto:1,sucursal:1}).populate("sucursal").exec( (err, tecnicas) => {
                        return (err) ? reject( new Error('Error') ) : resolve(tecnicas)
                    })
                })
            })
            .then( resolved => {
                datos.tecnicas = resolved
                return new Promise((resolve, reject) => {
                    Producto.find({esBasico:true},{_id:0,nombre:1}).exec( (err, basicos) => {
                        return (err) ? reject( new Error('Error') ) : resolve(basicos)
                    })
                })
            })
            .then( resolved => {
                datos.basicos = resolved
                return new Promise((resolve, reject) => {
                    Producto.find({esBasico:false},{_id:0,nombre:1}).exec( (err, productos) => {
                        return (err) ? reject( new Error('Error') ) : resolve(productos)
                    })
                })
            })
            .then( resolved => {
                datos.productos = resolved
                return new Promise((resolve, reject) => {
                    Sucursal.find({},{_id:0,plaza:1}).exec( (err,sucursales) => {
                        return (err) ? reject( new Error('Error') ) : resolve(sucursales)
                    })
                })
            })
            .then( resolved => {
                datos.sucursales = resolved
                res.json(datos)
            })
            .catch( error => {
                res.json({error})
            })
}

function historialDatosSucursalGet(req, res) {
    // mandar bajas de productos basicos y no basicos
    // primero busco las bajas de los productos basicos
    let datos = {},
        usuario = req.session.user,
        promesa = new Promise( (resolve, reject) => {
            Baja.find({sucursal: usuario.sucursal,tecnica: { "$exists" : true }},{_id:0,producto:1,tecnica:1,cantidad:1,fecha:1}).populate("producto tecnica").exec( (err, bajasBasicos) => {
                return (err) ? reject( new Error('Error') ) : resolve(bajasBasicos)
            })
        })

    promesa
        .then( resolved => {
            datos.bajasBasicos = resolved
            return new Promise((resolve, reject) => {
                Baja.find({sucursal: usuario.sucursal,tecnica: { "$exists" : false }},{_id:0,producto:1,cantidad:1,fecha:1}).populate("producto").exec( (err, bajasProductos) => {
                    return (err) ? reject( new Error('Error') ) : resolve(bajasProductos)
                })
            })
        })
        .then( resolved => {
            datos.bajasProductos = resolved
            return new Promise((resolve, reject) => {
                Tecnica.find({sucursal: usuario.sucursal},{_id:0,nombreCompleto:1}).exec( (err, tecnicas) => {
                    return (err) ? reject( new Error('Error') ) : resolve(tecnicas)
                })
            })
        })
        .then( resolved => {
            datos.tecnicas = resolved
            return new Promise((resolve, reject) => {
                Producto.find({esBasico:true},{_id:0,nombre:1}).exec( (err, basicos) => {
                    return (err) ? reject( new Error('Error') ) : resolve(basicos)
                })
            })
        })
        .then( resolved => {
            datos.basicos = resolved
            return new Promise((resolve, reject) => {
                Producto.find({esBasico:false},{_id:0,nombre:1}).exec( (err, productos) => {
                    return (err) ? reject( new Error('Error') ) : resolve(productos)
                })
            })
        })
        .then( resolved => {
            datos.productos = resolved
            res.json(datos)
        })
        .catch( error => {
            res.json({error})
        })
}

module.exports = {
    historialMovimientosGet,
    historialBajasGet,
    historialGeneralGet,
    historialSucursalGet,
    historialDatosGeneralGet,
    historialDatosSucursalGet
}