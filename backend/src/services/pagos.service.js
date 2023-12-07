"use strict"

const Pay = require("../models/pago.model.js");
const User = require("../models/user.model.js");
const { handleError } = require("../utils/errorHandler");

/**
 * 
 * @returns {Promise} Promesa con el objeto de los pagos
 */

async function getPagos() {
    try {
        const pagos = await Pay.find()
        .populate("user")
        .exec();

        if (!pagos) return [null, "No hay pagos"];

        return [pagos, null];
    } catch (error) {
        handleError(error, "pagos.service -> getPagos");
    }
}

/**
 * 
 * @param {Object} pago Objeto de pago
 * @returns {Promise} Promesa con el objeto de pago creado
 */

async function createPago(pago) {
    try{

    const { id, user, idService, date, total_amount,  amount, status, type, paydate } = pago;
    
    const pagoFound = await Pay.findOne({ id: pago.id });
    if (pagoFound) return [null, "El pago ya existe"];

    const userFound = await User.findById(user);
    if (!userFound) return [null, "El usuario no existe"];
    
    // Actualizar la deuda del usuario
    userFound.debt -= amount;
    await userFound.save();

    const newPay = new Pay({
        id,
        user,
        idService,
        date,
        total_amount,
        amount,
        status,
        type,
        paydate
    });
    
    await newPay.save();
    return [newPay, null];
    } catch (error) {
        handleError(error, "pagos.service -> createPago");
    }
}

/**
 *
 * @param {string} Id del pago
 * @returns {Promise} Promesa con el objeto de pago
 */

async function getPagoById(id) {
    try {
        const pago = await Pay.findById({ _id: id })
        .populate("user")
        .exec();
        if (!pago) return [null, "El pago no existe"];

        return [pago, null];
    } catch (error) {
        handleError(error, "pagos.service -> getPagoById");
    }
}

/**
 * 
 * @param {string} Id del pago
 * @returns {Promise} Promesa con el objeto de pago actualizado
 */

async function updatePago(id, pago) {
    try {
        const pagoFound = await Pay.findById(id);
        if (!pagoFound) return [null, "El pago no existe"];

        const { idService, date, total_amount, amount, status, type, paydate } = pago;
        const newPago = new Pay({
            id,
            idService,
            date,
            total_amount,
            amount,
            status,
            type,
            paydate
        });
        if (amount / total_amount >= 0.6) {
            newPay.paydate = new Date(newPay.paydate.getTime() + (14 * 24 * 60 * 60 * 1000));
        }

        await newPago.save();

        return [newPago, null];
    } catch (error) {
        handleError(error, "pagos.service -> updatePago");
    }
}

/**
 * 
 * @param {string} Id del pago
 * @returns {Promise} Promesa con el objeto de pago eliminado
 */

async function deletePago(id) {
    try {
        const pagoFound = await Pay.findById(id);
        if (!pagoFound) return [null, "El pago no existe"];

        await Pay.findByIdAndDelete(id);

        return [pagoFound, null];
    } catch (error) {
        handleError(error, "pagos.service -> deletePago");
    }
}

module.exports = {
    getPagos,
    createPago,
    getPagoById,
    updatePago,
    deletePago
};



