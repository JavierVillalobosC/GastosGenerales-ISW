"use strict"

const express = require('express')

const fileController = require('../controllers/file.controller')

const upload = require('../middlewares/handleMulter.middleware')
const fileSize = require('../middlewares/fileSize.middleware')


const router = express.Router()

router.post("/:archivo", upload.array('archivos'), fileSize, fileController.uploadNewFile)
router.get('/', fileController.getFiles)
router.get('/:id', fileController.getSpecificFile)

module.exports = router;