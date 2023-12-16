"user strict"

const { respondSuccess, respondError } = require("../utils/resHandler");
const StateService = require("../services/states.service");
const { handleError } = require("../utils/errorHandler");


async function getStates(req, res) {
    try {
        const [states, errorStates] = await StateService.getStates();
        if (errorStates) return respondError(req, res, 404, errorStates);

        states.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, states);
    } catch (error) {
        handleError(error, "states.controller -> getStates");
        respondError(req, res, 400, error.message);
    }
}

async function getStatesById(req, res) {
    try {
        const { params } = req;
        const [state, errorState] = await StateService.getStatesById(params.id);
        if (errorState) return respondError(req, res, 404, errorState);

        respondSuccess(req, res, 200, state);
    } catch (error) {
        handleError(error, "states.controller -> getStatesById");
        respondError(req, res, 400, error.message);
    }
}

module.exports = {
    getStates,
    getStatesById
};