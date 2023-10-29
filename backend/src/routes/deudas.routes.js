"use strict"
const express = require("express");

const deudaController = require("../controllers/deudas.controller.js");

const authorizationMiddleware = require("../middlewares/authorization.middleware.js");


const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

const router = express.Router();

router.use(authenticationMiddleware);

router.get("/", deudaController.getDeudas);
router.post("/", authorizationMiddleware.isAdmin, deudaController.createDeuda);
router.get("/:id", deudaController.getDeudaById);
router.put("/:id", authorizationMiddleware.isAdmin, deudaController.updateDeuda);
router.delete("/:id", authorizationMiddleware.isAdmin, deudaController.deleteDeuda);

module.exports = router;