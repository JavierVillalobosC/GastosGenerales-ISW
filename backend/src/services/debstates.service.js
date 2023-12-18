"use strict"

const DebtStates = require("../models/debtstate.model.js");
const { handleError } = require("../utils/errorHandler");

async function getDebtStates() {
    try {
        const debtstates = await DebtStates.find().exec();

        if (!debtstates) return [null, "No hay estados"];

        return [debtstates, null];
    } catch (error) {
        handleError(error, "debtstates.service -> getDebtStates");
    }
}

async function getDebtStatesById(id) {
    try {
        const debtstate = await DebtStates.findById(id).exec();

        if (!debtstate) return [null, "No hay estados"];

        return [debtstate, null];
    } catch (error) {
        handleError(error, "debtstates.service -> getDebtStatesById");
    }
}

module.exports = {
    getDebtStates,
    getDebtStatesById
};
