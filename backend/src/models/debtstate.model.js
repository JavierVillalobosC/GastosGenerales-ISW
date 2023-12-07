"use strict"

const mongoose = require("mongoose")
const DEBTSTATES = require("../constants/debtstates.constants.js")

const debtstatesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: DEBTSTATES,
            required: true,
        },
    },
    {
        versionKey: false,
    },
);

const DebtStates = mongoose.model("Estado de la deuda", debtstatesSchema);

module.exports = DebtStates;