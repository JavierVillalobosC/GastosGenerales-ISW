"use strict"

const Pay = require("../models/pago.model.js");
const User = require("../models/user.model.js");
const Deuda = require("../models/deuda.model.js");
const debtStates = require("../models/debtstate.model.js");
const paytypes = require("../models/paytypes.model.js");
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

    const { id, id_deuda,user, idService, date, amount, type, estado,extend } = pago;
    
    const pagoFound = await Pay.findOne({ id: pago.id });
    if (pagoFound) return [null, "El pago ya existe"];

    const userFound = await User.findById(user);
    if (!userFound) return [null, "El usuario no existe"];
    
    const deudaFound = await Deuda.findById(id_deuda);
    if (!deudaFound) return [null, "La deuda no existe"];

    const userdeudaFound = await Deuda.findOne({ user: userFound._id });
    if (!userdeudaFound) return [null, "El usuario no tiene deudas"];

    const debtStatesFound = await debtStates.find({ name: { $in: estado } });
    if (debtStatesFound.length === 0) return [null, "El estado no existe"];
    const mydebtStates = debtStatesFound.map((estado) => estado._id);

    const paytypesFound = await paytypes.find({ name: { $in: type } });
    if (paytypesFound.length === 0) return [null, "El tipo de pago no existe"];
    const mypaytypes = paytypesFound.map((type) => type._id);

    const extendWeeksFound = await paytypes.find({ extend: { $in: extend } });
    if (extendWeeksFound.length === 0) return [null, "La extension no existe"];
    const myextend = extendWeeksFound.map((extendWeek) => extendWeek._id);

    const paydate = userdeudaFound.finaldate;
    // Actualizar la deuda del usuario
    
    if (!deudaFound || deudaFound.amount === undefined) {
        return [null, "No se encontró la deuda o la cantidad de la deuda es indefinida"];
    };

    
    // Convertir el objeto Date de nuevo a una cadena en el formato "dd-mm-yyyy"
    

    const newPay = new Pay({
        id,
        id_deuda,
        user,
        idService,
        date ,
        total_amount: deudaFound.amount,
        valorcuota: deudaFound.valorcuota,
        amount,
        status: mydebtStates,
        type: mypaytypes,
        paydate,
        extend: myextend
    });
    if (type === 'parcial') {
        // Si el tipo de pago es 'parcial', extender paydate en la cantidad de semanas especificada
        newPay.paydate = new Date(newPay.paydate.getTime() + extend * 7 * 24 * 60 * 60 * 1000);
    }
    await newPay.save();

    userFound.debt = Math.max(0, userFound.debt - amount);
    userFound.state = mydebtStates;
    await userFound.save();
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

async function getPagosByUser(userId) {
    try {
        const userFound = await User.findById(userId);
        if (!userFound) return [null, "El usuario no existe"];

        const pagos = await Pay.find({ user: userId });
        return [pagos, null];
    } catch (error) {
        // Manejar el error
        handleError(error, "pagos.service -> getPagosByUser");
    }
}

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

        const userFound = await User.findById(user);
        if (!userFound) return [null, "El usuario no existe"];
    
        const deudaFound = await Deuda.find({ idService: pago.idService });
        if (!deudaFound) return [null, "La deuda no existe"];

        const debtStatesFound = await debtStates.find({ name: { $in: estado } });
        if (debtStatesFound.length === 0) return [null, "El estado no existe"];
        const mydebtStates = debtStatesFound.map((estado) => estado._id);

        const paytypesFound = await paytypes.find({ name: { $in: type } });
        if (paytypesFound.length === 0) return [null, "El tipo de pago no existe"];
        const mypaytypes = paytypesFound.map((type) => type._id);

        const extendWeeksFound = await paytypes.find({ extend: { $in: extend } });
        if (extendWeeksFound.length === 0) return [null, "La extension no existe"];
        const myextend = extendWeeksFound.map((extendWeek) => extendWeek._id);

        const { idService, date, amount, type, paydate } = pago;
        const newPay = new Pay({
            id,
            user,
            idService,
            date,
            total_amount: deudaFound.amount,
            valorcuota: deudaFound.valorcuota,
            amount,
            status: mydebtStates,
            type: mypaytypes,
            paydate,
            extend: myextend
        });
        if (type === 'parcial') {
            // Si el tipo de pago es 'parcial', extender paydate en la cantidad de semanas especificada
            newPay.paydate = new Date(newPay.paydate.getTime() + extend * 7 * 24 * 60 * 60 * 1000);
        }
        await newPay.save();

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
    getPagosByUser,
    updatePago,
    deletePago
};



