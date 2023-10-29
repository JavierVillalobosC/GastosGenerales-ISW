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
        required: true,
        match: /^\d{2}-\d{2}-\d{4}$/
    },
    total_amount: {
        type: Number,
        required: true,
        min: 0
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    paydate: {
        type: Date,
        required: true,
        match: /^\d{2}-\d{2}-\d{4}$/
    }
}, {
    versionKey: false,
});

const Pay = mongoose.model("Pay", paySchema);

module.exports = Pay;

