"use strict"

const Debt = require("../models/deuda.model.js");
const User = require("../models/user.model.js");
const { handleError } = require("../utils/errorHandler");
const debtStates = require("../models/debtstate.model.js");
const Categoria = require("../models/categorias.model.js");
const schedule = require('node-schedule');
<<<<<<< HEAD
=======
const DEBTSTATES = require('../constants/debtstates.constants.js');


>>>>>>> c2b1ae07ab5da280e685aec5d15696469127cc1f
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

    const { id, user, idService, initialdate, finaldate, amount, numerocuotas, estado } = deuda;
    
    const deudaFound = await Debt.findOne({ id: deuda.id });
    if (deudaFound) return [null, "La deuda ya existe"];

    const userFound = await User.findById(user);
    if (!userFound) return [null, "El usuario no existe"];

    const debtStatesFound = await debtStates.find({ name: { $in: estado } });
    if (debtStatesFound.length === 0) return [null, "El estado no existe"];
    const mydebtStates = debtStatesFound.map((estado) => estado._id);

    const idServiceFound = await Categoria.find({ name: { $in: idService } });
    if (idServiceFound.length === 0) return [null, "El servicio especificado no existe"];
    const myidService = idServiceFound.map((idService) => idService._id);
    
    // Actualizar la deuda del usuario
    userFound.debt += amount;
    userFound.estado = mydebtStates;
    await userFound.save();

    let valorcuota = userFound.debt / numerocuotas;

    const newDebt = new Debt({
        id,
        user,
        idService: myidService,
        initialdate,
        finaldate,
        amount,
        actualamount: userFound.debt,
        valorcuota,
        numerocuotas,
        estado: mydebtStates
    });

    await newDebt.save();

    const blacklistDate = new Date(newDebt.finaldate);
    blacklistDate.setSeconds(blacklistDate.getSeconds() + 10);

    // Función para agregar al usuario a la lista negra
    const addToBlacklist = async function() {
        const user = await User.findById(newDebt.user);
        user.blacklisted = true;
        await user.save();
        console.log(`El usuario con ID ${user._id} ha sido agregado a la lista negra.`);
    };

    // Verifica si la fecha de vencimiento ya ha pasado
    if (blacklistDate < new Date()) {
    // Si la fecha de vencimiento ya ha pasado, agrega al usuario a la lista negra inmediatamente
    addToBlacklist();
    } else {
    // Si la fecha de vencimiento aún no ha pasado, programa un trabajo para agregar al usuario a la lista negra
    schedule.scheduleJob(blacklistDate, addToBlacklist);
    }

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

        const { user, idService, initialdate, finaldate, amount, numerocuotas, estado  } = deuda;

        const deudaFound = await Debt.findById(id);
        if (!deudaFound) return [null, "La deuda no existe"];

        const userFound = await User.findById(user);
         if (!userFound) return [null, "El usuario no existe"];

        const debtStatesFound = await debtStates.find({ name: { $in: estado } });
        if (debtStatesFound.length === 0) return [null, "El estado no existe"];
        const mydebtStates = debtStatesFound.map((estado) => estado._id);

        const idServiceFound = await Categoria.find({ name: { $in: idService } });
        if (idServiceFound.length === 0) return [null, "El servicio especificado no existe"];
        const myidService = idServiceFound.map((idService) => idService._id);
    
         // Actualizar la deuda del usuario
        userFound.debt += amount;
        userFound.estado = mydebtStates;

        // Si la deuda es cero, quita al usuario de la lista negra
        /* if (userFound.debt === 0 && userFound.blacklisted) {
            userFound.blacklisted = false;
        } */
        await userFound.save();

        let valorcuota = userFound.debt / numerocuotas;

        const newDeuda = new Debt({
            id,
            user,
            idService: myidService,
            initialdate,
            finaldate,
            amount,
            actualamount: userFound.debt,
            valorcuota,
            numerocuotas,
            estado: mydebtStates
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

async function removeFromBlacklist() {
    try {
        // Obtén todos los usuarios que están en la lista negra
        const blacklistedUsers = await User.find({ blacklisted: true });

        // Para cada usuario en la lista negra
        for (let user of blacklistedUsers) {
            // Obtén todas las deudas del usuario
            const userDebts = await Debt.find({ user: user._id });

            // Verifica si todas las deudas del usuario han sido pagadas
            const allDebtsPaid = userDebts.every(debt => debt.amount === 0);

            // Si todas las deudas del usuario han sido pagadas
            if (allDebtsPaid) {
                // Quita al usuario de la lista negra
                user.blacklisted = false;
                await user.save();
            }
        }
    } catch (error) {
        handleError(error, "deudas.service -> removeUsersFromBlacklistIfDebtsPaid");
    }
}

module.exports = {
    getDeudas,
    createDeuda,
    getDeudaById,
    updateDeuda,
    deleteDeuda,
    removeFromBlacklist
};



