"use strict";

const { respondSuccess } = require("../utils/resHandler");
const Debt = require("../models/deuda.model.js");
const Rol = require("../models/role.model.js");
const { handleError } = require("../utils/errorHandler");
const User = require("../models/user.model.js");
const schedule = require('node-schedule'); // Import node-schedule

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

            // Programa la tarea para mover al cliente a la lista negra después de 5 días
            const fiveDaysLater = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000);
            schedule.scheduleJob(fiveDaysLater, async function() {
                const deuda = await Debt.findById(deudaId);
                if (!deuda.paid && !deuda.appealed) {
                    const user = await User.findById(deuda.userId);
                    user.blacklisted = true;
                    await user.save();
                    console.log(`El usuario con ID ${user._id} ha sido agregado a la lista negra.`);
                }
            });
        }

        return respondSuccess(req, res, 200, deuda);
    } catch (error) {
        return handleError(res, error);
    }
}

module.exports = {
    aplicarInteres
};