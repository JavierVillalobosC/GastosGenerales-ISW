"use strict"

const mongoose = require("mongoose")

const paySchema = new mongoose.Schema(
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
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
})

const Pay = mongoose.model("Pay", paySchema);

module.exports = Pay;

