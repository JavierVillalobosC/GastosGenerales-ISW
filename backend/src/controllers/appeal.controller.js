// src/controllers/appeal.controller.js
const appealService = require('../services/appeal.service');
const { eliminarInteres } = require("../services/interes.service.js");
const { respondSuccess, respondError } = require('../utils/resHandler');
const { handleError } = require('../utils/errorHandler');

/**
 * Obtiene todas las apelaciones
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de las apelaciones
 */ 

async function getAllAppeals(req, res) {
    try {
        const [appeals, errorAppeals] = await appealService.getAllAppeals();
        if (errorAppeals) return respondError(req, res, 404, errorAppeals);

        appeals.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, appeals);
    } catch (error) {
        handleError(error, 'appeal.controller -> getAllAppeals');
        respondError(req, res, 400, error.message);
    }
}

/**
 *  Crea una nueva apelación
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de apelación creado
 */

async function createAppeal(req, res) {
    try {
        const { body, files } = req;
        if (files) {
            for (let file of files) {
                const fileOwner = await fileService.getFileOwner(file.id);
                if (fileOwner !== user.id) {
                    return respondError(req, res, 403, 'User does not own the file');
                }
            }
            body.files = files.map(file => mongoose.Types.ObjectId(file.id));
        }
        const [newAppeal, appealError] = await appealService.createAppeal(body);

        if (appealError) return respondError(req, res, 400, appealError);
        if (!newAppeal) {
            return respondError(req, res, 400, 'No se creo la apelación');
        }

        respondSuccess(req, res, 201, newAppeal);
    } catch (error) {
        handleError(error, 'appeal.controller -> createAppeal');
        respondError(req, res, 500, 'No se creo la apelación');
    }
}

/**
 *  Obtiene una apelación por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de apelación
 */

async function getAppeal(req, res) {
    try {
        const { params } = req;
        const [appeal, errorAppeal] = await appealService.getAppeal(params.id);
        if (errorAppeal) return respondError(req, res, 404, errorAppeal);

        respondSuccess(req, res, 200, appeal);
    } catch (error) {
        handleError(error, 'appeal.controller -> getAppeal');
        respondError(req, res, 400, error.message);
    }
}

async function updateAppeal(req, res) {
    try {
        const { params, body } = req;
        const [appeal, errorAppeal] = await appealService.updateAppeal(params.id, body);
        if (errorAppeal) return respondError(req, res, 404, errorAppeal);

        respondSuccess(req, res, 200, appeal);
    } catch (error) {
        handleError(error, 'appeal.controller -> updateAppeal');
        respondError(req, res, 400, error.message);
    }
}

async function deleteAppeal(req, res) {
    try {
        const { params } = req;
        const [appeal, errorAppeal] = await appealService.deleteAppeal(params.id);
        if (errorAppeal) return respondError(req, res, 404, errorAppeal);

        respondSuccess(req, res, 200, appeal);
    } catch (error) {
        handleError(error, 'appeal.controller -> deleteAppeal');
        respondError(req, res, 400, error.message);
    }
}

/**
 *  Obtiene todas las apelaciones de un usuario
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de las apelaciones del usuario
 */

async function getAppealsByUser(req, res) {
    try {
        const { params } = req;
        const [appeals, errorAppeals] = await appealService.getAppealsByUser(params.userId);
        if (errorAppeals) return respondError(req, res, 404, errorAppeals);

        appeals.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, appeals);
    } catch (error) {
        handleError(error, 'appeal.controller -> getAppealsByUser');
        respondError(req, res, 400, error.message);
    }
}

async function updateAppealStatus(req, res) {
    try {
        const { params, body } = req;
        const [appeal, errorAppeal] = await appealService.updateAppealStatus(params.id, body.status);
        if (errorAppeal) return respondError(req, res, 404, errorAppeal);

        respondSuccess(req, res, 200, appeal);
    } catch (error) {
        handleError(error, 'appeal.controller -> updateAppealStatus');
        respondError(req, res, 400, error.message);
    }
}

module.exports = {
    getAllAppeals,
    createAppeal,
    getAppeal,
    updateAppeal,
    deleteAppeal,
    getAppealsByUser,
    updateAppealStatus
};