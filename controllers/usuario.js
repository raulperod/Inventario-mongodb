/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const UsuarioModel = require("../models/usuario"),
      SucursalModel = require("../models/sucursal"),
      Utilidad = require('../ayuda/utilidad')

function usersGet(req, res) {
    let usuario = req.session.user
    // si es administrador de sucursal
    if( usuario.permisos === 1){
        // busca todas las recepcionistas de la sucursal del administrador
        UsuarioModel.find({ permisos: 0, sucursal: usuario.sucursal}).exec( (error, usuarios) => {
            if(error){ // si no hubo error
                console.log(`Error al obtener los usuarios: ${error}`) // imprimo el error
                res.redirect('/almacen') // redirecciono al almacen
            }else{ // si hubo error
                // paso a los usuarios a la vista
                res.render('./users/manager',{usuarios, usuario})
            }
        })
    }else{ // si es administador general
        // busca todos los administadores de sucursal y recepcionistas de la base de datos
        UsuarioModel.find({ _id :{ $ne: usuario._id } }).populate('sucursal','plaza').exec( (error, usuarios) => {
            if(error){ // si no hubo error
                console.log(`Error al obtener los usuarios: ${error}`) // imprimo el error
                res.redirect("/almacen") // redirecciono al inicio
            }else{ // si hubo error
                // paso a los usuarios a la vista
                res.render("./users/manager",{usuarios, usuario})
            }
        })
    }
}

function usersNewGet(req, res) {
    let usuario = req.session.user
    // si es administrador general
    if( usuario.permisos === 2){
        // busca todas las sucursales
        SucursalModel.find({}, {_id:0, plaza:1}).exec( (error, sucursales) => {
            if(error){ // si hubo un error
                console.log(`Error al obtener las plazas: ${error}`)
                res.redirect("/users")
            }else{ // si no hubo un error
                res.render("./users/new",{ sucursales, usuario })
            }
        })
    }else{ // si es administador de sucursal
        res.render("./users/new", {usuario})
    }
}

function usersNewPost(req, res) {
    let usuario = req.session.user,
        body = req.body
    if(usuario.permisos === 1){ // si es administrador de sucursal
        // creas al nuevo usuario (Recepcionista)
        createUser(body, res, usuario.sucursal, 0)
    } else{ // si es administrador general
        // busco el id de la sucursal
        SucursalModel.findOne({plaza: body.plaza},{_id:1}).exec((error, sucursal) => {
            if(error){
                Utilidad.printError(res, {msg:`Error al obtener la sucursal: ${error}`, tipo:0})
            } else {
                // creas al nuevo usuario (administrador de sucursal)
                createUser(body, res, sucursal._id, 1)
            }
        })
    }

}

function usersIdUsuarioGet(req, res) {
    let usuario = req.session.user
    if( usuario.permisos === 2){ // si es administador general
        // busco las plazas de las sucursales
        SucursalModel.find({},{_id:0, plaza:1}).exec( (error, sucursales) => { // busca todas las sucursales
            if(error){ // si hubo error
                console.log(`Error al obtener las sucursales: ${error}`)
                res.redirect("/users")
            }else{ // si no hubo error
                getUser(req.params.idUsuario, { usuario, sucursal })
            }
        })
    }else{ // si es administrador de sucursal
        getUser(req.params.idUsuario, { usuario })
    }
}

function usersIdUsuarioPut(req ,res) {
    let usuario = req.session.user,
        body = req.body,
        idUsuario = req.params.idUsuario
    if(usuario.permisos === 1){ // si es administrador de sucursal
        updateUser(idUsuario, body, usuario.sucursal, res)
    }else{ // si es administrador general
        // obtengo el id de la sucursal
        SucursalModel.findOne({plaza: body.plaza},{_id:1}).exec((error, sucursal) => {
            if(error){
                Utilidad.printError(res, {msg:`Error al obtener la sucursal: ${error}`, tipo:0})
            }else{
                updateUser(idUsuario, body, sucursal._id, res)
            }
        })
    }
}

function createUser(body, res, usuario, sucursal, permisos) {
    // creas al nuevo usuario
    let nuevoUsuario = new UsuarioModel({
        nombre: body.nombre,
        apellido: body.apellido,
        username: body.username,
        password: body.password,
        sucursal,
        permisos
    })
    // guardas al nuevo usuario
    nuevoUsuario.save( error => {
        if(error){
            Utilidad.printError(res, {msg:`Error al guardar el nuevo usuario: ${error}`, tipo: 1})
        }else{
            res.json({msg:`Usuario guardado correctamente`, tipo: 3})
        }
    })
}

function getUser(idUsuario, datos) {
    // busco al usuario a editar
    UsuarioModel.findById(idUsuario).exec( (error, usuarioUpdate) => {
        if(error){ // si hubo error
            console.log(`Error al obtener el usuario: ${error}`)
            res.redirect("/users")
        }else{ // si no hubo error
            datos.usuarioUpdate = usuarioUpdate
            res.render("./users/update", datos)
        }
    })
}

function updateUser(idUsuario, body, sucursal, res) {
    // creo al usuario actualizado
    let usuarioUpdate = {
        nombre: body.nombre,
        apellido: body.apellido,
        username: body.username,
        password: body.password,
        status: body.status,
        sucursal
    }
    UsuarioModel.findByIdAndUpdate(idUsuario, usuarioUpdate).exec( error => {
        if(error){
            Utilidad.printError(res, {msg:`Error al actualizar el usuario: ${error}`, tipo:1})
        }else{
            res.json({msg:`Usuario actualizado correctamente`, tipo:3})
        }
    })
}

module.exports = {
    usersGet,
    usersNewGet,
    usersNewPost,
    usersIdUsuarioGet,
    usersIdUsuarioPut
}
