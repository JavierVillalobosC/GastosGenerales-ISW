"use strict"

const mongoose = require("mongoose")

const paySchema = new mongoose.Schema(
{
    id: {
        type: String,
        required: true,
        unique: true
    },
    id_deuda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Debt",
        required: true
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
    date: {
        type: Date,
        required: true,
        match: /^\d{2}-\d{2}-\d{4}$/
    },
    total_amount: {
        type: Number,
        required: true,
        min: 0
    },
    valorcuota: {
        type: Number,
        required: false,
        min: 0
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DebtStates",
        required: true
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Paytype",
        required: true
    },
    paydate: {
        type: Date,
        default: Date.now,
        required: true,
        match: /^\d{2}-\d{2}-\d{4}$/
    }
}, {
    versionKey: false,
});

const Pay = mongoose.model("Pay", paySchema);

module.exports = Pay;

