/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const AlmacenModel = require('../models/almacen'),
      BajaModel = require("../models/baja")

function consumosGet(req, res) {
    let usuario = req.session.user

    if(usuario.permisos === 2){
        // busca los pruductos del almacen donde sea de la sucursal del usuario
        AlmacenModel.find({},{cantidadAlmacen:0})
            .populate('producto', 'nombre')  // obtengo el nombre del producto
            .populate('sucursal', 'plaza') // obtengo la plaza de la sucursal
            .populate('categoria', 'nombre') // obtengo el nombre de la categoria
            .exec( (error, almacen) => {
                // si hubo error imprime el error, sino renderisa la vista
                (error) ? console.log(`Error al obtener el almacen: ${error}`) : res.render("./almacen/manager",{ almacen, usuario })
            })
    }else{
        // busca los pruductos del almacen donde sea de la sucursal del usuario
        AlmacenModel.find({sucursal: usuario.sucursal},{cantidadAlmacen:0,sucursal:0})
            .populate('producto', 'nombre')  // obtengo el nombre del producto
            .populate('categoria', 'nombre') // obtengo el nombre de la categoria
            .exec( (error, almacen) => {
                // si hubo error imprime el error, sino renderisa la vista
                (error) ? console.log(`Error al obtener el almacen: ${error}`) : res.render("./almacen/manager",{ almacen, usuario })
            })
    }
}

function consumosIdConsumoPut(req, res) {
    // obtenemos la cantidad
    let cantidad = parseInt(req.body.cantidad),
        usuario = req.session.user,
        idAlmacen = req.params.idConsumo

    // obtengo el almacen
    AlmacenModel.findById(idAlmacen,{_id:0,cantidadConsumo:1,producto:1,categoria:1}).exec((error, almacen) => {
        if(error){ // si hubo error
            console.log(`Error al obtener el almacen: ${error}`)
            res.send("")
        } else if(almacen.cantidadConsumo === 0){ // si no hay nada en consumo
            res.send("")
        } else { // si no hubo error
            // genero los cambios
            let verificar = (cantidad >= almacen.cantidadConsumo),
                almacenUpdate = {
                    cantidadConsumo: (verificar) ? (0) : (almacen.cantidadConsumo - cantidad)
                }
            // guardo los cambios
            AlmacenModel.findByIdAndUpdate(idAlmacen, almacenUpdate).exec(error => {
                if(error){
                    console.log(`Error al actualizar el almacen: ${error}`)
                    res.send("")
                } else {
                    // creo el movimiento
                    let baja = new BajaModel({
                        sucursal: usuario.sucursal,
                        usuario: usuario._id,
                        producto: almacen.producto,
                        categoria: almacen.categoria,
                        cantidad: (verificar) ? (almacen.cantidadConsumo) : (cantidad)
                    })
                    // guardo el movimiento que ocurrio
                    baja.save( error => {
                        if(error) { // si hubo error
                            console.log(`Error al crear el movimiento: ${error}`)
                            res.send("")
                        }else { // si no hubo
                            // mando la nueva cantidad del almacen
                            (verificar) ? ( res.send('0') ) : ( res.send(`${almacenUpdate.cantidadConsumo}`))
                        }
                    })
                }
            })
        }
    })

}

module.exports = {
    consumosGet,
    consumosIdConsumoPut
}