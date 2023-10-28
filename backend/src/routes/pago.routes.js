"use strect"

const mongoose = require("mongoose");

const  pagosController = require("../controllers/pagos.controller.js");

const authorizationMiddleware = require("../middlewares/authorization.middleware.js");

const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

const router = express.Router();

router.use(authenticationMiddleware);

router.get("/", pagosController.getPagos);
router.post("/", authorizationMiddleware.isAdmin, pagosController.createPago);
router.get("/:id", pagosController.getPagoById);
router.put("/:id", authorizationMiddleware.isAdmin, pagosController.updatePago);
router.delete("/:id", authorizationMiddleware.isAdmin, pagosController.deletePago);

module.exports = router;