"use strict"

const mongoose = require('mongoose');
const Interest = require("../models/interes.model.js");
const { handleError } = require("../utils/errorHandler");
const Debt = require("../models/deuda.model.js");
const User = require("../models/user.model.js");
const Pay = require("../models/pago.model.js");

/**
 * 
 * @returns {Promise} Promesa con el objeto de los intereses
 */

async function getIntereses() {
    try {
        const intereses = await Interest.find()
        .populate("user")
        .exec();

        if (!intereses) return [null, "No hay intereses aplicados."];

        return [intereses, null];
    } catch (error) {
        handleError(error, "intereses.service -> getIntereses");
    }
}

async function crearInteres() {
    try {
        // Obtén todas las deudas
        const deudas = await Debt.find().exec();

        // Itera sobre cada deuda
        for (let debt of deudas) {
            // Si la fecha de vencimiento ha pasado
            if (new Date(debt.finaldate) < new Date()) {
                // Busca al usuario asociado con la deuda
                const user = await User.findById(debt.user).exec();

                // Verifica que el usuario exista
                if (!user) {
                    console.log(`No se encontró un usuario para la deuda con id ${debt._id}`);
                    continue; // Salta al siguiente ciclo del bucle
                }

                // Busca el pago asociado con la deuda
                const pay = await Pay.findOne({ debt: debt._id }).exec();

                // Verifica que el pago exista
                /* if (!pay) {
                    console.log(`No se encontró un pago para la deuda con id ${debt._id}`);
                    continue; // Salta al siguiente ciclo del bucle
                } */

                // Determina el porcentaje de interés basado en el tipo de pago
                let porcentajeInteres;
                if (!pay) {
                    porcentajeInteres = 0.15; // Por ejemplo, 2% para deudas no pagadas
                } else if (pay.type === 'total') {
                    porcentajeInteres = 0.05; // Por ejemplo, 5% para pagos totales
                } else if (pay.type === 'parcial') {
                    porcentajeInteres = 0.10; // Por ejemplo, 10% para pagos parciales
                } else {
                    console.log(`Tipo de pago desconocido para la deuda con id ${debt._id}`);
                    continue; // Salta al siguiente ciclo del bucle
                }

                // Calcula el interés basado en la deuda del usuario
                const interes = user.debt * porcentajeInteres;

                // Calcula el valor final de la deuda con el interés agregado
                const valorFinal = user.debt + interes;

                // Muestra un mensaje en la consola
                console.log(`> Se aplicó un interés del ${porcentajeInteres * 100}% a la deuda con ID ${debt._id}.\nEl interés es de ${interes}. \nEl valor final de la deuda con el interés agregado es ${valorFinal}.`);

                // Crea un nuevo interés
                const newInterest = new Interest({
                    interesID: new mongoose.Types.ObjectId().toString(),
                    debt: debt._id,
                    amount: interes
                });

                // Guarda el nuevo interés en la base de datos
                await newInterest.save();
                // Actualiza el valor 'amount' de la deuda con el nuevo valor de la deuda más el interés
                await Debt.updateOne({ _id: debt._id }, { amount: valorFinal });
                
                // Suma el valor 'amount' de la deuda al valor 'debt' del usuario
                user.debt += valorFinal;

                // Guarda el usuario actualizado en la base de datos
                await user.save();
            }
        }
    } catch (error) {
        handleError(error, "intereses.service -> crearInteres");
    }
}

module.exports = {
    getIntereses,
    crearInteres
};