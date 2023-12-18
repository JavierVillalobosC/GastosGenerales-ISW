const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const moment = require('moment');
const Debt = require("../models/deuda.model.js");
dotenv.config();

async function getEmailsAndDebts(days) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    try {
        const debts = await Debt.find({
            finaldate: {
                $gte: targetDate,
                $lt: nextDay
            }
        }).populate('user', 'email username');
        return debts.map(debt => ({
            email: debt.user.email,
            username: debt.user.username,
            actualamount: debt.actualamount,
            valorcuota: debt.valorcuota,
            finaldate: debt.finaldate,
            numerocuotas: debt.numerocuotas
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

const sendMail = async (days) => {
    const token = process.env.PW // Contraseña
    const mail = 'victor.herrera1901@alumnos.ubiobio.cl'
    if (!token || token === undefined || token === null){
        console.error("No se ha entregado la contraseña de aplicación para el correo");
        return;
    }
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth:{
            user: mail,
            pass: token
        }
    })

    let users;
    try {
        users = await getEmailsAndDebts(days);
    } catch (error) {
        console.error(error);
        return;
    }

    users.forEach(user => {
        const formattedDate = moment(user.finaldate).format('DD-MM-YYYY');
        const mailOptions = {
            from: `Encargado`,
            to: user.email,
            subject: 'Recordatorio de pago',
            html: `
            <html>
            <body>
                <header>
                    <h1>Recordatorio de Pago</h1>
                </header>
                <main>
                    <p>Estimad@ ${user.username},</p>
                    <p>Este es un recordatorio para informarle que su factura vencerá pronto. Por favor, asegúrase de realizar el pago antes de la fecha de vencimiento para evitar retrasos y cargos adicionales.</p>
                    <p>A continuación, te proporcionamos los detalles de la factura:</p>
                    <ul>
                        <li>Monto total: ${user.actualamount}</li>
                        <li>Valor de la cuota: ${user.valorcuota}</li>
                        <li>Cantidad de cuotas: ${user.numerocuotas}</li>
                        <li>Fecha de vencimiento: ${formattedDate}</li>
                    </ul>
                    <p>Para realizar el pago, visita nuestro <a href="https://intranet.ubiobio.cl">sitio web</a> o acude presencialemente a la municipalidad.</p>
                    <img src="https://i.imgur.com/dUmvZnw.png" alt="Ejemplo de imagen" width="666" height="256">
                </main>
            </body>
            </html>
            `
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if(err){
                console.error('Error al enviar el correo', err);
            } else {
                console.log('Mensaje enviado a', user.email);
            }
        });
    });

    transporter.verify().then(()=>{
        console.log('Servidor de correos habilitado')
    }).catch(err=>{
        console.log('Error al utilizar servidor de correos')
    })
}

module.exports = {
    sendMail
};