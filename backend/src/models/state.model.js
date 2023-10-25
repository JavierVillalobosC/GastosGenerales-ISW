"use strict"

const mongoose = require("mongoose")
const STATES = require("../constants/states.constants")

const stateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: STATES,
            required: true,
        },
    },
    {
        versionKey: false,
    },
);

const State = mongoose.model("State", stateSchema);

module.exports = State;