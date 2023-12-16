"use strict";

const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
    {
        interesID: {
            type: String,
            required: true,
            unique: true
        },
        debt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Debt',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
    }, {
        versionKey: false,
    });

const Interest = mongoose.model("Interest", interestSchema);

module.exports = Interest;