'use strict'

const express = require("express"),
      ConsumoController = require('../controllers/consumo'),
      consumo = express.Router()

// gelishtime/consumos
consumo
        .get("/", ConsumoController.consumosGet )
// gelishtime/consumos/:idConsumo
consumo
        .put("/:idConsumo", ConsumoController.consumosIdConsumoPut )

module.exports = consumo
