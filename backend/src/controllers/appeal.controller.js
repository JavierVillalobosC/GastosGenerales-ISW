"use strict";

const { respondSuccess, respondError } = require("../utils/resHandler");
const AppealService = require("../services/appeal.service");
const { handleError } = require("../utils/errorHandler");

/**
 * Obtiene todos las apelaciones
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de los appeals
 */

async function getAppeal(req, res) {
  try {
    const [appeals, errorAppeals] = await AppealService.getAppeal();
    if (errorAppeals) return respondError(req, res, 404, errorAppeals);

    appeals.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, appeals);
  } catch (error) {
    handleError(error, "appeals.controller -> getAppeals");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Crea un nuevo appeal
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de appeal creado
 */

async function createAppeal(req, res) {
  try {
    const { body } = req;
    const [newAppeal, appealError] = await AppealService.createAppeal(body);

    if (appealError) return respondError(req, res, 400, appealError);
    if (!newAppeal) {
      return respondError(req, res, 400, "No se creo la apelación");
    }

    respondSuccess(req, res, 201, newAppeal);
  } catch (error) {
    handleError(error, "appeals.controller -> createAppeal");
    respondError(req, res, 500, "No se creo la apelación");
  }
}

/**
 * Obtiene un appeal por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de appeal
 */

async function getAppealById(req, res) {
  try {
    const { params } = req;
    const [appeal, errorAppeal] = await AppealService.getAppealById(params.id);
    if (errorAppeal) return respondError(req, res, 404, errorAppeal);

    respondSuccess(req, res, 200, appeal);
  } catch (error) {
    handleError(error, "appeals.controller -> getAppealById");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Elimina un appeal por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de appeal eliminado
 */

async function deleteAppeal(req, res) {
  try {
    const { params } = req;
    const [appeal, errorAppeal] = await AppealService.deleteAppeal(params.id);
    if (errorAppeal) return respondError(req, res, 404, errorAppeal);

    respondSuccess(req, res, 200, appeal);
  } catch (error) {
    handleError(error, "appeals.controller -> deleteAppeal");
    respondError(req, res, 400, error.message);
  }
}

module.exports = {
    getAppeal,
    createAppeal,
    getAppealById,
    deleteAppeal
};