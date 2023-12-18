"use strict"

const { handleError } = require("../utils/errorHandler");
const { respondSuccess, respondError } = require("../utils/resHandler");
const categoriaService = require("../services/categorias.service");

async function getCategorias(req, res) {
    try {
        const [categorias, errorCategorias] = await categoriaService.getCategorias();
        if (errorCategorias) return respondError(req, res, 404, errorCategorias);

        categorias.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, categorias);
    } catch (error) {
        handleError(error, "categorias.controller -> getCategorias");
        respondError(req, res, 400, error.message);
    }
}

async function getCategoriasById(req, res) {
    try {
        const { params } = req;
        const [categoria, errorCategoria] = await categoriaService.getCategoriasById(params.id);
        if (errorCategoria) return respondError(req, res, 404, errorCategoria);

        respondSuccess(req, res, 200, categoria);
    } catch (error) {
        handleError(error, "categorias.controller -> getCategoriasById");
        respondError(req, res, 400, error.message);
    }
}

module.exports = {
    getCategorias,
    getCategoriasById
};