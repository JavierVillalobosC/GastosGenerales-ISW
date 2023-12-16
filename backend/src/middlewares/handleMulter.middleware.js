const express = require('express');
const multer = require('multer');
const fs = require('fs');


const app = express();

app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const route = './upload/' + req.params.appealId; // Usa el ID de la apelación para la ruta de destino
        if (!fs.existsSync(route)) {
            fs.mkdirSync(route, { recursive: true })
        }
        cb(null, route)
    },
    filename: function (req, file, cb) {
        let fecha = new Date();
        fecha = fecha.getFullYear() + '_' + (fecha.getMonth() + 1) + '_' + fecha.getDate() + '_' + fecha.getHours() + '_' + fecha.getMinutes() + '_' + fecha.getSeconds()
        const nameFile = fecha + ' ' + file.originalname
        cb(null, nameFile)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'image/png') {
            console.log("El archivo es un png")
        } else {
            console.log("El archivo tiene otra extension")
        }
        cb(null, true)
    },
    limits: {
        fileSize: 1024 * 1024 * 5
    }
});

const fileSize = (req, res, next) => {
    req.files.forEach(file => {
        if (file.size > 1024 * 1024 * 5) { // 5MB
            return res.status(400).send({ message: "El tamaño del archivo es demasiado grande" });
        }
    });
    next();
};


module.exports = { upload, fileSize };
