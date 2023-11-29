"use strict"

const Interest = require("../models/interes.model.js");
const { handleError } = require("../utils/errorHandler");

/**
 * 
 * @returns {Promise} Promesa con el objeto de los intereses
 */

async function getIntereses() {
    try {
        const intereses = await Interest.find()
        .populate("user")
        .exec();

        if (!intereses) return [null, "No hay intereses aplicados."];

        return [intereses, null];
    } catch (error) {
        handleError(error, "intereses.service -> getIntereses");
    }
}

module.exports = {
    getIntereses
};