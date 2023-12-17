const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/deudas/:userId', reportController.getDeudasReportForUser);
router.get('/deudas/pdf/:userId', reportController.getDeudasReportForUserPDF);
router.get('/users', reportController.getUsersReport);
router.get('/pagos', reportController.getPagosReport);
router.get('/pagos/:userId', reportController.getPagosReportForUser);
router.get('/pagos/pdf/:userId', reportController.getPagosReportForUserPDF);

module.exports = router;