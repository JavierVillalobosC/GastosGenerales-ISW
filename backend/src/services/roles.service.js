"use strict"

const Role = require("../models/role.model.js")
const { handleError } = require("../utils/errorHandler")


async function getRoles() {
    try {
        const roles = await Role.find()
        if (!roles) return [null, "No hay roles"]

        return [roles, null]
    } catch (error) {
        handleError(error, "roles.service -> getRoles")
    }
}

async function createRole(role) {
    try {
        const { name } = role

        const roleFound = await Role.findOne({ name: name })
        if (roleFound) return [null, "El rol ya existe"]

        const newRole = new Role({
            name,
        })
        await newRole.save()

        return [newRole, null]
    } catch (error) {
        handleError(error, "roles.service -> createRole")
    }
}

async function getRoleByName(name) {
    try {
        const role = await Role.findOne({ name: name })
        if (!role) return [null, "El rol no existe"]

        return [role, null]
    } catch (error) {
        handleError(error, "roles.service -> getRoleByName")
    }
}

async function updateRole(id, role) {
    try {
        const { name } = role

        const roleFound = await Role.findById(id)
        if (!roleFound) return [null, "El rol no existe"]

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        )

        return [updatedRole, null]
    } catch (error) {
        handleError(error, "roles.service -> updateRole")
    }
}

async function deleteRole(id) {
    try {
        const roleFound = await Role.findById(id)
        if (!roleFound) return [null, "El rol no existe"]

        await Role.findByIdAndDelete(id)

        return ["Rol eliminado", null]
    }
    catch (error) {
        handleError(error, "roles.service -> deleteRole")
    }
}

module.exports = {
    getRoles,
    createRole,
    getRoleByName,
    updateRole,
    deleteRole,
};