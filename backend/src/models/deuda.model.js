"use strict";

const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        idService: {
            type: String,
            required: true
        },
        initialdate: {
            type: Date,
            required: true
        },
        finaldate: {
            type: Date,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        valorcuota: {
            type: Number,
            required: false,
            min: 0
        },
        numerocuotas: {
            type: Number,
            required: true,
            min: 0
        },
    }, {
        versionKey: false,
    });

    const Debt = mongoose.model("Debt", debtSchema);

    module.exports = Debt;