"use strict";

const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
    {
        interesID: {
            type: String,
            required: true,
            unique: true
        },
    }, {
        versionKey: false,
    });

    const Interest = mongoose.model("Interest", interestSchema);

    module.exports = Interest;