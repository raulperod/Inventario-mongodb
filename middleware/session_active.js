'use strict'

module.exports = function(req,res,next){
    if(req.session.user){
        next()
    }else{
        res.redirect("/login")
    }
}
