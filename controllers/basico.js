/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const Producto = require("../models/producto"),
      Almacen = require("../models/almacen"),
      Consumo = require("../models/consumo"),
      RegistroDeMovimiento = require("../models/registroDeMovimiento"),
      Baja = require("../models/baja"),
      Tecnica = require("../models/tecnica"),
      Basico = require("../models/basico")

function basicosGet(req, res) {
    let usuario = req.session.user
    // busco las tecnicas de la sucursal del usuario
    Tecnica.find({ sucursal: usuario.sucursal },{ nombreCompleto:1 }).exec( (err, tecnicas) => {
        if(!err && tecnicas){ // si no hubo error y existen tecnicas
            // busca los productos basicos
            Producto.find({ esBasico: true }, { nombre:1 }).exec( (err, productos) => {
                if(!err && productos){ // si no hubo error y existen productos
                    res.render("./basicos/manager",{ usuario, tecnicas ,productos , Asignado: false, AlertAsignado : false, Baja : false , Alertbaja : false , AlertYaAsignado : false, AlertNoAsignado : false })
                }else{ // si hubo un error
                    if(err) console.log(err) // imprime el error
                    res.redirect("/producto/new")
                }
            })
        }else{ // si paso algun error
            if(err) console.log(err) // imprime el error si hubo
            res.redirect("/tecnicas/new")
        }
    })
}

function basicosPut(req, res) {
    let usuario = req.session.user
    // pasar a consumo un producto basico
    // busco el producto a asignar
    Producto.findOne({ nombre: req.body.producto },{ _id : 1 }).exec( (err, producto) =>{
        if(!err && producto){ // si no hubo error y el producto existe
            // verifico si almenos hay un producto en el almacen
            Almacen.findOne({ producto : producto._id, sucursal : usuario.sucursal}).exec( (err, productoAlm) => {
                if(!err && productoAlm){ // si no hubo error y el producto existe
                    if(productoAlm.cantidad > 0){ // si hay mas de un producto en el almacen
                        // busco a la tecnica para asignarle el producto
                        Tecnica.findOne({ nombreCompleto : req.body.tecnica },{ _id : 1 }).exec( (err, tecnica) => {
                            if(!err && tecnica){ // si no hubo error y la tecnica existe
                                // verifico que no tenga asignado el producto
                                Basico.findOne({sucursal : usuario.sucursal, tecnica: tecnica._id, producto: producto._id}).exec( (err, productoBasico) => {
                                    if(!err && productoBasico){// si no hay error, y existe el producto basico en la tecnica
                                        if(productoBasico.enUso){ // si esta en uso, mando una alerta que ya tiene asignado el producto
                                            // busco las tecnicas de la sucursal del usuario
                                            Tecnica.find({sucursal: usuario.sucursal},{ nombreCompleto: 1}).exec( (err, tecnicas) => {
                                                if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                                    // busca los productos basicos de la sucursal
                                                    Producto.find({ esBasico: true },{ nombre: 1 }).exec( (err, productos) => {
                                                        if(!err && productos){ // si no hubo error y existen productos
                                                            res.render("./basicos/manager",{usuario, tecnicas , productos , Asignado: false, AlertAsignado: false, Baja: false, Alertbaja: false, AlertYaAsignado: true, AlertNoAsignado: false })
                                                        }else{ // si hubo un error
                                                            if(err) console.log(err) // imprime el error
                                                            res.redirect("/producto/new")
                                                        }
                                                    })
                                                }else{ // si paso algun error
                                                    if(err) console.log(err) // imprime el error si hubo
                                                    res.redirect("/tecnicas/new")
                                                }
                                            })

                                        }else{ // si no tiene asignado el producto, entonces se le asigna el producto
                                            // asigno el producto a la tecnicas
                                            res.locals.productoBasicoUpdate = productoBasico
                                            res.locals.productoBasicoUpdate.enUso = true
                                            res.locals.productoBasicoUpdate.save( err => {
                                                if(err) console.log(err)
                                            })
                                            // le resto un producto al almacen
                                            res.locals.productoAlmUpdate = productoAlm
                                            res.locals.productoAlmUpdate.cantidad -= 1 // se le resta 1
                                            res.locals.productoAlmUpdate.save( err => {
                                                if(err) console.log(err)
                                            })
                                            //--------------------------------
                                            // le sumo uno al consumo del producto
                                            Consumo.findOne({producto: producto._id, sucursal: usuario.sucursal }).exec( (err, productoCon) => {
                                                if(!err && productoCon){ // si no hubo error y hay consumo del producto
                                                    res.locals.productoConUpdate = productoCon
                                                    res.locals.productoConUpdate.cantidad += 1 // se le suma 1
                                                    res.locals.productoConUpdate.save( err => {
                                                        if(err) console.log(err)
                                                    })
                                                }else{ // si paso algo
                                                    if(!productoCon){ // si no hay consumo del producto
                                                        // creo el consumo del producto
                                                        let consumo = new Consumo({
                                                            sucursal: usuario.sucursal,
                                                            cantidad: 1,
                                                            producto: producto._id
                                                        })
                                                        consumo.save().then( con => {
                                                        }, err => { // si ocurre un error lo imprime
                                                            console.log(err)
                                                        })

                                                    }else{ // si paso un error
                                                        console.log(err)
                                                        res.redirect("/almacen")
                                                    }
                                                }
                                            })
                                            //------------------------------------
                                            // creo un registro del movimiento
                                            // genera el registro
                                            // creo la fecha
                                            let fecha = new Date()
                                            fecha.setHours(fecha.getHours()-7)
                                            let registro = new RegistroDeMovimiento({
                                                sucursal: usuario.sucursal,
                                                usuario: usuario._id,
                                                cantidad: 1,
                                                producto: producto._id,
                                                tipo: 0,
                                                tecnica: tecnica._id,
                                                fecha
                                            })
                                            // guarda el registro
                                            registro.save().then( reg => {
                                                // busco las tecnicas de la sucursal del usuario
                                                Tecnica.find({ sucursal: usuario.sucursal },{ nombreCompleto: 1}).exec( (err, tecnicas) => {
                                                    if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                                        // busca los productos basicos de la sucursal
                                                        Producto.find({ esBasico: true },{ nombre: 1 }).exec( (err, productos) => {
                                                            if(!err && productos){ // si no hubo error y existen productos
                                                                res.render("./basicos/manager",{ usuario, tecnicas, productos, Asignado: true, AlertAsignado: false, Baja: false, Alertbaja: false, AlertYaAsignado: false, AlertNoAsignado: false})
                                                            }else{ // si hubo un error
                                                                if(err) console.log(err) // imprime el error
                                                                res.redirect("/producto/new")
                                                            }
                                                        })
                                                    }else{ // si paso algun error
                                                        if(err) console.log(err) // imprime el error si hubo
                                                        res.redirect("/tecnicas/new")
                                                    }
                                                })

                                            }, err => { // si ocurre un error lo imprime
                                                console.log(err)
                                            })
                                            //--------------------------------
                                        }

                                    }else{ // si paso algo
                                        if(!productoBasico){ // si no existe el producto basico en la tecnica
                                            // creo el registro del basico para la tecnica
                                            let basico = new Basico({
                                                sucursal: usuario.sucursal,
                                                tecnica: tecnica._id,
                                                producto: producto._id,
                                                enUso: true
                                            })
                                            // guarda el registro del basico
                                            basico.save().then( bas => {
                                            }, err => { // si ocurre un error lo imprime
                                                console.log(err)
                                            })
                                            //---------------------------------------------
                                            // le resto un producto al almacen
                                            res.locals.productoAlmUpdate = productoAlm
                                            res.locals.productoAlmUpdate.cantidad -= 1 // se le resta 1
                                            res.locals.productoAlmUpdate.save( err => {
                                                if(err) console.log(err)
                                            })
                                            //--------------------------------
                                            // le sumo uno al consumo del producto
                                            Consumo.findOne({ producto: producto._id, sucursal: usuario.sucursal }).exec( (err, productoCon) => {
                                                if(!err && productoCon){ // si no hubo error y hay consumo del producto
                                                    res.locals.productoConUpdate = productoCon
                                                    res.locals.productoConUpdate.cantidad += 1 // se le suma 1
                                                    res.locals.productoConUpdate.save( err => {
                                                        if(err) console.log(err)
                                                    })
                                                }else{ // si paso algo
                                                    if(!productoCon){ // si no hay consumo del producto
                                                        // creo el consumo del producto
                                                        let consumo = new Consumo({
                                                            sucursal: usuario.sucursal,
                                                            cantidad: 1,
                                                            producto: producto._id
                                                        })
                                                        consumo.save().then( con => {
                                                        }, err => { // si ocurre un error lo imprime
                                                            console.log(err)
                                                        })

                                                    }else{ // si paso un error
                                                        console.log(err)
                                                        res.redirect("/almacen")
                                                    }
                                                }
                                            })
                                            //------------------------------------
                                            // creo un registro del movimiento
                                            // creo la fecha
                                            let fecha = new Date()
                                            fecha.setHours(fecha.getHours()-7)
                                            // genera el registro
                                            let registro = new RegistroDeMovimiento({
                                                sucursal: usuario.sucursal,
                                                usuario: usuario._id,
                                                cantidad: 1,
                                                producto: producto._id,
                                                tipo:  0,
                                                tecnica: tecnica._id,
                                                fecha
                                            })
                                            // guarda el registro
                                            registro.save().then( reg => {
                                                // busco las tecnicas de la sucursal del usuario
                                                Tecnica.find({ sucursal: usuario.sucursal },{ nombreCompleto: 1 }).exec( (err, tecnicas) => {
                                                    if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                                        // busca los productos basicos de la sucursal
                                                        Producto.find({ esBasico: true },{ nombre: 1 }).exec( (err, productos) => {
                                                            if(!err && productos){ // si no hubo error y existen productos
                                                                res.render("./basicos/manager",{ usuario, tecnicas , productos , Asignado: true, AlertAsignado: false, Baja: false, Alertbaja: false, AlertYaAsignado: false, AlertNoAsignado: false})
                                                            }else{ // si hubo un error
                                                                if(err) console.log(err) // imprime el error
                                                                res.redirect("/producto/new")
                                                            }
                                                        })
                                                    }else{ // si paso algun error
                                                        if(err) console.log(err) // imprime el error si hubo
                                                        res.redirect("/tecnicas/new")
                                                    }
                                                })

                                            }, err => { // si ocurre un error lo imprime
                                                console.log(err)
                                            })
                                        }else{ // si hubo un error
                                            console.log(err)
                                            res.redirect("/almacen")
                                        }
                                    }
                                })

                            }else{ // si hubo un error
                                if(err) console.log(err)
                                res.redirect("/tecnicas/new")
                            }
                        })
                    }else{ // si no hay producto en el almacen
                        // busco las tecnicas de la sucursal del usuario
                        Tecnica.find({ sucursal: usuario.sucursal },{ nombreCompleto: 1 }).exec( (err, tecnicas) =>{
                            if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                // busca los productos basicos de la sucursal
                                Producto.find({ esBasico: true },{ nombre: 1 }).exec( (err, productos) => {
                                    if(!err && productos){ // si no hubo error y existen productos
                                        res.render("./basicos/manager",{ usuario, tecnicas , productos, Asignado: false, AlertAsignado: true ,Baja: false, Alertbaja: false, AlertYaAsignado: false, AlertNoAsignado: false})
                                    }else{ // si hubo un error
                                        if(err) console.log(err) // imprime el error
                                        res.redirect("/producto/new")
                                    }
                                })
                            }else{ // si paso algun error
                                if(err) console.log(err) // imprime el error si hubo
                                res.redirect("/tecnicas/new")
                            }
                        })
                    }
                }else{ // si hubo error o el producto no existe
                    if(!productoAlm){ // si no hay producto mando alerta
                        // busco las tecnicas de la sucursal del usuario
                        Tecnica.find({ sucursal: usuario.sucursal},{ nombreCompleto: 1 }).exec( (err, tecnicas) => {
                            if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                // busca los productos basicos de la sucursal
                                Producto.find({ esBasico: true }, { nombre: 1 }).exec( (err, productos) => {
                                    if(!err && productos){ // si no hubo error y existen productos
                                        res.render("./basicos/manager",{ usuario, tecnicas , productos , Asignado: false, AlertAsignado: true, Baja: false, Alertbaja: false, AlertYaAsignado: false, AlertNoAsignado: false})
                                    }else{ // si hubo un error
                                        if(err) console.log(err) // imprime el error
                                        res.redirect("/producto/new")
                                    }
                                })
                            }else{ // si paso algun error
                                if(err) console.log(err) // imprime el error si hubo
                                res.redirect("/tecnicas/new")
                            }
                        })
                    }else{
                        console.log(err)
                        res.redirect("/products/new")
                    }
                }
            })
        }else{ // si hubo error
            if(err) console.log(err)
            res.redirect("/products/new")
        }
    })
}

function basicosDelete(req, res) {
    let usuario = req.session.user
    // dar de baja un producto basico
    // busco el producto a quitar
    Producto.findOne({ nombre: req.body.producto },{ _id: 1 }).exec( (err, producto) => {
        if(!err && producto){ // si no hubo error y el producto existe
            // verifico si almenos hay un producto en consumo
            Consumo.findOne({ producto: producto._id, sucursal: usuario.sucursal }).exec( (err, productoCon) => {
                if(!err && productoCon){ // si no hubo error y el producto existe
                    if(productoCon.cantidad > 0){ // si hay mas de un producto en consumo
                        // busco a la tecnica para asignarle la baja
                        Tecnica.findOne({ nombreCompleto: req.body.tecnica },{ _id: 1 }).exec( (err, tecnica) => {
                            if(!err && tecnica){ // si no hubo error y la tecnica existe
                                // busco en los basicos
                                Basico.findOne({ sucursal: usuario.sucursal, tecnica: tecnica._id, producto: producto._id }).exec( (err, productoBasico) => {
                                    if(!err && productoBasico){ // si no hay error y existe el registro del producto
                                        if(productoBasico.enUso){ // si esta en uso, entonces hace la baja
                                            // pone que no esta en uso ese producto
                                            res.locals.productoBasicoUpdate = productoBasico
                                            res.locals.productoBasicoUpdate.enUso = false // se le resta 1
                                            res.locals.productoBasicoUpdate.save( err => {
                                                if(err) console.log(err)
                                            })
                                            // le resto un producto al consumo
                                            res.locals.productoConUpdate = productoCon
                                            res.locals.productoConUpdate.cantidad -= 1 // se le resta 1
                                            res.locals.productoConUpdate.save( err => {
                                                if(err) console.log(err)
                                            })
                                            //--------------------------------
                                            // realizo la baja del producto
                                            // creo la fecha
                                            let fecha = new Date()
                                            fecha.setHours(fecha.getHours()-7)
                                            let baja = new Baja({
                                                sucursal: usuario.sucursal,
                                                usuario: usuario._id,
                                                cantidad: 1,
                                                producto: producto._id,
                                                tecnica: tecnica._id,
                                                fecha
                                            })
                                            // guarda la baja
                                            baja.save().then( baj => {
                                                // busco las tecnicas de la sucursal del usuario
                                                Tecnica.find({ sucursal: usuario.sucursal },{ nombreCompleto: 1 }).exec( (err,tecnicas) => {
                                                    if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                                        // busca los productos basicos de la sucursal
                                                        Producto.find({ esBasico: true },{ nombre: 1 }).exec( (err,productos) => {
                                                            if(!err && productos){ // si no hubo error y existen productos
                                                                res.render("./basicos/manager",{ usuario, tecnicas ,productos , Asignado: false, AlertAsignado: false, Baja: true, Alertbaja: false, AlertYaAsignado: false, AlertNoAsignado: false })
                                                            }else{ // si hubo un error
                                                                if(err) console.log(err) // imprime el error
                                                                res.redirect("/producto/new")
                                                            }
                                                        })
                                                    }else{ // si paso algun error
                                                        if(err) console.log(err) // imprime el error si hubo
                                                        res.redirect("/tecnicas/new")
                                                    }
                                                })

                                            }, err => { // si ocurre un error lo imprime
                                                console.log(err)
                                            })
                                            //-----------------------------
                                        }else{ // si no esta en uso, alerta que no puede dar de baja
                                            // busco las tecnicas de la sucursal del usuario
                                            Tecnica.find({ sucursal: usuario.sucursal },{ nombreCompleto: 1 }).exec( (err, tecnicas) => {
                                                if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                                    // busca los productos basicos de la sucursal
                                                    Producto.find({ esBasico: true },{ nombre: 1 }).exec( (err, productos) => {
                                                        if(!err && productos){ // si no hubo error y existen productos
                                                            res.render("./basicos/manager",{ usuario, tecnicas, productos, Asignado: false, AlertAsignado: false, Baja: false, Alertbaja: false, AlertYaAsignado: false, AlertNoAsignado: true })
                                                        }else{ // si hubo un error
                                                            if(err) console.log(err) // imprime el error
                                                            res.redirect("/producto/new")
                                                        }
                                                    })
                                                }else{ // si paso algun error
                                                    if(err) console.log(err) // imprime el error si hubo
                                                    res.redirect("/tecnicas/new")
                                                }
                                            })
                                        }
                                    }else{ // si paso algo
                                        if(!productoBasico){ // si no hay registro del producto
                                            // busco las tecnicas de la sucursal del usuario
                                            Tecnica.find({ sucursal: usuario.sucursal },{ nombreCompleto: 1 }).exec( (err, tecnicas) => {
                                                if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                                    // busca los productos basicos de la sucursal
                                                    Producto.find({ esBasico: true }, { nombre: 1 }).exec( (err, productos) => {
                                                        if(!err && productos){ // si no hubo error y existen productos
                                                            res.render("./basicos/manager",{ usuario, tecnicas, productos, Asignado: false, AlertAsignado: false, Baja: false, Alertbaja: false, AlertYaAsignado: false, AlertNoAsignado: true })
                                                        }else{ // si hubo un error
                                                            if(err) console.log(err) // imprime el error
                                                            res.redirect("/producto/new")
                                                        }
                                                    })
                                                }else{ // si paso algun error
                                                    if(err) console.log(err) // imprime el error si hubo
                                                    res.redirect("/tecnicas/new")
                                                }
                                            })
                                        }else{ // si hubo error
                                            console.log(err)
                                            res.redirect("/basicos")
                                        }
                                    }
                                })

                            }else{ // si hubo un error
                                if(err) console.log(err)
                                res.redirect("/tecnicas/new")
                            }
                        })
                    }else{ // si no hay producto en consumo
                        // busco las tecnicas de la sucursal del usuario
                        Tecnica.find({ sucursal: usuario.sucursal }, { nombreCompleto: 1 }).exec( (err, tecnicas) => {
                            if(!err && tecnicas){ // si no hubo error y existen tecnicas
                                // busca los productos basicos de la sucursal
                                Producto.find({ esBasico: true },{ nombre: 1 }).exec( (err, productos) => {
                                    if(!err && productos){ // si no hubo error y existen productos
                                        res.render("./basicos/manager",{ usuario, tecnicas, productos, Asignado: false, AlertAsignado: false, Baja: false, Alertbaja: true, AlertYaAsignado: false, AlertNoAsignado: false })
                                    }else{ // si hubo un error
                                        if(err) console.log(err) // imprime el error
                                        res.redirect("/producto/new")
                                    }
                                })
                            }else{ // si paso algun error
                                if(err) console.log(err)// imprime el error si hubo
                                res.redirect("/tecnicas/new")
                            }
                        })
                    }
                }else{ // si hubo error o el producto no existe
                    if(err) console.log(err)
                    res.redirect("/basicos")
                }
            })
        }else{ // si hubo error
            if(err) console.log(err)
            res.redirect("/products/new")
        }
    })
}

module.exports = {
    basicosGet,
    basicosPut,
    basicosDelete
}