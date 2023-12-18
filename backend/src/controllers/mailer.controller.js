const cron = require('node-cron');
const { sendMail } = require('../services/mailer.service');

/* Programa tareas para enviar correos a 1 día, 2 días, 1 semana y 2 semanas antes de la fecha de vencimiento */
cron.schedule('00 00 * * *', () => sendMail(1)); // 1 día antes
cron.schedule('00 00 * * *', () => sendMail(2)); // 2 días antes
cron.schedule('00 00 * * *', () => sendMail(7)); // 1 semana antes
cron.schedule('00 00 * * *', () => sendMail(14)); // 2 semanas antes