// src/services/appeal.service.js
const Appeal = require('../models/appeal.model');
const User = require('../models/user.model');
const Debt = require("../models/deuda.model.js");
const { handleError } = require('../utils/errorHandler');
const { eliminarInteres } = require("../services/interes.service.js");

/**
 *  
 * @param {Object} appeal Objeto de apelación
 *  
 * @returns {Promise} Promesa con el objeto de apelación creado
 */ 

async function createAppeal(appeal) {
    try {
        console.log('createAppeal is running');
        const { userId, debtId, text, files } = appeal;

        if (!Array.isArray(files) || !files.every(file => typeof file === 'object')) {
        console.error('files debe ser un array de objetos');
        return;
    }

        console.log(typeof userId); // Debería imprimir 'number' si userId es un número
        console.log(typeof debtId); // Debería imprimir 'number' si debtId es un número
        console.log(`userId: ${userId}, debtId: ${debtId}`);
        
        const userFound = await User.findById(userId);
        if (!userFound) return [null, 'El usuario no existe'];

        // Verifica si la deuda específica tiene interés aplicado
        const debt = await Debt.findOne({ _id: debtId, user: userId, interestApplied: true });
        if (!debt) {
            console.error(`No se encontró ninguna deuda con id: ${debtId}, user: ${userId}, interestApplied: true`); // Imprime un mensaje de error si no se encontró la deuda
            return [null, 'La deuda no existe o no tiene interés aplicado'];
        }

        const appealCreated = await Appeal.create({ userId, debtId, text, files }); // Guarda los archivos en la base de datos
        return [appealCreated, null];
    } catch (error) {
        handleError(error, 'appeal.service -> createAppeal');
        return [null, 'No se creo la apelación'];
    }
}
/**
 *  
 *  
 * @returns {Promise} Promesa con el objeto de apelación
 */

async function getAllAppeals() {
    try {
        const appeals = await Appeal.find().populate('userId', 'username email').exec();

        if (!appeals) return [null, 'No hay apelaciones'];

        return [appeals, null];
    } catch (error) {
        handleError(error, 'appeal.service -> getAllAppeals');
    }
}

/**
 *  
 * @param {String} id Id de la apelación
 *  
 * @returns {Promise} Promesa con el objeto de apelación
 */

async function getAppeal(id) {
    try {
        const appeal = await Appeal.findById(id)
            .populate('userId')
            .populate('debtId')
            .exec();

        if (!appeal) return [null, 'La apelación no existe'];

        return [appeal, null];
    } catch (error) {
        handleError(error, 'appeal.service -> getAppeal');
    }
}

/**
 *  
 * @param {String} id Id de la apelación
 *  
 *  @returns {Promise} Promesa con el objeto de apelación actualizado
 * 
 */

async function updateAppeal(id, status) {
    try {
        const appealFound = await Appeal.findById(id);
        if (!appealFound) return [null, 'La apelación no existe'];

        const newAppeal = new Appeal({
            id,
            userId: appealFound.userId,
            text: appealFound.text,
            status
        });

        await newAppeal.save();

        return [newAppeal, null];
    } catch (error) {
        handleError(error, 'appeal.service -> updateAppeal');
    }
}

/**
 *  
 *  @param {String} id Id de la apelación
 *  
 *  @returns {Promise} Promesa con el objeto de apelación eliminado
 */

async function deleteAppeal(id) {
    try {
        const appealFound = await Appeal.findById(id);
        if (!appealFound) return [null, 'La apelación no existe'];

        await Appeal.findByIdAndDelete(id);

        return [appealFound, null];
    } catch (error) {
        handleError(error, 'appeal.service -> deleteAppeal');
    }
}

/**
 *  
 * @param {String} userId Id del usuario
 *  
 * @returns {Promise} Promesa con el objeto de apelaciones del usuario
 */

async function getAppealsByUser(userId) {
    try {
        const appeals = await Appeal.find({ userId })
            .populate('userId')
            .populate('debtId')
            .exec();

        if (!appeals) return [null, 'El usuario no tiene apelaciones'];

        return [appeals, null];
    } catch (error) {
        handleError(error, 'appeal.service -> getAppealsByUser');
    }
}

async function updateAppealStatus(id, status) {
    try {
        const appeal = await Appeal.findByIdAndUpdate(id, { status }, { new: true });
        if (!appeal) return [null, 'Appeal not found'];

        // Si el estado es 'Aprobada', eliminar el interés
        if (status === 'Aprobada') {
            const userDebt = await Debt.findOne({ user: appeal.userId, interestApplied: true });
            if (userDebt) {
                // Restar el monto del interés de la deuda
                userDebt.amount -= userDebt.amount * 0.15; // Asume que el interés es del 15%
                // Establecer interestApplied en false
                userDebt.interestApplied = false;
                // Guardar la deuda actualizada
                await userDebt.save();

                console.log(`Se eliminó el interés para el usuario con id ${appeal.userId}`);
            } else {
                console.log(`No se eliminó ningún interés para el usuario con id ${appeal.userId}`);
            }
        }

        return [appeal, null];
    } catch (error) {
        handleError(error, 'appeal.service -> updateAppealStatus');
    }
}

module.exports = {
    createAppeal,
    getAllAppeals,
    getAppeal,
    updateAppeal,
    deleteAppeal,
    getAppealsByUser,
    updateAppealStatus
};