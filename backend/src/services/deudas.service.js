"use strict"

const Debt = require("../models/deuda.model.js");
const User = require("../models/user.model.js");
const { handleError } = require("../utils/errorHandler");

/**
 * 
 * @returns {Promise} Promesa con el objeto de las deudas
 */

async function getDeudas() {
    try {
        const deudas = await Debt.find()
        .populate("user")
        .exec();

        if (!deudas) return [null, "No hay deudas"];

        return [deudas, null];
    } catch (error) {
        handleError(error, "deudas.service -> getDeudas");
    }
}

/**
 * 
 * @param {Object} deuda Objeto de deuda
 * @returns {Promise} Promesa con el objeto de deuda creado
 */

async function createDeuda(deuda) {
    try{

    const { id, user, idService, initialdate, finaldate, amount, numerocuotas } = deuda;
    
    const deudaFound = await Debt.findOne({ id: deuda.id });
    if (deudaFound) return [null, "La deuda ya existe"];

    const userFound = await User.findById(user);
    if (!userFound) return [null, "El usuario no existe"];
    
    // Actualizar la deuda del usuario
    userFound.debt += amount;
    await userFound.save();

    let valorcuota = amount / numerocuotas;

    const newDebt = new Debt({
        id,
        user,
        idService,
        initialdate,
        finaldate,
        amount,
        valorcuota,
        numerocuotas,
    });
    await newDebt.save();



    return [newDebt, null, valorcuota];
    } catch (error) {
        handleError(error, "deudas.service -> createDeuda");
    }
}

/**
 *
 * @param {string} Id de la deuda
 * @returns {Promise} Promesa con el objeto de deuda
 */

async function getDeudaById(id) {
    try {
        const deuda = await Debt.findById({ _id: id })
        .populate("user")
        .exec();
        if (!deuda) return [null, "La deuda no existe"];

        return [deuda, null];
    } catch (error) {
        handleError(error, "deudas.service -> getDeudaById");
    }
}

/**
 * 
 * @param {string} Id de la deuda
 * @returns {Promise} Promesa con el objeto de deuda actualizado
 */

async function updateDeuda(id, deuda) {
    try {
        const deudaFound = await Debt.findById(id);
        if (!deudaFound) return [null, "La deuda no existe"];

        const { user, idService, initialdate, finaldate, amount } = deuda;
        const newDeuda = new Debt({
            id,
            user,
            idService,
            initialdate,
            finaldate,
            amount,
        });
        await newDeuda.save();

        return [newDeuda, null];
    } catch (error) {
        handleError(error, "deudas.service -> updateDeuda");
    }
}

/**
 * 
 * @param {string} Id de la deuda
 * @returns {Promise} Promesa con el objeto de deuda eliminada
 */

async function deleteDeuda(id) {
    try {
        const deudaFound = await Debt.findById(id);
        if (!deudaFound) return [null, "La deuda no existe"];

        await Debt.findByIdAndDelete(id);

        return [deudaFound, null];
    } catch (error) {
        handleError(error, "deudas.service -> deleteDeuda");
    }
}

module.exports = {
    getDeudas,
    createDeuda,
    getDeudaById,
    updateDeuda,
    deleteDeuda
};



