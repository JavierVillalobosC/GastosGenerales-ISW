const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const manualEmail = (req, res) => {
    const { emailContent, userEmail, emailSubject} = req.body
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
        subject: emailSubject,
        html: `
        <html>
        <body>
            <header>
                <h1>${emailSubject}</h1>
            </header>
            <main>
                <p>Estimad@ Cliente,</p>
                <p>${emailContent}</p>
                <p>Para realizar el pago, visita nuestro <a href="https://intranet.ubiobio.cl">sitio web</a> o acude presencialemente a la municipalidad.</p>
                <img src="https://i.imgur.com/dUmvZnw.png" alt="Ejemplo de imagen" width="333" height="128">
            </main>
        </body>
        </html>
        `
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