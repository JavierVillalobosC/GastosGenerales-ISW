// src/routes/appeal.routes.js
"use strict"
const express = require('express');
const multer = require('multer');

const appealController = require('../controllers/appeal.controller');
const fileController = require('../controllers/file.controller');

const { upload, fileSize } = require('../middlewares/handleMulter.middleware');
const authorizationMiddleware = require('../middlewares/authorization.middleware');
const authenticationMiddleware = require('../middlewares/authentication.middleware');

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', appealController.createAppeal);
router.get('/', appealController.getAllAppeals);
router.get('/user/:userId', authenticationMiddleware, appealController.getAppealsByUser); // Cada usuario puede ver sus propias apelaciones
router.get('/:id', appealController.getAppeal);
router.put('/:id', appealController.updateAppeal);
router.delete('/:id', appealController.deleteAppeal);
router.put('/:id/status', authorizationMiddleware.isAdmin, appealController.updateAppealStatus);

// Ruta para subir archivos a una apelación específica
router.post('/:appealId/files', upload.array('archivo', 10), authenticationMiddleware, fileSize, fileController.uploadNewFile);

module.exports = router;