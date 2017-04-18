/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const Usuario = require('../models/usuario')

function indexGet(req, res) {
    // verifica si existe un usuario logeado
    if(req.session.user){
        res.redirect("/almacen")  // lo redirecciona a almacen
    }else{
        // si no esta logeado lo manda al login
        res.redirect("/login")
    }
}

function logout(req, res) {
    // cierra la sesion del usuario
    req.session = null
    // te redirecciona al inicio
    res.redirect("/login")
}

function loginGet(req, res) {
    // si no esta logeado entra al login
    if(!req.session.user){
        // manda falsa las alertas y renderisa login
        res.render("login",{alertUsername:false,alertPassword:false,usuario:false,alertStatus:false})
    }else{  // si ya esta logeado, entonces se redirecciona al almacen
        res.redirect("/almacen")
    }
}

function loginPost(req, res) {
    // busca al usuario
    let username = req.body.username.toLowerCase()
    Usuario.findOne({username}).populate("sucursal").exec( (err, usuario) => {

        if(!err && usuario){
            // si encontro al usuario entonces inicia sesion
            if(usuario.status){
                if(req.body.password === usuario.password){ // si el password coincide
                    // genera la sesion para el usuario
                    req.session.user = usuario
                    res.redirect("/almacen") // redirecciona al almacen
                }else{ // si el password no coincide, manda una alerta del password
                    res.render("login",{alertPassword:true,alertUsername:false,usuario:false,alertStatus:false,username})
                }
            }else{ // si el usuario esta inactivo entonces manda una alerta
                res.render("login",{alertStatus:true,alertUsername:false,alertPassword:false,usuario:false,username})
            }
        }else if(!usuario){
            // si no existe el usuario entonces, manda una alerta
            res.render("login",{alertUsername:true,alertPassword:false,usuario:false,alertStatus:false,username})
        }else { // si hubo un error
            console.log(err)
            res.redirect("/login")
        }
    })
}

module.exports = {
    indexGet,
    loginGet,
    loginPost,
    logout
}