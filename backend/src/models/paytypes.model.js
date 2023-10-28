"use strict"

const mongoose = require("mongoose");
const PAYTYPES = require("../constants/paytypes.constants");

const paytypeSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        enum: PAYTYPES,
        required: true,
    },
},
{
    versionKey: false,
},
);

const Paytype = mongoose.model("Paytype", paytypeSchema);

module.exports = Paytype;