/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const CategoriaModel = require("../models/categoria"),
      ProductoModel = require("../models/producto"),
      AlmacenModel = require("../models/almacen"),
      MovimientoModel = require("../models/movimiento"),
      BajaModel = require("../models/baja"),
      fs = require('fs'),
      xlstojson = require("xls-to-json-lc"),
      xlsxtojson = require("xlsx-to-json-lc"),
      excel = require('./exel'),
      Utilidad = require('../ayuda/utilidad')

function productsGet(req, res) {
    // busca todos los productos de la base de datos
    ProductoModel.find({}).populate("categoria").exec( (error, productos) => {
        if(error){ // si hubo error
            console.log(`Error al obtener los productos: ${error}`)
            res.redirect("/almacen")
        }else{ // si no hubo error
            res.render("./products/manager",{ productos, usuario: req.session.user })
        }
    })
}

function productsNewGet(req, res) {
    // busca el nombre de todas las categorias
    CategoriaModel.find({},{_id:0,nombre:1}).exec( (error, categorias) => {
        if(error){ // si hubo error
            console.log(`Error al obtener las categorias: ${error}`)
            res.redirect("/products")
        }else{ // si no hubo un error
            res.render("./products/new",{ usuario: req.session.user, categorias })
        }
    })
}

function productsNewPost(req, res) {
    // busca la categoria elegida
    CategoriaModel.findOne({nombre:req.body.categoria},{_id:1}).exec((error, categoria) => {
        if(error){
            Utilidad.printError(res, {msg:`Erro al obtener la categoria: ${error}`, tipo: 0})
        } else{
            // crea un producto
            let producto = new ProductoModel({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                codigo: req.body.codigo,
                minimo: req.body.minimo,
                esbasico: req.body.basico === 'Si',
                categoria: categoria._id
            })
            producto.save( error => {
                if(error){
                    Utilidad.printError(res, {msg:`Error al guardar el producto: ${error}`, tipo: 1})
                }else{
                    // generar almacenes
                    // si es basico, generar basicos en uso
                    res.json({msg:`Producto guardado correctamente`, tipo: 3})
                }
            })
        }
    })
}

function productsIdProductoGet(req, res) {
    // busco el nombre de todas las categorias
    Categoria.find({},{_id:0,nombre:1}).exec( (error, categorias) => {
        if(error){ // si hay error
            console.log(`Error al obtener las categorias: ${error}`)
            res.redirect("/products")
        }else{ // si no hubo un error
            // busco al producto
            Producto.findById(req.params.idProducto).exec( (error, productoUpdate) => {
                if(error){ // si no hay error y el producto existe
                    console.log(`Error al obtener el producto: ${error}`)
                    res.redirect("/products")
                }else{ // si hubo un error
                    res.render("./products/update",{categorias, productoUpdate})
                }
            })
        }
    })
}

function productsIdProductoPut(req, res) {
    let idProducto = req.params.idProducto
    // busco el id de la categoria
    CategoriaModel.findOne({nombre:req.body.categoria},{_id:1}).exec((error, categoria) => {
        if(error){
            Utilidad.printError(res, {msg:`Error al obtener la categoria: ${error}`, tipo:0})
        } else {
            let productoUpdate = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                codigo: req.body.codigo,
                minimo: req.body.minimo,
                esbasico: req.body.basico === 'Si',
                categoria: categoria._id
            }
            // guardo el producto actualizado
            ProductoModel.findByIdAndUpdate(idProducto, productoUpdate).exec((error, productoUp) => {
                if(error){
                    Utilidad.printError(res, {msg:`Error al actualizar el producto: ${error}`, tipo:1})
                }else{
                    // generar los basicos, si el producto es un basico y antes no era
                    res.json({msg:`Producto actualizado correctamente`, tipo:3})
                }
            })
        }
    })
}

function productsIdProductoDelete(req, res) {
    let producto = req.params.idProducto
    // borra las bajas produccidas por el producto
    BajaModel.remove({producto}).exec( error => { if(error) console.log(error) })
    // borra los movimientos produccidos por el producto
    MovimientoModel.remove({producto}).exec( error => { if(error) console.log(error) })
    // borra los productos en el almacen del producto
    AlmacenModel.remove({producto}).exec( error => { if(error) console.log(error) })
    // borra el producto
    ProductoModel.findByIdAndRemove(producto).exec( error => { (error) ? console.log(error) : res.redirect("/products") })
}

function excelGet(req, res) {
    res.render("./products/excel",{ usuario: req.session.user})
}

function excelPost(req, res) {
    let exceltojson,
        usuario = req.session.user
    excel.upload(req, res, err => {
        if(err){
            Utilidad.printError(res, { msg: `error inesperado: ${err}`, tipo: 1})
            return
        }
        // Multer gives us file info in req.file object
        if(!req.file){
            Utilidad.printError(res, { msg: `no hay archivo`, tipo: 1})
            return
        }

        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
        }else{
            exceltojson = xlstojson;
        }

        exceltojson({ input: req.file.path, output: null, lowerCaseHeaders:true }, (error, productos) => {
            // borrar el archivo
            fs.unlinkSync(req.file.path)
            if(error){
                if(err) console.log(err)
                res.redirect("/products")
                return
            }
            // si no hubo error
            let contador = 0,
                longitud = productos.length
            for( let i=0 ; i < longitud ; i++ ){
                // variables necesarias
                let producto = productos[i],
                    nombreCategoria = producto.categoria
                // busca la categoria elegida
                CategoriaModel.findOne({nombre:nombreCategoria},{_id:1}).exec( (error, categoria) => {
                    if(error || !categoria ){ // si hubo error
                        i = longitud // detengo el ciclo
                        Utilidad.printError(res, {msg: "Hubo error al agregar alguno de los productos", tipo: 2} )
                        res = null
                    } else {// si no hubo error
                        // crea el nuevo producto
                        let nuevoProducto = new ProductoModel({
                            nombre: producto.nombre,
                            descripcion: producto.descripcion,
                            codigo: producto.codigo,
                            minimo: producto.minimo,
                            esbasico: producto.basico.toLowerCase() === 'si',
                            categoria: categoria._id
                        })
                        // guarda el nuevo producto en la base de datos
                        nuevoProducto.save( (error, nuevoProducto) => { // si no hubo error al guardarlo
                            if(error){
                                i = longitud // detengo el ciclo
                                // mando una alerta
                                Utilidad.printError(res, {msg: `Hubo error al agregar alguno de los productos: ${error}`, tipo: 2} )
                                res = null
                            } else {
                                console.log(`se agrego correctamente el producto: ${nuevoProducto.nombre}`)
                                contador++
                                // checa si hay error
                                if ( i === (longitud - 1) ){
                                    if(contador === 5){
                                        Utilidad.printError(res, {msg: "Se agregaron correctamente los productos", tipo: 3})
                                    }else{
                                        Utilidad.printError(res, { msg: "Hubo error al agregar alguno de los productos", tipo: 2})
                                    }
                                }
                            }
                        })
                    }
                })
            }
        })
    })
}

module.exports = {
    productsGet,
    productsNewGet,
    productsNewPost,
    productsIdProductoGet,
    productsIdProductoPut,
    productsIdProductoDelete,
    excelGet,
    excelPost
}
