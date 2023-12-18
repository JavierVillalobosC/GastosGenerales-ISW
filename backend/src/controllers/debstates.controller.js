"use strict"

const { respondSuccess, respondError } = require("../utils/resHandler");
const DebtStatesService = require("../services/debstates.service");
const { handleError } = require("../utils/errorHandler");

async function getDebtStates(req, res) {
    try {
        const [debtstates, errorDebtStates] = await DebtStatesService.getDebtStates();
        if (errorDebtStates) return respondError(req, res, 404, errorDebtStates);

        debtstates.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, debtstates);
    } catch (error) {
        handleError(error, "debtstates.controller -> getDebtStates");
        respondError(req, res, 400, error.message);
    }
}

async function getDebtStatesById(req, res) {
    try {
        const { params } = req;
        const [debtstate, errorDebtState] = await DebtStatesService.getDebtStatesById(params.id);
        if (errorDebtState) return respondError(req, res, 404, errorDebtState);

        respondSuccess(req, res, 200, debtstate);
    } catch (error) {
        handleError(error, "debtstates.controller -> getDebtStatesById");
        respondError(req, res, 400, error.message);
    }
}

module.exports = {
    getDebtStates,
    getDebtStatesById
};