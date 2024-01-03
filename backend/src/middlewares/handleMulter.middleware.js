const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const app = express();

app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const relativePath = './upload/' + String(req.params.appealId);
        const absolutePath = path.resolve(__dirname, relativePath);
        console.log('Guardando archivo en: ', absolutePath);
        if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath, { recursive: true })
        }
        cb(null, absolutePath)
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
        const allowedMimes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no válido. Sólo se permiten archivos png, jpg, jpeg y pdf.'));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 10
    }
});

const fileSize = (req, res, next) => {
    req.files.forEach(file => {
        if (file.size > 1024 * 1024 * 10) { // 10MB
            return res.status(400).send({ message: "El tamaño del archivo es demasiado grande" });
        }
    });
    next();
};


module.exports = { upload, fileSize };
