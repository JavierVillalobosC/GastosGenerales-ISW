"use strict"

const Debt = require("../models/deuda.model.js");
const User = require("../models/user.model.js");
const { handleError } = require("../utils/errorHandler");
const debtStates = require("../models/debtstate.model.js");
const Categoria = require("../models/categorias.model.js");
const schedule = require('node-schedule');
const DEBTSTATES = require('../constants/debtstates.constants.js');
const State = require('../models/state.model.js');

/**
 * 
 * @returns {Promise} Promesa con el objeto de las deudas
 */

async function getDeudas() {
    try {
        const deudas = await Debt.find()
        .populate("user")
        .exec();

        if (!deudas) return [null, "No hay deudas"];

        return [deudas, null];
    } catch (error) {
        handleError(error, "deudas.service -> getDeudas");
    }
}

/**
 * 
 * @param {Object} deuda Objeto de deuda
 * @returns {Promise} Promesa con el objeto de deuda creado
 */

async function createDeuda(deuda) {
    try{

    const { id, user, idService, initialdate, finaldate, amount, numerocuotas, estado } = deuda;
    
    const deudaFound = await Debt.findOne({ id: deuda.id });
    if (deudaFound) return [null, "La deuda ya existe"];

    const userFound = await User.findById(user);
    if (!userFound) return [null, "El usuario no existe"];

    const debtStatesFound = await debtStates.find({ name: { $in: estado } });
    if (debtStatesFound.length === 0) return [null, "El estado no existe"];
    const mydebtStates = debtStatesFound.map((estado) => estado._id);

    const idServiceFound = await Categoria.find({ name: { $in: idService } });
    if (idServiceFound.length === 0) return [null, "El servicio especificado no existe"];
    const myidService = idServiceFound.map((idService) => idService._id);
    
    // Actualizar la deuda del usuario
    userFound.debt += amount;
    userFound.estado = mydebtStates;
    await userFound.save();

    let valorcuota = userFound.debt / numerocuotas;

    const newDebt = new Debt({
        id,
        user,
        idService: myidService,
        initialdate,
        finaldate,
        amount,
        actualamount: userFound.debt,
        valorcuota,
        numerocuotas,
        estado: mydebtStates
    });

    await newDebt.save();

    // Guarda el usuario actualizado
    const updatedUser = await User.findById(newDebt.user);
    await updatedUser.save();

    const blacklistDate = new Date(newDebt.finaldate);
    blacklistDate.setDate(blacklistDate.getDate() + 5);

    // Verifica si la fecha de vencimiento ya ha pasado
    if (blacklistDate < new Date()) {
    // Si la fecha de vencimiento ya ha pasado, agrega al usuario a la lista negra inmediatamente
    addToBlacklist();
    } else {
    // Si la fecha de vencimiento aún no ha pasado, programa un trabajo para agregar al usuario a la lista negra
    schedule.scheduleJob(blacklistDate, addToBlacklist);
    }

    return [newDebt, null, valorcuota];
    } catch (error) {
        handleError(error, "deudas.service -> createDeuda");
    }
}

/**
 *
 * @param {string} Id de la deuda
 * @returns {Promise} Promesa con el objeto de deuda
 */

async function getDeudaById(id) {
    try {
        const deuda = await Debt.findById({ _id: id })
        .populate("user")
        .exec();
        if (!deuda) return [null, "La deuda no existe"];

        return [deuda, null];
    } catch (error) {
        handleError(error, "deudas.service -> getDeudaById");
    }
}

/**
 * 
 * @param {string} Id de la deuda
 * @returns {Promise} Promesa con el objeto de deuda actualizado
 */

async function updateDeuda(id, deuda) {
    try {

        const { user, idService, initialdate, finaldate, amount, numerocuotas, estado  } = deuda;

        const deudaFound = await Debt.findById(id);
        if (!deudaFound) return [null, "La deuda no existe"];

        const userFound = await User.findById(user);
         if (!userFound) return [null, "El usuario no existe"];

        const debtStatesFound = await debtStates.find({ name: { $in: estado } });
        if (debtStatesFound.length === 0) return [null, "El estado no existe"];
        const mydebtStates = debtStatesFound.map((estado) => estado._id);

        const idServiceFound = await Categoria.find({ name: { $in: idService } });
        if (idServiceFound.length === 0) return [null, "El servicio especificado no existe"];
        const myidService = idServiceFound.map((idService) => idService._id);
    
         // Actualizar la deuda del usuario
        userFound.debt += amount;
        userFound.estado = mydebtStates;

        // Si la deuda es cero, quita al usuario de la lista negra
        /* if (userFound.debt === 0 && userFound.blacklisted) {
            userFound.blacklisted = false;
        } */
        await userFound.save();

        let valorcuota = userFound.debt / numerocuotas;

        const newDeuda = new Debt({
            id,
            user,
            idService: myidService,
            initialdate,
            finaldate,
            amount,
            actualamount: userFound.debt,
            valorcuota,
            numerocuotas,
            estado: mydebtStates
        });
        await newDeuda.save();

        return [newDeuda, null];
    } catch (error) {
        handleError(error, "deudas.service -> updateDeuda");
    }
}

/**
 * 
 * @param {string} Id de la deuda
 * @returns {Promise} Promesa con el objeto de deuda eliminada
 */

async function deleteDeuda(id) {
    try {
        const deudaFound = await Debt.findById(id);
        if (!deudaFound) return [null, "La deuda no existe"];

        await Debt.findByIdAndDelete(id);

        return [deudaFound, null];
    } catch (error) {
        handleError(error, "deudas.service -> deleteDeuda");
    }
}

async function removeFromBlacklist() {
    try {
        console.log('Obteniendo usuarios en la lista negra...');
        const blacklistedUsers = await User.find({ blacklisted: true });
        console.log(`Usuarios en la lista negra: ${blacklistedUsers.length}`);

        for (let user of blacklistedUsers) {
            console.log(`Obteniendo deudas para el usuario ${user._id}...`);
            const userDebts = await Debt.find({ user: user._id });
            console.log(`Deudas obtenidas: ${userDebts.length}`);

            const allDebtsPaid = userDebts.every(debt => debt.amount === 0);
            console.log(`Todas las deudas pagadas: ${allDebtsPaid}`);

            if (allDebtsPaid) {
                console.log(`Quitando al usuario ${user._id} de la lista negra...`);
                user.blacklisted = false;
                await user.save();
                console.log(`Usuario ${user._id} quitado de la lista negra.`);
            }
        }
    } catch (error) {
        handleError(error, "deudas.service -> deleteDeuda");
    }
}

// Función para verificar las deudas vencidas
const checkOverdueDebts = async function() {
    try {
        // Obtén todas las deudas
        const debts = await Debt.find().exec();

        // Itera sobre cada deuda
        for (let debt of debts) {
            // Si la fecha de vencimiento ha pasado y el usuario no está en la lista negra
            if (new Date(debt.finaldate) < new Date() && !debt.user.blacklisted) {
                // Busca al usuario asociado con la deuda
                const user = await User.findById(debt.user).exec();

                // Verifica que el usuario exista
                if (!user) {
                    console.log(`Usuario no encontrado para la deuda con id ${debt._id}`);
                    continue; // Salta al siguiente ciclo del bucle
                }

                // Agrega al usuario a la lista negra
                addToBlacklist(user);
            }
        }
    } catch (error) {
        console.error('Error en deudas.service -> checkOverdueDebts:', error);
    }
};

// Función para actualizar el estado del usuario
async function updateUserState(userId) {
    // Busca al usuario por su ID
    const user = await User.findById(userId);
  
    // Busca los estados "deudor" y "al día"
    const debtorState = await State.findOne({ name: 'deudor' });
    const upToDateState = await State.findOne({ name: 'al dia' });

    // Variable para rastrear si el estado del usuario ha cambiado
    let stateChanged = false;
  
    // Si el usuario no tiene deuda o si el plazo de pago del usuario no ha vencido, cambia su estado a "al día"
if (user.debt === 0 || user.paymentDueDate >= new Date()) {
    //let justification = '';
    if (user.debt === 0) {
        //justification = 'El usuario no tiene deuda.';
    } else if (user.paymentDueDate >= new Date()) {
        //justification = 'El plazo de pago del usuario aún no ha vencido.';
    }
    if (user.state !== upToDateState._id) {
        //console.log(`[!] El estado del usuario ${userId} ha sido actualizado a 'al día'. ${justification}`);
    }
    user.state = upToDateState._id;
    stateChanged = true;
}
    // Si el plazo de pago del usuario ha vencido y su deuda es mayor a 0, cambia su estado a "deudor"
if (user.paymentDueDate < new Date() && user.debt > 0) {
    if (user.state !== debtorState._id) {
        //console.log(`El estado del usuario ${userId} ha sido actualizado a 'deudor'. Deuda: ${user.debt}`);
        user.state = debtorState._id;
        stateChanged = true;
    }
}

    // Si el estado del usuario no ha cambiado, imprime un mensaje
/* if (!stateChanged) {
    let justification = '';
    if (user.debt === 0) {
        justification = '[v] El usuario no tiene deudas.\n';
    } else if (user.paymentDueDate >= new Date()) {
        justification = '[v] La deuda del usuario aún no ha vencido.\n';
    } else {
        justification = `> El plazo de pago de la deuda ha vencido.\n> El usuario tiene deudas por pagar.\n> Deuda: ${user.debt}`;
    }

    // Si el plazo de pago del usuario ha vencido y tiene deudas por pagar, imprime un mensaje
    if (user.paymentDueDate < new Date() && user.debt > 0) {
        console.log(`[!] El plazo de pago del usuario ${userId} ha vencido y tiene deudas por pagar. Deuda: ${user.debt}`);
    }

    console.log(`[!] Se revisó el usuario ${userId}, pero su estado no necesitó ser modificado.\n${justification}`);
}

// Imprime el estado del usuario
const userState = await State.findById(user.state);
console.log(`> El estado del usuario ${userId} es: ${userState.name}`); */

    // Guarda el usuario actualizado
    await user.save();
}

// Función para actualizar el estado de todos los usuarios
async function updateAllUserStates() {
    // Obtiene todos los usuarios
    const users = await User.find();

    // Actualiza el estado de cada usuario
    for (let user of users) {
        await updateUserState(user._id);
    }
}

async function addToBlacklist(user) {
    // Verifica si el usuario ya está en la lista negra
    if (user.blacklisted) {
        // Si el usuario ya está en la lista negra, retorna sin hacer nada
        return;
    }

    // Marca al usuario como en lista negra
    user.blacklisted = true;
    await user.save();

    // Imprime un mensaje en la consola
    console.log(`El usuario ${user._id} ha sido agregado a la lista negra.`);
}

async function añadirListaNegra() {
    // Obtiene todos los usuarios
    const users = await User.find();

    // Itera sobre todos los usuarios
    for (const user of users) {
        // Obtiene todas las deudas del usuario
        const debts = await Debt.find({ user: user._id });

        // Itera sobre todas las deudas del usuario
        for (const debt of debts) {
            // Calcula la fecha de la lista negra como 5 días después de la fecha de vencimiento de la deuda
            const blacklistDate = new Date(debt.finaldate);
            blacklistDate.setDate(blacklistDate.getDate() + 5);

            // Verifica si la fecha de la lista negra ya ha pasado
            if (blacklistDate < new Date()) {
                // Si la fecha de la lista negra ya ha pasado, agrega al usuario a la lista negra inmediatamente
                addToBlacklist(user);
            }
        }
    }
}

const cron = require('node-cron');

// Programa una tarea para ejecutarse todos los días a las 00:00
cron.schedule('00 00 * * *', () => {
    añadirListaNegra().catch(console.error);
});

updateAllUserStates();
// Ejecuta la función updateAllUserStates cada 10 minutos
setInterval(updateAllUserStates, 600000);


// Programa la función para que se ejecute cada 10 minutos
setInterval(checkOverdueDebts, 600 * 1000);

module.exports = {
    getDeudas,
    createDeuda,
    getDeudaById,
    updateDeuda,
    deleteDeuda,
    removeFromBlacklist,

};



