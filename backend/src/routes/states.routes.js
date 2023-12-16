"user strict"
 const express = require("express");

 const statesController = require("../controllers/states.controller.js");

 const authorizationMiddleware = require("../middlewares/authorization.middleware.js");


 const authenticationMiddleware = require("../middlewares/authentication.middleware.js");
 
 const router = express.Router();
 router.use(authenticationMiddleware);
 router.get("/", statesController.getStates);
 router.get("/:id", statesController.getStatesById);

 module.exports = router;