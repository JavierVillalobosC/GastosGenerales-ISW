"use strict";

const express = require("express");
const router = express.Router();
const InteresController = require("../controllers/interes.controller.js");

// Ruta para aplicar interés
router.post("/", InteresController.aplicarInteres);

module.exports = router;
