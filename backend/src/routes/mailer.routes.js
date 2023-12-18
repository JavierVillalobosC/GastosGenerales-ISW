
const express = require("express");
const mailerController = require("../controllers/mailer.controller");
const router = express.Router();
const authorizationMiddleware = require("../middlewares/authorization.middleware.js");
const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

router.use(authenticationMiddleware);
router.get("/", authorizationMiddleware.isAdmin, (req, res, next) => {
    mailerController.sendMail(1) // Aquí puedes poner el número de días que quieras
        .then(() => res.status(200).send('Emails sent successfully'))
        .catch(next);
});

module.exports = router;

