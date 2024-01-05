"use strict";

const express = require("express");
const router = express.Router();
const InteresController = require("../controllers/interes.controller.js");
const { addInteresController } = require('../controllers/interes.controller.js');

router.post("/", InteresController.aplicarInteres);
router.get("/", InteresController.obtenerUsuariosEnListaNegra);
router.get("/update-blacklisted-users", InteresController.actualizarUsuariosBlacklisted);
router.get("/users/:userId/", InteresController.listarDeudasConIntereses);
router.post('/addInteres/:id', addInteresController);

module.exports = router;
