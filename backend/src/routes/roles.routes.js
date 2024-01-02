"use strict"
const express = require("express");

const rolesController = require("../controllers/roles.controller.js");

const authorizationMiddleware = require("../middlewares/authorization.middleware.js");


const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

const router = express.Router();
router.use(authenticationMiddleware);
router.get("/", rolesController.getRoles);
router.post("/", authorizationMiddleware.isAdmin, rolesController.createRole);
router.get("/name/:name", rolesController.getRoleByName);
router.put("/:id", authorizationMiddleware.isAdmin, rolesController.updateRole);
router.delete("/:id", authorizationMiddleware.isAdmin, rolesController.deleteRole);

module.exports = router;