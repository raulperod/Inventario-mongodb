/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const AlmacenModel = require("../models/almacen"),
      ProductoModel = require("../models/producto"),
      MovimientoModel = require("../models/movimiento")

function almacenGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 2){ // si es administrador general
        // busca todos pruductos del almacen de todas las sucursales
        Almacen.find({ })
            .populate("producto sucursal")
            .exec( (err,almacen) => {

                if(!err){ // si no hubo error
                    // le mandas los productos del almacen
                    res.render("./almacen/manager",{ almacen, usuario })
                }else{ // si hubo error
                    console.log(err)
                    res.redirect("/almacen")
                }

            })
    }else{ // si es administrador de sucursal o recepcionista
        // busca los pruductos del almacen donde sea de la sucursal del usuario
        Almacen.find({ sucursal: usuario.sucursal })
            .populate("producto sucursal")
            .exec( (err,almacen) => {

                if(!err){ // si no hubo error
                    // le mandas los productos del almacen
                    res.render("./almacen/manager",{ almacen, usuario })
                }else{ // si hubo error
                    console.log(err)
                    res.redirect("/almacen")
                }
            })
    }
}

function almacenNewGet(req, res) {
    let usuario = req.session.user
    // si entra el admin general lo redirecciona, no debe estar aqui
    if( usuario.permisos === 2 ) res.redirect("/almacen")
    Producto.find({}).exec( (err, productos) => { // busca todos los productos
        if(!err){ // si no hubo error
            res.render("./almacen/new",{ usuario, AlertProducto:false, productos})
        }else{ // si hubo un error
            console.log(err)
            res.redirect("/almacen")
        }
    })
}

function almacenNewPost(req, res) {
    let usuario = req.session.user
    Producto.findOne({nombre:req.body.producto}).exec( (err, producto) => { // busca el producto
        if(!err && producto){ // si no hubo error y el producto existe
            Almacen.findOne( { producto: producto._id, "sucursal": usuario.sucursal }, (err, productoSucursal) => {
                if(!err && !productoSucursal){ // si no esta repetido
                    // creo el nuevo producto en el almacen
                    let almacen = new Almacen({
                        cantidad: parseInt(req.body.cantidad),
                        producto: producto._id,
                        sucursal: usuario.sucursal
                    })
                    // guarda el almacen en la base de datos
                    almacen.save().then( al => {
                        res.redirect("/almacen")
                    }, err => { // si ocurre un error lo imprime
                        console.log(err)
                        res.redirect("/almacen")
                    })
                    // guarda el movimiento
                    // genera el registro
                    // creo la fecha
                    let fecha = new Date()
                    fecha.setHours(fecha.getHours()-7)

                    let registro = new RegistroDeMovimiento({
                        sucursal: usuario.sucursal,
                        usuario:  usuario._id,
                        cantidad: parseInt(req.body.cantidad),
                        producto: producto._id,
                        tipo: 1,
                        fecha
                    })
                    // guarda el registro
                    registro.save().then( reg => {
                        res.redirect("/almacen")
                    }, err => { // si ocurre un error lo imprime
                        console.log(err)
                    })
                }else{ // si paso algo
                    if(productoSucursal){ // si el producto ya esta en el almacen
                        Producto.find({}).exec( (err, productos) => { // busca todos los productos
                            if(!err){ // si no hubo error
                                res.render("./almacen/new",{ usuario, AlertProducto: true, productos , nombre: req.body.nombre, cantidad: req.body.cantidad})
                            }else{ // si hubo un error
                                console.log(err)
                                res.redirect("/almacen")
                            }
                        })
                    }else{ // si hubo un error
                        console.log(err)
                        res.redirect("/almacen")
                    }
                }
            })
        }else{ // si paso un error
            console.log(err)
            res.redirect("/almacen")
        }
    })
}

function almacenIdAlmacenAddPut(req, res) {
    // si no mandaron cambios
    if( parseInt(req.body.cantidad) === 0 ){
        res.send("") // no mando nada
    }else{
        let usuario = req.session.user
        // si no mandaron 0
        Almacen.findById(req.params.idAlmacen).exec( (err, productoAlm ) => { // busco el almacen
            if(!err && productoAlm){ // si no hay error y el almacen existe
                res.locals.productoAlmUpdate = productoAlm
                res.locals.productoAlmUpdate.cantidad += parseInt(req.body.cantidad)
                // genera el registro
                // creo la fecha
                let fecha = new Date()
                fecha.setHours(fecha.getHours()-7)
                let registro = new RegistroDeMovimiento({
                    sucursal: usuario.sucursal,
                    usuario:  usuario._id,
                    cantidad: parseInt(req.body.cantidad),
                    producto: productoAlm.producto,
                    tipo: 1,
                    fecha
                })
                // guarda al producto en la base de datos
                res.locals.productoAlmUpdate.save( err => {
                    if(err) console.log(err)
                })
                // guarda el registro
                registro.save().then( reg => {
                    // mando la nueva cantidad a mostrar
                    res.send(""+res.locals.productoAlmUpdate.cantidad)
                }, err => { // si ocurre un error lo imprime
                    console.log(err)
                })
            }else{
                if(err) console.log(err)
                res.redirect("/almacen")
            }
        })
    }
}

function almacenIdAlmacenSubPut(req, res) {
    // si no mandaron cambios
    if( parseInt(req.body.cantidad) === 0 ){
        res.send("") // no mando nada
    }else{
        let usuario = req.session.user
        Almacen.findById(req.params.idAlmacen).exec( (err, productoAlm) => { // busco el almacen
            if(!err && productoAlm){ // si no hay error y el almacen existe
                // si no hay productos, se acaba y regresa
                if(productoAlm.cantidad === 0 ){
                    res.send("")
                    return;
                }
                res.locals.productoAlmUpdate = productoAlm
                // si el numero que pusieron es mayor que el que tenian, entonces quedan 0 productos
                if( parseInt(req.body.cantidad) > res.locals.productoAlmUpdate.cantidad ){
                    // genera el registro
                    // creo la fecha
                    let fecha = new Date()
                    fecha.setHours(fecha.getHours()-7)
                    let registro = new RegistroDeMovimiento({
                        sucursal: usuario.sucursal,
                        usuario: usuario._id,
                        cantidad: res.locals.productoAlmUpdate.cantidad,
                        producto: productoAlm.producto,
                        tipo: 0,
                        fecha
                    })
                    Consumo.findOne({producto: productoAlm.producto, sucursal: usuario.sucursal }).exec( (err, consumo) => { // verifico si hay un consumo
                        if(!err){// si no hay error
                            if(!consumo){ // si no hay consumo de ese producto
                                // entonces lo crea
                                let consumo = new Consumo({
                                    sucursal: usuario.sucursal,
                                    cantidad: res.locals.productoAlmUpdate.cantidad,
                                    producto: productoAlm.producto
                                })
                                res.locals.productoAlmUpdate.cantidad = 0
                                consumo.save().then( con => {
                                    // no pasa nada
                                }, err => { // si ocurre un error lo imprime
                                    console.log(err)
                                })

                            }else{ // si ya habia uno, aumenta su cantidad
                                res.locals.consumo = consumo
                                res.locals.consumo.cantidad += res.locals.productoAlmUpdate.cantidad
                                res.locals.consumo.save( err => {
                                    if(err) console.log(err)
                                })
                                res.locals.productoAlmUpdate.cantidad = 0
                            }
                            // guarda al producto en la base de datos
                            res.locals.productoAlmUpdate.save( err => {
                                if(err) console.log(err)
                            })
                            // guarda el registro
                            registro.save().then( reg => {
                                // mando la nueva cantidad a mostrar
                                res.send("0")
                            }, err => { // si ocurre un error lo imprime
                                console.log(err)
                            })
                        }else{ // si hubo un error
                            console.log(err)
                            res.redirect("/almacen")
                        }
                    })
                    // guarda al producto en la base de datos
                }else{ // si no, solamente se resta la cantidad que mando

                    // genera el registro
                    // creo la fecha
                    let fecha = new Date()
                    fecha.setHours(fecha.getHours()-7)
                    let registro = new RegistroDeMovimiento({
                        sucursal: usuario.sucursal,
                        usuario: usuario._id,
                        cantidad: parseInt(req.body.cantidad),
                        producto: productoAlm.producto,
                        tipo: 0,
                        fecha
                    })
                    // resta la cantidad
                    res.locals.productoAlmUpdate.cantidad -= parseInt(req.body.cantidad)
                    Consumo.findOne({producto: productoAlm.producto, sucursal: usuario.sucursal}).exec( (err, consumo) => {
                        if(!err){ // si no hubo error
                            if(!consumo){ // si no habia consumo
                                // entonces lo crea
                                let consumo = new Consumo({
                                    sucursal: usuario.sucursal,
                                    cantidad: parseInt(req.body.cantidad),
                                    producto: productoAlm.producto
                                })
                                consumo.save().then( con => {
                                }, err => { // si ocurre un error lo imprime
                                    console.log(err)
                                })
                            }else{ // si ya habia uno, aumenta su cantidad
                                res.locals.consumo = consumo
                                res.locals.consumo.cantidad += parseInt(req.body.cantidad)
                                res.locals.consumo.save( err => {
                                    if(err) console.log(err)
                                })
                            }
                        }else{ // si hubo un error
                            console.log(err)
                            res.redirect("/almacen")
                        }
                    })
                    // guarda al producto en la base de datos
                    res.locals.productoAlmUpdate.save( err => {
                        if(err) console.log(err)
                    })
                    // guarda el registro
                    registro.save().then( reg => {
                        // mando la nueva cantidad a mostrar
                        res.send(""+res.locals.productoAlmUpdate.cantidad)
                    }, err => { // si ocurre un error lo imprime
                        console.log(err)
                    })
                }
            }else{ // si hubo un error
                console.log(err)
                res.redirect("/almacen")
            }
        })
    }
}

module.exports = {
    almacenGet,
    almacenNewGet,
    almacenNewPost,
    almacenIdAlmacenAddPut,
    almacenIdAlmacenSubPut
}