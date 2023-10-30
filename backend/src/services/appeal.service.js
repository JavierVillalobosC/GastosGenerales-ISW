"use strict"

const Appeal = require("../models/appeal.model.js");
const User = require("../models/user.model.js");
const { handleError } = require("../utils/errorHandler");

/**
 * 
 * @returns {Promise} Promesa con el objeto de las apelaciones
 */

async function getAppeal() {
    try {
        const appeals = await Appeal.find()
        .populate("user")
        .exec();

        if (!appeals) return [null, "No hay apelaciones"];

        return [appeals, null];
    } catch (error) {
        handleError(error, "appeals.service -> getAppeals");
    }
}

/**
 * 
 * @param {Object} appeal Objeto de appeal
 * @returns {Promise} Promesa con el objeto de appeal creado
 */

async function createAppeal(appeal) {
    try{

    const { id, user, description, status } = appeal;
    
    const appealFound = await Appeal.findOne({ id: appeal.id });
    if (appealFound) return [null, "La apelación ya existe"];

    const userFound = await User.findById(user);
    if (!userFound) return [null, "El usuario no existe"];
    
    

    const newAppeal = new Appeal({
        id,
        user,
        description,
        status
    });
    
    await newAppeal.save();
    return [newAppeal, null];
    } catch (error) {
        handleError(error, "appeals.service -> createAppeal");
    }
}

/**
 *
 * @param {string} Id del appeal
 * @returns {Promise} Promesa con el objeto de appeal
 */

async function getAppealById(id) {
    try {
        const appeal = await Appeal.findById({ _id: id })
        .populate("user")
        .exec();
        if (!appeal) return [null, "La apelación no existe"];

        return [appeal, null];
    } catch (error) {
        handleError(error, "appeals.service -> getAppealById");
    }
}

/**
 * 
 * @param {string} Id del appeal
 * @returns {Promise} Promesa con el objeto de appeal eliminado
 */

async function deleteAppeal(id) {
    try {
        const appealFound = await Appeal.findById(id);
        if (!appealFound) return [null, "La apelación no existe"];

        await Appeal.findByIdAndDelete(id);

        return [appealFound, null];
    } catch (error) {
        handleError(error, "appeals.service -> deleteAppeal");
    }
}

module.exports = {
    getAppeal,
    createAppeal,
    getAppealById,
    deleteAppeal
};


