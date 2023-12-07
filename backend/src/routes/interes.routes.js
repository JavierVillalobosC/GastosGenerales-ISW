"use strict";

const express = require("express");
const router = express.Router();
const InteresController = require("../controllers/interes.controller.js");

router.post("/", InteresController.aplicarInteres);
router.get("/", InteresController.obtenerUsuariosEnListaNegra);
router.get("/update-blacklisted-users", InteresController.actualizarUsuariosBlacklisted);

module.exports = router;
