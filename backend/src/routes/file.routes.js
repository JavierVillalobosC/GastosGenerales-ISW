"use strict"

const express = require('express')
const multer = require('multer');

const fileController = require('../controllers/file.controller')

const { upload, fileSize } = require('../middlewares/handleMulter.middleware');
const verifyJWT = require('../middlewares/authentication.middleware');
//const fileSize = require('../middlewares/fileSize.middleware')


const router = express.Router()

router.post("/:archivo/", upload.array('archivo', 10), fileSize, fileController.uploadNewFile, (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.error(error);
        res.status(500).json({ error: "Se ha producido un error de Multer al cargar." });
    } else if (error) {
        // An unknown error occurred when uploading.
        console.error(error);
        res.status(500).json({ error: "Se ha producido un error desconocido al cargar." });
    }
    // Everything went fine.
});
//router.post("/:archivos", upload.array('archivos'), fileSize, fileController.uploadNewFile)
router.get('/', fileController.getFiles)
router.get('/:id', fileController.getSpecificFile)
router.delete('/:id', fileController.deleteFile);
router.put('/:id', fileController.updateFile);


module.exports = router;