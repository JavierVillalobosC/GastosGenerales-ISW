"user strict"

const { respondSuccess, respondError } = require("../utils/resHandler")
const RoleService = require("../services/roles.service")
const { handleError } = require("../utils/errorHandler")


async function getRoles(req, res) {
    try {
        const [roles, errorRoles] = await RoleService.getRoles()
        if (errorRoles) return respondError(req, res, 404, errorRoles)

        roles.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, roles)
    } catch (error) {
        handleError(error, "roles.controller -> getRoles")
        respondError(req, res, 400, error.message)
    }
}

async function createRole(req, res) {
    try {
        const { body } = req
        const [role, errorRole] = await RoleService.createRole(body)
        if (errorRole) return respondError(req, res, 404, errorRole)

        respondSuccess(req, res, 201, role)
    } catch (error) {
        handleError(error, "roles.controller -> createRole")
        respondError(req, res, 400, error.message)
    }
}

async function getRoleByName(req, res) {
    try {
        const { params } = req
        const [role, errorRole] = await RoleService.getRoleByName(params.name)
        if (errorRole) return respondError(req, res, 404, errorRole)

        respondSuccess(req, res, 200, role)
    } catch (error) {
        handleError(error, "roles.controller -> getRoleByName")
        respondError(req, res, 400, error.message)
    }
}

async function updateRole(req, res) {
    try {
        const { params, body } = req
        const [role, errorRole] = await RoleService.updateRole(params.id, body)
        if (errorRole) return respondError(req, res, 404, errorRole)

        respondSuccess(req, res, 200, role)
    } catch (error) {
        handleError(error, "roles.controller -> updateRole")
        respondError(req, res, 400, error.message)
    }
}

async function deleteRole(req, res) {
    try {
        const { params } = req
        const [role, errorRole] = await RoleService.deleteRole(params.id)
        if (errorRole) return respondError(req, res, 404, errorRole)

        respondSuccess(req, res, 200, role)
    } catch (error) {
        handleError(error, "roles.controller -> deleteRole")
        respondError(req, res, 400, error.message)
    }
}

module.exports = {
    getRoles,
    createRole,
    getRoleByName,
    updateRole,
    deleteRole
}