"use strict";

const { respondSuccess, respondError } = require("../utils/resHandler");
const Debt = require("../models/deuda.model.js");
const Rol = require("../models/role.model.js");
const InterestService = require("../services/interes.service");
const { handleError } = require("../utils/errorHandler");
const User = require("../models/user.model.js");

/**
 * Aplica un porcentaje de interés a una deuda vencida y maneja la lista negra.
 */
async function aplicarInteres(req, res) {
    try {
        const { deudaId, tipoPago } = req.body;

        // Busca la deuda por ID
        const deuda = await Debt.findById(deudaId);

        if (!deuda) {
            return res.status(404).json({ error: "La deuda no existe" });
        }

        // Verifica si la deuda está vencida
        const currentDate = new Date();
        if (currentDate > deuda.finaldate) {
            // Calcula el interés según el tipo de pago
            let interes = 0;
            if (tipoPago === "total") {
                interes = 0.01; // Ejemplo: 1% de interés
            } else if (tipoPago === "parcial") {
                interes = 0.02; // Ejemplo: 2% de interés   
            }

            // Aplica el interés
            const nuevoMonto = deuda.amount * (1 + interes);
            deuda.amount = nuevoMonto;
            deuda.taxes = interes;

            // Guarda la deuda actualizada
            await deuda.save();

            return res.status(200).json({
                message: "Interés aplicado con éxito",
                interes: interes,
                deuda: deuda.amount
            });


        } else {
            return res.status(400).json({ error: "La deuda aún no está vencida" });
        }
    } catch (error) {
        handleError(error, "interes.controller -> aplicarInteres");
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

async function getIntereses (res)
{
    try
    {
        const intereses = await Debt.select('taxes').get();
        return res.status(200).json({
            message: "lista de intereses",
            intereses: intereses,
        });
    }
     catch(error)
     {
         handleError(error, "interes.controller -> getInteres");
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

module.exports = {
    aplicarInteres,
    getIntereses
};
