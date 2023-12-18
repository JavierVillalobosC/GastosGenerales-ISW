"use strict"

const express = require("express");

const debtstatesController = require("../controllers/debstates.controller.js");

const authorizationMiddleware = require("../middlewares/authorization.middleware.js");

const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

const router = express.Router();
router.use(authenticationMiddleware);
router.get("/", debtstatesController.getDebtStates);
router.get("/:id", debtstatesController.getDebtStatesById);

module.exports = router;