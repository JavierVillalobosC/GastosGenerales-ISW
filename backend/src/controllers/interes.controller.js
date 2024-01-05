"use strict";

const { respondSuccess } = require("../utils/resHandler");
const Debt = require("../models/deuda.model.js");
const Rol = require("../models/role.model.js");
const { handleError } = require("../utils/errorHandler");
const User = require("../models/user.model.js");
const DEBTSTATES = require('../constants/debtstates.constants.js');
const { crearInteres } = require("../services/interes.service.js");
const { addInteresbyId } = require("../services/interes.service.js");

async function aplicarInteres(req, res) {
    try {
        await crearInteres();

        // Envía una respuesta al cliente
        res.json({ message: 'Intereses aplicados correctamente' });
    } catch (error) {
        console.error(`Error al aplicar intereses: ${error}`);
        res.status(500).json({ message: 'Hubo un error al aplicar los intereses' });
    }
}

    async function addInteresController(req, res) {
        try {
            const { id } = req.params;

            const result = await addInteresbyId(id);

        if (!result) {
            throw new Error('No se pudo agregar el interés');
        }
    
            // Envía una respuesta al cliente
            res.json({ message: 'Interés agregado correctamente',
            valorAnterior: result.valorAnterior,
            valorInteres: result.valorInteres,
            valorFinal: result.valorFinal });
        } catch (error) {
            console.error(`Error al agregar interés: ${error}`);
            res.status(500).json({ message: 'Hubo un error al agregar el interés' });
        }
    }


async function obtenerUsuariosEnListaNegra(req, res) {
    try {
        // Busca los usuarios que están en la lista negra
        const usuariosEnListaNegra = await User.find({ blacklisted: true });

        if (!usuariosEnListaNegra) {
            return res.status(404).json({ error: "No hay usuarios en la lista negra" });
        }

        // Devuelve la lista de usuarios en la lista negra
        return res.status(200).json({ usuariosEnListaNegra });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener la lista de usuarios en la lista negra" });
    }
}

async function actualizarUsuariosBlacklisted(req, res) {
    try {
        // Obtiene todas las deudas
        const deudas = await Debt.find();

        // Recorre todas las deudas
        for (let deuda of deudas) {
            // Verifica si el plazo de la deuda ya venció y la deuda está vencida
            const currentDate = new Date();
            if (currentDate > deuda.finaldate && deuda.state === DEBTSTATES[2]) {
                // Obtiene el usuario correspondiente a la deuda
                const user = await User.findById(deuda.userId);

                // Cambia blacklisted a true y guarda el usuario
                user.blacklisted = true;
                await user.save();

                console.log(`El usuario con ID ${user._id} ha sido agregado a la lista negra.`);
            }
        }

        // Envía una respuesta al cliente
        res.json({ message: 'Usuarios actualizados correctamente' });
    } catch (error) {
        console.error(`Error al actualizar usuarios blacklisted: ${error}`);
        res.status(500).json({ message: 'Hubo un error al actualizar los usuarios' });
    }
}

async function listarDeudasConIntereses(req, res) {
    const userId = req.params.userId;
    try {
        const deudasConIntereses = await Debt.find({ user: userId, interestApplied: true }).exec();
        if (deudasConIntereses.length === 0) {
            return res.status(404).json({ message: `El usuario con id ${userId} no tiene deudas con intereses aplicados.` });
        }
        return res.json(deudasConIntereses);
    } catch (error) {
        console.error('Error al listar las deudas con intereses:', error);
        return res.status(500).json({ message: 'Error al listar las deudas con intereses' });
    }
}

module.exports = {
    aplicarInteres,
    obtenerUsuariosEnListaNegra,
    actualizarUsuariosBlacklisted,
    listarDeudasConIntereses,
    addInteresController
};