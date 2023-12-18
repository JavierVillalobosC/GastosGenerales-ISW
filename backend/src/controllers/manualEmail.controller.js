const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const manualEmail = (req, res) => {
    const { emailContent, userEmail } = req.body
    const token = process.env.PW // Contraseña
    const mail = 'victor.herrera1901@alumnos.ubiobio.cl'
    if (!token || token === undefined || token === null){
        return res.status(400).send({message:"No se ha entregado la contraseña de aplicación para el correo"})
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

    const mailOptions = {
        from: `Encargado`,
        to: userEmail,
        subject: 'Recordatorio de pago',
        text: `${emailContent}`
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            return res.status(400).send({message:'Error al enviar el correo'})
        }
        return res.status(200).send({message:'Mensaje enviado'})
    })

    transporter.verify().then(()=>{
        console.log('Servidor de correos habilitado')
    }).catch(err=>{
        console.log('Error al utilizar servidor de correos')
    })

}

module.exports = {
    manualEmail
};