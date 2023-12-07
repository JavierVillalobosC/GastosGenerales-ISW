"use strict";
// Importa el modelo de datos 'Role'
const Role = require("../models/role.model.js");
const User = require("../models/user.model.js");
const State = require("../models/state.model.js");
const Categoria = require("../models/categorias.model.js");
/**
 * Crea los roles por defecto en la base de datos.
 * @async
 * @function createRoles
 * @returns {Promise<void>}
 */
async function createRoles() {
  try {
    // Busca todos los roles en la base de datos
    const count = await Role.estimatedDocumentCount();
    // Si no hay roles en la base de datos los crea
    if (count > 0) return;

    await Promise.all([
      new Role({ name: "user" }).save(),
      new Role({ name: "admin" }).save(),
    ]);
    console.log("* => Roles creados exitosamente");
  } catch (error) {
    console.error(error);
  }
}

async function createCategorias() {
  try {
    const count = await Categoria.estimatedDocumentCount();
    if (count > 0) return;

    await Promise.all([
      new Categoria({ name: "Retiro de basura" }).save(),
      new Categoria({ name: "Retiro de escombros" }).save(),
      new Categoria({ name: "Pago de patente municipal" }).save(),
      new Categoria({ name: "Pago de permisos de transito" }).save(),
      new Categoria({ name: "Pago de multas" }).save(),
      new Categoria({ name: "Permiso de circulación" }).save(),
      new Categoria({ name: "Multas" }).save(),
      new Categoria({ name: "Otros" }).save(),
    ]);
    console.log("* => Categorias creadas exitosamente");
  } catch (error) {
    console.error(error);
  }
};
async function createStates() {
  try {
    // Busca todos los roles en la base de datos
    console.log("* => Estados revisando");
    const count = await State.estimatedDocumentCount();
    // Si no hay roles en la base de datos los crea
    if (count > 0) return;

    await Promise.all([
      new State({ name: "al dia" }).save(),
      new State({ name: "deudor" }).save(),
    ]);
    console.log("* => Estados creados exitosamente");
  } catch (error) {
    console.error(error);
  }
}
/**
 * Crea los usuarios por defecto en la base de datos.
 * @async
 * @function createUsers
 * @returns {Promise<void>}
 */
async function createUsers() {
  try {
    const count = await User.estimatedDocumentCount();
    if (count > 0) return;

    const admin = await Role.findOne({ name: "admin" });
    const user = await Role.findOne({ name: "user" });

    await Promise.all([
      new User({
        username: "user",
        rut: "1.111.111-1",
        email: "user@email.com",
        password: await User.encryptPassword("user123"),
        roles: user._id,
        debt: 0,

      }).save(),
      new User({
        username: "admin",
        email: "admin@email.com",
        rut: "2.222.222-2",
        password: await User.encryptPassword("admin123"),
        roles: admin._id,
      }).save(),
    ]);
    console.log("* => Users creados exitosamente");
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  createRoles,
  createUsers,
  createStates,
  createCategorias
};
