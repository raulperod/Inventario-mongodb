'use strict'

module.exports = function(req,res,next){
    let user = req.session.user
    if( user ){
        if( user.permisos < 2){
            next()
        }else{
            res.redirect("/almacen")
        }
    }else{
        res.redirect("/login")
    }
}
