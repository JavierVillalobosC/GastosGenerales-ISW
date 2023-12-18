"use strict"
const express = require("express");
const categoriaController = require("../controllers/categorias.controller.js");
const authorizationMiddleware = require("../middlewares/authorization.middleware.js");

const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

const router = express.Router();

router.use(authenticationMiddleware);
router.get("/", categoriaController.getCategorias);
router.get("/:id", categoriaController.getCategoriasById);

module.exports = router;