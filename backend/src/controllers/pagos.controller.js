"use strict";

const { respondSuccess, respondError } = require("../utils/resHandler");
const PayService = require("../services/pagos.service");
const { handleError } = require("../utils/errorHandler");

/**
 * Obtiene todos los pagos
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de los pagos
 */

async function getPagos(req, res) {
  try {
    const [pagos, errorPagos] = await PayService.getPagos();
    if (errorPagos) return respondError(req, res, 404, errorPagos);

    pagos.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, pagos);
  } catch (error) {
    handleError(error, "pagos.controller -> getPagos");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Crea un nuevo pago
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de pago creado
 */

async function createPago(req, res) {
  try {
    const { body } = req;
    const [newPago, pagoError] = await PayService.createPago(body);

    if (pagoError) return respondError(req, res, 400, pagoError);
    if (!newPago) {
      return respondError(req, res, 400, "No se creo el pago");
    }

    respondSuccess(req, res, 201, newPago);
  } catch (error) {
    handleError(error, "pagos.controller -> createPago");
    respondError(req, res, 500, "No se creo el pago");
  }
}

/**
 * Obtiene un pago por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de pago
 */

async function getPagoByUser(req, res) {
  try {
    const { params } = req;
    const [pago, errorPago] = await PayService.getPagoByUser(params.id);
    if (errorPago) return respondError(req, res, 404, errorPago);

    respondSuccess(req, res, 200, pago);
  } catch (error) {
    handleError(error, "pagos.controller -> getPagoByUser");
    respondError(req, res, 400, error.message);
  }
}

async function getPagoById(req, res) {
  try {
    const { params } = req;
    const [pago, errorPago] = await PayService.getPagoById(params.id);
    if (errorPago) return respondError(req, res, 404, errorPago);

    respondSuccess(req, res, 200, pago);
  } catch (error) {
    handleError(error, "pagos.controller -> getPagoById");
    respondError(req, res, 400, error.message);
  }
}

/**
 * 
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de pago actualizado
 */

async function updatePago(req, res) {
  try {
    const { params, body } = req;
    const [pago, errorPago] = await PayService.updatePago(params.id, body);
    if (errorPago) return respondError(req, res, 404, errorPago);
    
    respondSuccess(req, res, 200, pago);
  } catch (error) {
    handleError(error, "pagos.controller -> updatePago");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Elimina un pago por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de pago eliminado
 */

async function deletePago(req, res) {
  try {
    const { params } = req;
    const [pago, errorPago] = await PayService.deletePago(params.id);
    if (errorPago) return respondError(req, res, 404, errorPago);

    respondSuccess(req, res, 200, pago);
  } catch (error) {
    handleError(error, "pagos.controller -> deletePago");
    respondError(req, res, 400, error.message);
  }
}

module.exports = {
    getPagos,
    createPago,
    getPagoByUser,
    getPagoById,
    updatePago,
    deletePago,
};