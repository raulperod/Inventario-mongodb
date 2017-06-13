/**
 * Created by Raul Perez on 13/06/2017.
 */
'use strict'

const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    bajaBasico_schema = new Schema({
        sucursal: {
            type: Schema.Types.ObjectId,
            ref:"Sucursal"
        },
        usuario: {
            type: Schema.Types.ObjectId,
            ref:"Usuario"
        },
        producto:{
            type: Schema.Types.ObjectId,
            ref:"Producto"
        },
        tecnica:{
            type: Schema.Types.ObjectId,
            ref:"Tecnica"
        },
        fecha:{
            type: Date,
            default: Date.now
        }
    }),
    BajaBasico = mongoose.model("BajaBasico",bajaBasico_schema,'bajasbasicos')

module.exports = BajaBasico