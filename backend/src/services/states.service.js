"use strict"

const State = require("../models/state.model.js");
const { handleError } = require("../utils/errorHandler");

async function getStates() {
    try {
        const states = await State.find().exec();

        if (!states) return [null, "No hay estados"];

        return [states, null];
    } catch (error) {
        handleError(error, "states.service -> getStates");
    }
}

async function getStatesById(id) {
    try {
        const state = await State.findById(id).exec();

        if (!state) return [null, "No hay estados"];

        return [state, null];
    } catch (error) {
        handleError(error, "states.service -> getStatesById");
    }
}

module.exports = {
    getStates,
    getStatesById
};