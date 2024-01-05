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
        // Obtén todas las deudas a las que no se les ha aplicado interés y cuya fecha de vencimiento ha pasado
        const deudas = await Debt.find({ interestApplied: false, finaldate: { $lt: new Date() } }).exec();

        // Itera sobre cada deuda
        for (let debt of deudas) {
            // Busca al usuario asociado con la deuda
            const user = await User.findById(debt.user).exec();

            // Verifica que el usuario exista
            if (!user) {
                console.log(`No se encontró un usuario para la deuda con id ${debt._id}`);
                continue; // Salta al siguiente ciclo del bucle
            }

            // Establece un porcentaje de interés fijo
            const porcentajeInteres = 0.10; // 10% para todas las deudas

            // Calcula el interés basado en la deuda del usuario
            const interes = debt.amount * porcentajeInteres;

            // Calcula el valor final de la deuda con el interés agregado
            const valorFinal = debt.amount + interes;

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

            // Actualiza el valor 'amount' de la deuda con el nuevo valor de la deuda más el interés y establece 'interestApplied' en true
            await Debt.updateOne({ _id: debt._id }, { amount: valorFinal, interestApplied: true });

            /* // Obtén todas las deudas del usuario
            const userDebts = await Debt.find({ user: user._id }).exec();

            // Suma todas las deudas del usuario
            const totalDebt = userDebts.reduce((total, debt) => total + debt.amount, 0);

            // Actualiza la deuda del usuario
            user.debt = totalDebt;
            await user.save(); */
        }
    } catch (error) {
        handleError(error, "intereses.service -> crearInteres");
    }
}

async function addInteresbyId(id) {

    const porcentajeInteres = 0.05;
    try {
        // Encuentra la deuda específica
        const debt = await Debt.findOne({ id: id }).exec();

        // Verifica que la deuda exista
        if (!debt) {
            console.log(`No se encontró la deuda con id ${id}`);
            return;
        }

        // Calcula el interés basado en la deuda
        const interes = debt.amount * porcentajeInteres;

        // Calcula el valor final de la deuda con el interés agregado
        const valorFinal = debt.amount + interes;

        // Muestra un mensaje en la consola
        console.log(`> Se aplicó un interés del ${porcentajeInteres * 100}% a la deuda con ID ${debt._id}.\nEl interés es de ${interes}. \nEl valor final de la deuda con el interés agregado es ${valorFinal}.`);

        // Actualiza el valor de la deuda en la base de datos
        await Debt.updateOne({ id: id }, { amount: valorFinal });

        // Encuentra al usuario asociado con la deuda
        const user = await User.findById(debt.user).exec();

        // Verifica que el usuario exista
        if (!user) {
            console.log(`No se encontró un usuario para la deuda con id ${debt._id}`);
            return;
        }

        // Obtén todas las deudas del usuario
        const userDebts = await Debt.find({ user: user._id }).exec();

        // Suma todas las deudas del usuario
        const totalDebt = userDebts.reduce((total, debt) => total + debt.amount, 0);

        // Actualiza la deuda del usuario
        user.debt = totalDebt;
        await user.save();

        // Devuelve los valores que necesitas
        return {
            valorAnterior: debt.amount,
            valorInteres: interes,
            valorFinal: valorFinal,
            totalDebt: totalDebt
        };
    } catch (error) {
        handleError(error, "intereses.service -> addInteresById");
    }
}

async function listarDeudasConIntereses(userId) {
    try {
        // Busca todas las deudas del usuario con interestApplied: true
        const deudasConIntereses = await Debt.find({ user: userId, interestApplied: true }).exec();

        // Si no se encontraron deudas, muestra un mensaje y termina la función
        if (deudasConIntereses.length === 0) {
            console.log(`El usuario con id ${userId} no tiene deudas con intereses aplicados.`);
            return;
        }

        // Muestra las deudas en la consola
        console.log(`Deudas con intereses del usuario con id ${userId}:`, deudasConIntereses);
    } catch (error) {
        console.error('Error al listar las deudas con intereses:', error);
    }
}

module.exports = {
    getIntereses,
    crearInteres,
    listarDeudasConIntereses,
    addInteresbyId
};