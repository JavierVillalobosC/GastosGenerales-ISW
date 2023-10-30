"use strict"

const mongoose = require("mongoose")

const appealSchema = new mongoose.Schema(
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
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
});

const Appeal = mongoose.model("Appeal", appealSchema);

module.exports = Appeal;
