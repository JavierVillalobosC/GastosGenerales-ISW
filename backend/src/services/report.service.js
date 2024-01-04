"use strict"

const Categoria = require("../models/categorias.model.js");
const Debt = require("../models/deuda.model.js");
const Pay = require("../models/pago.model.js");
const User = require("../models/user.model.js");
const DebtStates = require("../models/debtstate.model.js");
const paytype = require("../models/paytypes.model.js");

/**
 * 
 * @returns {Promise} Promesa con el objeto de los datos del informe de deudas
 */
async function getDeudasReportForUser(userId) {
    try {
        const deudasQuery = Debt.find({ user: userId });

        if (!deudasQuery) {
            throw new Error('La consulta a la base de datos falló');
        }

        const deudas = await deudasQuery.populate("user").exec();

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

        // Adaptar el reporte para incluir el nombre del servicio y el estado en texto
        const report = await Promise.all(deudas.map(async (deuda) => {
            // Si la deuda es null o undefined, o no tiene las propiedades esperadas, devolver un objeto vacío
            if (!deuda || !deuda.user || !deuda.idService || !deuda.initialdate || !deuda.finaldate || !deuda.amount || !deuda.numerocuotas || !deuda.estado) {
                return {};
            }

            // Buscar el nombre del servicio y estado por su ID
            const servicio = await Categoria.findById(deuda.idService);
            const estado = await DebtStates.findById(deuda.estado);
            console.log(servicio)
            console.log(estado)

            // Devolver la deuda adaptada
            return {
                id: deuda.id,
                user: deuda.user.username, 
                serviceId: servicio ? servicio.name : 'No encontrado',
                initialDate: deuda.initialdate,
                finalDate: deuda.finaldate,
                actualamount: deuda.amount,
                numberOfPayments: deuda.numerocuotas,
                state: estado ? estado.name : 'No encontrado'
            };
        }));

        // Crear objeto de resumen
        const resumen = {
            totalAmount,
            averageAmount,
            totalNumberOfPayments,
            averageNumberOfPayments
        };

        // Devolver objeto con deudas y resumen
        return [{ deudas: report, resumen }, null];
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
            if (pago.amount) {
                totalAmount += pago.amount;
            }
        });

        averageAmount = totalAmount / pagos.length;

        const ObjectId = require('mongoose').Types.ObjectId;
        const report = await Promise.all(pagos.map(async pago => {
            let servicio;
            if (ObjectId.isValid(pago.idService)) {
                // Si idService es un ObjectId válido, buscar el servicio en la base de datos
                servicio = await Categoria.findById(pago.idService);
            } else {
                // Si idService no es un ObjectId válido, asumir que es el nombre del servicio
                servicio = { name: pago.idService };
            }
        
            const tipo = await paytype.findById(pago.type);
            const estado = await DebtStates.findById(pago.status);
        
            return {
                id: pago.id,
                user: pago.user.username, 
                serviceId: servicio ? servicio.name : 'No encontrado',
                date: pago.date,
                amount: pago.amount,
                type: tipo ? tipo.name : 'No encontrado',
                status: estado ? estado.name : 'No encontrado'
            };
        }));
        
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

