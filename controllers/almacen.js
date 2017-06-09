/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const AlmacenModel = require("../models/almacen"),
      MovimientoModel = require("../models/movimiento")

function almacenGet(req, res) {
    let usuario = req.session.user

    if(usuario.permisos === 2){
        // busca los pruductos del almacen donde sea de la sucursal del usuario
        AlmacenModel.find({},{cantidadConsumo:0})
            .populate('producto', 'nombre codigo')  // obtengo el nombre del producto
            .populate('sucursal', 'plaza') // obtengo la plaza de la sucursal
            .populate('categoria', 'nombre') // obtengo el nombre de la categoria
            .exec( (error, almacen) => {
                // si hubo error imprime el error, sino renderisa la vista
                (error) ? console.log(`Error al obtener el almacen: ${error}`) : res.render("./almacen/manager",{ almacen, usuario })
            })
    }else{
        // busca los pruductos del almacen donde sea de la sucursal del usuario
        AlmacenModel.find({sucursal: usuario.sucursal},{cantidadConsumo:0,sucursal:0})
            .populate('producto', 'nombre codigo')  // obtengo el nombre del producto
            .populate('categoria', 'nombre') // obtengo el nombre de la categoria
            .exec( (error, almacen) => {
                // si hubo error imprime el error, sino renderisa la vista
                (error) ? console.log(`Error al obtener el almacen: ${error}`) : res.render("./almacen/manager",{ almacen, usuario })
            })
    }
}

function almacenIdAlmacenAddPut(req, res) {
    let idAlmacen = req.params.idAlmacen,
        cantidadPlus = parseInt( req.body.cantidad ),
        usuario = req.session.user
    // busco el almacen a actualizar
    AlmacenModel.findById(idAlmacen,{_id:0,cantidadAlmacen:1,cantidadConsumo:1,producto:1,categoria:1}).exec((error, almacen) => {
        if(error){
            console.log(`Error al actualizar el almacen: ${error}`)
            res.send("")
            return
        }
        let almacenUpdate = { cantidadAlmacen: almacen.cantidadAlmacen+cantidadPlus }
        // actualizo el almacen
        AlmacenModel.findByIdAndUpdate(idAlmacen, almacenUpdate).exec( error => {
            if(error){ // si hubo un error
                console.log(`Error al actualizar almacen: ${error}`)
                res.send("")
            } else { // si se actualizo correctamente
                // se crea un movimiento
                let movimiento = new MovimientoModel({
                    sucursal: usuario.sucursal,
                    usuario: usuario._id,
                    producto: almacen.producto,
                    categoria: almacen.categoria,
                    cantidad: cantidadPlus,
                    tipo: 1 // es una alta
                })
                movimiento.save(error => {
                    if (error) {
                        console.log(`Error al guardar movimiento: ${error}`)
                        res.send("")
                    } else {
                        res.send(almacenUpdate.cantidadAlmacen)
                    }
                })
            }
        })
    })
}

function almacenIdAlmacenSubPut(req, res) {
    let idAlmacen = req.params.idAlmacen,
        cantidadSub = parseInt( req.body.cantidad ),
        usuario = req.session.user
    // busco el almacen
    AlmacenModel.findById(idAlmacen,{_id:0,cantidadAlmacen:1,producto:1,categoria:1}).exec((error, almacen) => {
        if(error){
            console.log(`Error al obtener el almacen: ${error}`)
            res.send("")
            return
        }
        let verificar = (cantidadPlus >= almacen.cantidadAlmacen),
            almacenUpdate = {
                cantidadAlmacen: (verificar) ? 0 : almacen.cantidadAlmacen + cantidadSub,
                cantidadConsumo: (verificar) ? (almacen.cantidadConsumo+almacen.cantidadAlmacen) : (almacen.cantidadConsumo+cantidadSub)
            }
        // guardo los cambios
        AlmacenModel.findByIdAndUpdate(idAlmacen, almacenUpdate).exec( error => {
            if(error){
                console.log(`Error al actualizar el almacen: ${error}`)
                res.send("")
            } else {
                // se crea un movimiento
                let movimiento = new MovimientoModel({
                    sucursal: usuario.sucursal,
                    usuario: usuario._id,
                    producto: almacen.producto,
                    categoria: almacen.categoria,
                    cantidad: (verificar) ? (almacen.cantidadAlmacen) : (cantidadSub),
                    tipo: 0 // es una baja
                })
                movimiento.save(error => {
                    if(error) {
                        console.log(`Error al guardar movimiento: ${error}`)
                        res.send("")
                    } else {
                        // mando la nueva cantidad del almacen
                        (verificar) ? ( res.send(0) ) : ( res.send(`${almacenUpdate.cantidadAlmacen}`))
                    }
                })
            }
        })

    })
}

module.exports = {
    almacenGet,
    almacenIdAlmacenAddPut,
    almacenIdAlmacenSubPut
}