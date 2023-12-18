"use strict"
const express = require("express");

const pagoController = require("../controllers/pagos.controller.js");

const authorizationMiddleware = require("../middlewares/authorization.middleware.js");


const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

const router = express.Router();

router.use(authenticationMiddleware);

router.get("/", pagoController.getPagos);
router.post("/",  pagoController.createPago);
router.get("/:id", pagoController.getPagoById);
router.get("/user/:id", pagoController.getPagoByUser);
router.put("/:id", authorizationMiddleware.isAdmin, pagoController.updatePago);
router.delete("/:id", authorizationMiddleware.isAdmin, pagoController.deletePago);

module.exports = router;