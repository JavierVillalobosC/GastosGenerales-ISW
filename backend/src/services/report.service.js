"use strict"

const Debt = require("../models/deuda.model.js");
const Pay = require("../models/pago.model.js");
const User = require("../models/user.model.js");

/**
 * 
 * @returns {Promise} Promesa con el objeto de los datos del informe de deudas
 */
async function getDeudasReportForUser(userId) {
    try {
        const deudas = await Debt.find({ user: userId })
        .populate("user")
        .exec();

        if (!deudas || deudas.length === 0) return [null, "No hay deudas para este usuario"];

        // Calcular totales, promedios, etc.
        let totalAmount = 0;
        let averageAmount = 0;
        let totalNumberOfPayments = 0;
        let averageNumberOfPayments = 0;

        deudas.forEach(deuda => {
            totalAmount += deuda.amount;
            totalNumberOfPayments += deuda.numerocuotas;
        });

        averageAmount = totalAmount / deudas.length;
        averageNumberOfPayments = totalNumberOfPayments / deudas.length;

        
        const report = deudas.map(deuda => {
            return {
                id: deuda.id,
                user: deuda.user.username, 
                serviceId: deuda.idService,
                initialDate: deuda.initialdate,
                finalDate: deuda.finaldate,
                actualamount: deuda.amount,
                numberOfPayments: deuda.numerocuotas,
                state: deuda.estado
            };
        });

        // Agregar totales y promedios al informe
        report.push({
            totalAmount,
            averageAmount,
            totalNumberOfPayments,
            averageNumberOfPayments
        });

        return [report, null];
    } catch (error) {
        console.error("report.service -> getDeudasReport", error);
    }
}
/**
 * 
 * @returns {Promise} Promesa con el objeto de los datos del informe de usuarios
 */
async function getUsersReport() {
    try {
        const users = await User.find().exec();

        if (!users) return [null, "No hay usuarios"];

        

        return [users, null];
    } catch (error) {
        console.error("report.service -> getUsersReport", error);
    }
}

/**
 * 
 * @returns {Promise} Promesa con el objeto de los datos del informe de pagos
 */
async function getPagosReport() {
    try {
        const pagos = await Pay.find()
        .populate("user")
        .exec();

        if (!pagos || pagos.length === 0) return [null, "No hay pagos"];

        // Calcular totales, promedios, etc.
        let totalAmount = 0;
        let averageAmount = 0;

        pagos.forEach(pago => {
            totalAmount += pago.amount;
        });

        averageAmount = totalAmount / pagos.length;

        
        const report = pagos.map(pago => {
            return {
                id: pago.id,
                user: pago.user.username, 
                serviceId: pago.idService,
                date: pago.date,
                amount: pago.amount,
                type: pago.type,
                status: pago.status
            };
        });

        // Agregar totales y promedios al informe
        report.push({
            totalAmount,
            averageAmount
        });

        return [report, null];
    } catch (error) {
        console.error("report.service -> getPagosReport", error);
    }
}

async function getPagosReportForUser(userId) {
    try {
        const pagos = await Pay.find({ user: userId })
        .populate("user")
        .exec();

        if (!pagos || pagos.length === 0) return [null, "No hay pagos para este usuario"];

        // Calcular totales, promedios, etc.
        let totalAmount = 0;
        let averageAmount = 0;

        pagos.forEach(pago => {
            totalAmount += pago.amount;
        });

        averageAmount = totalAmount / pagos.length;

        
        const report = pagos.map(pago => {
            return {
                id: pago.id,
                user: pago.user.username, 
                serviceId: pago.idService,
                date: pago.date,
                amount: pago.amount,
                type: pago.type,
                status: pago.status
            };
        });

        // Agregar totales y promedios al informe
        report.push({
            totalAmount,
            averageAmount
        });

        return [report, null];
    } catch (error) {
        console.error("report.service -> getPagosReportForUser", error);
    }
}

module.exports = {
    getDeudasReportForUser,
    getUsersReport,
    getPagosReport,
    getPagosReportForUser
};

