/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const Baja = require("../models/baja")

function consumosGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 2){ // si es administrador general
        // busca los productos en consumo de todas las sucursales
        Consumo.find({ })
            .populate("producto sucursal")
            .exec( (err,consumos) => {

                if(!err && consumos){ // si no hay error
                    // le mandas los productos del almacen
                    res.render("./consumos/manager",{consumos, usuario})
                }else{ // si hubo error
                    console.log(err)
                    res.redirect("/almacen")
                }
            })
    }else{ // si es administrador de sucursal o recepcionista
        // busca los pruductos en consumo donde sean de la sucursal del usuario
        Consumo.find({ sucursal:usuario.sucursal })
            .populate("producto sucursal")
            .exec( (err, consumos) => {

                if(!err && consumos){ // si no hubo error
                    // le mandas los productos del almacen
                    res.render("./consumos/manager",{consumos, usuario })
                }else{ // si hubo error
                    console.log(err)
                    res.redirect("/almacen")
                }
            })
    }
}

function consumosIdConsumoPut(req, res) {
    // si no mandaron cambios, redirecciona a consumo
    if(parseInt(req.body.cantidad) === 0){
        res.send("")
    }else{
        let usuario = req.session.user,
            baja = null
        // busca el producto que cambiaron
        Consumo.findById(req.params.idConsumo).exec( (err, productoCon) => {
            if(!err && productoCon){ // si no hay error y el producto existe
                // si no hay productos, se acaba y regresa
                if(productoCon.cantidad === 0 ){
                    res.send("")
                    return;
                }
                res.locals.productoConUpdate = productoCon
                // si el numero que pusieron es mayor que el que tenian, entonces quedan 0 productos
                if( parseInt(req.body.cantidad) > res.locals.productoConUpdate.cantidad ){
                    // genera la baja
                    // creo la fecha
                    let fecha = new Date()
                    fecha.setHours(fecha.getHours()-7)
                    baja = new Baja({
                        sucursal: usuario.sucursal,
                        usuario: usuario._id,
                        cantidad: res.locals.productoConUpdate.cantidad,
                        producto: productoCon.producto,
                        fecha
                    })
                    res.locals.productoConUpdate.cantidad = 0
                    // guarda al producto en la base de datos
                }else{ // si no, solamente se resta la cantidad que mando
                    // genera el registro
                    // creo la fecha
                    let fecha = new Date()
                    fecha.setHours(fecha.getHours()-7)
                    baja = new Baja({
                        sucursal: usuario.sucursal,
                        usuario: usuario._id,
                        cantidad: parseInt(req.body.cantidad),
                        producto: productoCon.producto,
                        fecha
                    })
                    // se le resta la cantidad
                    res.locals.productoConUpdate.cantidad -= parseInt(req.body.cantidad)
                }
                // actualiza el producto en consumo
                res.locals.productoConUpdate.save( err => {
                    if(err) console.log(err)
                })
                // guarda la baja
                baja.save().then( baj => {
                    res.send(""+res.locals.productoConUpdate.cantidad)
                }, err => { // si ocurre un error lo imprime
                    console.log(err)
                })
            }else{ // si hubo un error
                console.log(err)
                res.redirect("/consumos")
            }
        })
    }
}

module.exports = {
    consumosGet,
    consumosIdConsumoPut
}