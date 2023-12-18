"use strict"

const { handleError } = require("../utils/errorHandler");
const Categoria = require("../models/categorias.model");

async function getCategorias() {
    try {
        const categorias = await Categoria.find().exec();

        if (!categorias) return [null, "No hay categorias"];

        return [categorias, null];
    } catch (error) {
        handleError(error, "categorias.service -> getCategorias");
    }
}

async function getCategoriasById(id) {
    try {
        const categoria = await Categoria.findById(id).exec();

        if (!categoria) return [null, "No hay categorias"];

        return [categoria, null];
    } catch (error) {
        handleError(error, "categorias.service -> getCategoriasById");
    }
}

module.exports = {
    getCategorias,
    getCategoriasById
};