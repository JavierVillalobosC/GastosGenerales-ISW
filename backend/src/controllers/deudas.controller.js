"use strict";

const { respondSuccess, respondError } = require("../utils/resHandler");
const DebtService = require("../services/deudas.service");
const { handleError } = require("../utils/errorHandler");


/**
 * Obtiene todas las deudas
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de las deudas
 */

async function getDeudas(req, res) {
    try {
        const [deudas, errorDeudas] = await DebtService.getDeudas();
        if (errorDeudas) return respondError(req, res, 404, errorDeudas);

    deudas.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, deudas);
  } catch (error) {
    handleError(error, "deudas.controller -> getDeudas");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Crea una nueva deuda
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de deuda creado
 */

async function createDeuda(req, res) {
    try {
      const { body } = req;
      const [newDeuda, deudaError, valorcuota] = await DebtService.createDeuda(body);

      console.log(`El valor de la cuota es: ${valorcuota}`);
  
      if (deudaError) return respondError(req, res, 400, deudaError);
      if (!newDeuda) {
        return respondError(req, res, 400, "No se creo la deuda");
      }
  
      respondSuccess(req, res, 201, newDeuda);
    } catch (error) {
      handleError(error, "deudas.controller -> createDeuda");
      respondError(req, res, 500, "No se creo la deuda");
    }
  }

/**
 * Obtiene una deuda por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de deuda
 */

async function getDeudaById(req, res) {
    try {
      const { params } = req;
      const [deuda, errorDeuda] = await DebtService.getDeudaById(params.id);
      if (errorDeuda) return respondError(req, res, 404, errorDeuda);
  
      respondSuccess(req, res, 200, deuda);
    } catch (error) {
      handleError(error, "pagos.controller -> getPagoById");
      respondError(req, res, 400, error.message);
    }
  }

/**
 * 
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de deuda actualizado
 */

async function updateDeuda(req, res) {
    try {
      const { params, body } = req;
      const [deuda, errorDeuda] = await DebtService.updateDeuda(params.id, body);
      if (errorDeuda) return respondError(req, res, 404, errorDeuda);
      
      respondSuccess(req, res, 200, deuda);
    } catch (error) {
      handleError(error, "deudas.controller -> updateDeuda");
      respondError(req, res, 400, error.message);
    }
  }

/**
 * Elimina una deuda por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns {Promise} Promesa con el objeto de deuda eliminado
 */

async function deleteDeuda(req, res) {
    try {
      const { params } = req;
      const [deuda, errorDeuda] = await DebtService.deleteDeuda(params.id);
      if (errorDeuda) return respondError(req, res, 404, errorDeuda);
  
      respondSuccess(req, res, 200, deuda);
    } catch (error) {
      handleError(error, "deuda.controller -> deleteDeuda");
      respondError(req, res, 400, error.message);
    }
  }
  
  module.exports = {
      getDeudas,
      createDeuda,
      getDeudaById,
      updateDeuda,
      deleteDeuda,
  };