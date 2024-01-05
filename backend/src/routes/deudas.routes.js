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
router.put('/removeFromBlacklist', deudaController.removeFromBlacklist);
router.put("/:id", authorizationMiddleware.isAdmin, deudaController.updateDeuda);
router.delete("/:id", authorizationMiddleware.isAdmin, deudaController.deleteDeuda);
router.get("/user/:id", deudaController.getDeudasByUserId);
router.put("/reset", authorizationMiddleware.isAdmin, deudaController.resetDebtAmountsController);

router.get('/deudas-con-intereses', async (req, res) => {
    const [deudas, error] = await getDeudasinterest();
    if (error) {
      res.status(500).json({ error });
    } else {
      res.json(deudas);
    }
  });

router.get('/deudas-con-intereses/:email', (req, res) => {
    const email = req.params.email;
  
    getDeudasByEmail(email)
      .then(deudas => {
        res.json(deudas);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Hubo un error al obtener las deudas del usuario' });
      });
  });

module.exports = router;