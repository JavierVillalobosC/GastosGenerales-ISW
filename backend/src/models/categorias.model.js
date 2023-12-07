"use strict"

const mongoose = require("mongoose")
const CATEGORIAS = require("../constants/categoria.constants.js")

const categoriaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: CATEGORIAS,
            required: true,
        },
    },
    {
        versionKey: false,
    },
);

const Categoria = mongoose.model("Categoria", categoriaSchema);

module.exports = Categoria;