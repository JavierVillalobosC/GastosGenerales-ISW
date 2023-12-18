
const express = require("express");
const manualEmailController = require("../controllers/manualEmail.controller");
const router = express.Router();
const authorizationMiddleware = require("../middlewares/authorization.middleware.js");
const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

router.use(authenticationMiddleware);
router.post("/", authorizationMiddleware.isAdmin,manualEmailController.manualEmail);


module.exports = router;