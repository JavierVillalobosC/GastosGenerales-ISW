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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Categoria",
            required: true
        },
        initialdate: {
            type: Date,
            default: Date.now,
            required: true,
            match: /^\d{2}-\d{2}-\d{4}$/
        },
        finaldate: {
            type: Date,
            required: true,
            match: /^\d{2}-\d{2}-\d{4}$/
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
        estado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DebtStates",
            required: true
        },
    }, {
        versionKey: false,
    });

    const Debt = mongoose.model("Debt", debtSchema);

    module.exports = Debt;