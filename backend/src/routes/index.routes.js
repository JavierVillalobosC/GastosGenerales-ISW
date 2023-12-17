"use strict";
// Importa el modulo 'express' para crear las rutas
const express = require("express");

/** Enrutador de usuarios  */
const userRoutes = require("./user.routes.js");

/** Enrutador de autenticación */
const authRoutes = require("./auth.routes.js");

const pagoRoutes = require("./pagos.routes.js");

const statesRoutes = require("./states.routes.js");
const deudaRoutes = require("./deudas.routes.js");

const interesRoutes = require("./interes.routes.js");

const mailerRoutes = require("./mailer.routes.js");

const fileRoutes = require("./file.routes.js");

const categoriaRoutes = require("./categorias.routes.js");

const appealRoutes = require("./appeal.routes.js");
/** Middleware de autenticación */
const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

/** Instancia del enrutador */
const router = express.Router();

// Define las rutas para los usuarios /api/usuarios
router.use("/users", authenticationMiddleware, userRoutes);
// Define las rutas para la autenticación /api/auth
router.use("/auth", authRoutes);

router.use("/pagos", pagoRoutes);

router.use("/categorias", categoriaRoutes);
router.use("/deudas", deudaRoutes);

router.use("/interes", interesRoutes);

router.use("/sendMail", mailerRoutes);

router.use("/file", fileRoutes);

router.use("/appeals", appealRoutes);

router.use("/states", statesRoutes);
// Exporta el enrutador
module.exports = router;
