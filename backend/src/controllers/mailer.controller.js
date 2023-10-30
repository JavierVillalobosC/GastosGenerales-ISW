const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendMail = (req, res) => {
//  const {message} = req.body
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
    let directory = [
        'victor.herrera1901@alumnos.ubiobio.cl',
        'javier.villalobos1901@alumnos.ubiobio.cl',
        'vicente.sanhueza1901@alumnos.ubiobio.cl',
        'sebastian.araneda1901@alumnos.ubiobio.cl' // array, consulta de a quien enviar los correos
    ]

    const mailOptions = {
        from: `Encargado`,
        to: directory,
        subject: 'Recordatorio de pago',
//      text: `Se realizo de manera correcta el envio de correo, mensaje: ${message}` // Envio de texto
        html:`
        <html>
        <body>
            <header>
                <h1>Recordatorio de Pago</h1>
            </header>
            <main>
                <p>Estimado cliente,</p>
                <p>Este es un recordatorio para informarle que su factura vencerá pronto. Por favor, asegúrase de realizar el pago antes de la fecha de vencimiento para evitar retrasos y cargos adicionales.</p>
                <p>A continuación, te proporcionamos los detalles de la factura:</p>
                <ul>
                    <li>Fecha de vencimiento: 01 de diciembre de 2023</li>
                    <li>Total a pagar: $55.000</li>
                </ul>
                <p>Para realizar el pago, visita nuestro <a href="https://intranet.ubiobio.cl">sitio web</a> o acude presencialemente a la municipalidad.</p>
                <img src="https://media.biobiochile.cl/wp-content/uploads/2023/09/fotojet-5-1152x768.jpg" alt="Ejemplo de imagen" width="300" height="200">
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
    sendMail
};