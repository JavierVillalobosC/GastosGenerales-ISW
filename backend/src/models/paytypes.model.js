"use strict"

const mongoose = require("mongoose");
const patytypes = require("../constants/paytypes.constants.js");
const extend = require("../constants/extenddate.constants.js")
const paytypeSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: patytypes,
        required: true
    },
    extend: {
        type: String,
        enum: extend,
        required: false
    }
}, {
    versionKey: false
});


const Paytype = mongoose.model("Paytype", paytypeSchema);

module.exports = Paytype;
