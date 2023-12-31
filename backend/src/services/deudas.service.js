"use strict";

const Debt = require("../models/deuda.model.js");
const User = require("../models/user.model.js");
const { handleError } = require("../utils/errorHandler");
const debtStates = require("../models/debtstate.model.js");
const Categoria = require("../models/categorias.model.js");
const schedule = require("node-schedule");
const DEBTSTATES = require("../constants/debtstates.constants.js");
const State = require("../models/state.model.js");

/**
 *
 * @returns {Promise} Promesa con el objeto de las deudas
 */

async function getDeudas() {
  try {
    const deudas = await Debt.find().populate("user").exec();

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
  try {
    const {
      username,
      service,
      initialdate,
      finaldate,
      amount,
      numerocuotas = 1,
      estado,
    } = deuda;

    const userFound = await User.findOne({ username: username });
    if (!userFound) return [null, "El usuario no existe"];

    const debtStatesFound = await debtStates.findOne({ name: estado });
    if (!debtStatesFound) return [null, "El estado no existe"];

    const idServiceFound = await Categoria.findOne({ name: service });
    if (!idServiceFound) return [null, "El servicio especificado no existe"];

    // Actualizar la deuda del usuario
    userFound.debt += amount;
    userFound.estado = debtStatesFound._id;
    await userFound.save();

    const valorcuota = userFound.debt / numerocuotas;

    const newDebt = new Debt({
      id: `${Date.now()}${Math.floor(
        Math.random() * (9999999 - 1000000 + 1000000) + 1000000,
      )}`,
      user: userFound._id,
      idService: idServiceFound._id,
      initialdate,
      finaldate,
      amount,
      actualamount: userFound.debt,
      valorcuota,
      numerocuotas,
      estado: debtStatesFound._id,
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
    const deuda = await Debt.findById({ _id: id }).populate("user").exec();
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
    const { username, service, initialdate, finaldate, amount, estado } = deuda;

    console.log("update-1", deuda);

    // const deudaFound = await Debt.findById(id);
    const deudaFound = await Debt.findOne({ id: id });
    if (!deudaFound) return [null, "La deuda no existe"];

    console.log("update-1b", deudaFound);

    const userFound = await User.findOne({ username: username });
    console.log("userFound", userFound);
    if (!userFound) return [null, "El usuario no existe"];

    console.log("update-2", userFound);

    const debtStatesFound = await debtStates.find({ name: { $in: estado } });
    if (debtStatesFound.length === 0) return [null, "El estado no existe"];
    const mydebtStates = debtStatesFound.map((estado) => estado._id);

    console.log("update-3", debtStatesFound);
    console.log("update-4", service);

    const idServiceFound = await Categoria.find({ name: { $in: service } });
    if (idServiceFound.length === 0)
      return [null, "El servicio especificado no existe"];
    const myidService = idServiceFound.map((idService) => idService._id);

    console.log("update-4", myidService);

    // Actualizar la deuda del usuario
    userFound.debt += amount;
    userFound.estado = mydebtStates;

    console.log("update-5");

    // Si la deuda es cero, quita al usuario de la lista negra
    /* if (userFound.debt === 0 && userFound.blacklisted) {
            userFound.blacklisted = false;
        } */
    await userFound.save();

    const numerocuotas = deudaFound.numerocuotas;

    console.log("userFound.debt", userFound.debt);
    console.log("numerocuotas", numerocuotas);

    const valorcuota = userFound.debt / numerocuotas;

    deudaFound.user = userFound._id;
    deudaFound.idService = myidService;
    deudaFound.initialdate = initialdate;
    deudaFound.finaldate = finaldate;
    deudaFound.amount = amount;
    deudaFound.actualamount = userFound.debt;
    deudaFound.valorcuota = valorcuota;
    deudaFound.numerocuotas = numerocuotas;
    deudaFound.estado = mydebtStates;
    await deudaFound.save();

    return [deudaFound, null];
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
    console.log("Obteniendo usuarios en la lista negra...");
    const blacklistedUsers = await User.find({ blacklisted: true });
    console.log(`Usuarios en la lista negra: ${blacklistedUsers.length}`);

    for (let user of blacklistedUsers) {
      console.log(`Obteniendo deudas para el usuario ${user._id}...`);
      const userDebts = await Debt.find({ user: user._id });
      console.log(`Deudas obtenidas: ${userDebts.length}`);

      const allDebtsPaid = userDebts.every((debt) => debt.amount === 0);
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
const checkOverdueDebts = async function () {
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
    console.error("Error en deudas.service -> checkOverdueDebts:", error);
  }
};

async function updateAllUserStates() {
  // Obtiene todos los usuarios
  const users = await User.find();

  // Busca los ObjectId de los estados "al dia" y "deudor"
  const alDiaState = await State.findOne({ name: "al dia" });
  const deudorState = await State.findOne({ name: "deudor" });

  // Actualiza el estado de cada usuario
  for (let user of users) {
    const debt = await Debt.findOne({ user: user._id });
    // Si no se encuentra ninguna deuda para el usuario o la deuda es 0, establece el estado como "al dia"
    if (!debt || debt.actualamount === 0) {
      user.state = alDiaState._id;
      await user.save();
      continue;
    }

    // Si la deuda es mayor que 0 y la fecha final es posterior a la fecha actual, establece el estado como "al dia"
    if (debt.actualamount > 0 && debt.finaldate > Date.now()) {
      user.state = alDiaState._id;
      await user.save();
      continue;
    }

    // Si la deuda es mayor que 0 y la fecha final es anterior a la fecha actual, establece el estado como "deudor"
    if (debt.actualamount > 0 && debt.finaldate < Date.now()) {
      user.state = deudorState._id;
      await user.save();
      continue;
    }
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

async function getDeudasByUserId(userId) {
  try {
    const deudas = await Debt.find({ user: userId }).exec();
    return [deudas, null];
  } catch (error) {
    console.error("Error al obtener las deudas del usuario:", error);
    return [null, error.message];
  }
}

const cron = require("node-cron");

// Programa una tarea para ejecutarse todos los días a las 00:00
cron.schedule("00 00 * * *", () => {
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
  getDeudasByUserId,
};
