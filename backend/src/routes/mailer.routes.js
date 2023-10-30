
const express = require("express");
const mailerController = require("../controllers/mailer.controller");
const router = express.Router();
const authorizationMiddleware = require("../middlewares/authorization.middleware.js");
const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

router.use(authenticationMiddleware);
router.post("/", authorizationMiddleware.isAdmin,mailerController.sendMail);


module.exports = router;

