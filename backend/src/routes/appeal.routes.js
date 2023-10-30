"use strict"
const express = require("express");

const appealController = require("../controllers/appeal.controller.js");

//const authorizationMiddleware = require("../middlewares/authorization.middleware.js");


//const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

const router = express.Router();

//router.use(authenticationMiddleware);

router.get("/", appealController.getAppeal);
router.post("/", appealController.createAppeal);
router.get("/:id", appealController.getAppealById);
router.delete("/:id", appealController.deleteAppeal);

module.exports = router;