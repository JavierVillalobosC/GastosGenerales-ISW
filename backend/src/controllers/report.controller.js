const reportService = require('../services/report.service');
const Categoria = require("../models/categorias.model.js");
const paytype = require("../models/paytypes.model.js");
const DebtStates = require("../models/debtstate.model.js");

const pdfmake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfmake.vfs = pdfFonts.pdfMake.vfs;
const { Readable } = require("stream");

exports.getDeudasReportForUser = async (req, res) => {
    const [report, error] = await reportService.getDeudasReportForUser(req.params.userId);
    if (error) {
        return res.status(400).json({ error });
    }
    return res.json(report);
};

exports.getUsersReport = async (req, res) => {
    const [report, error] = await reportService.getUsersReport();
    if (error) {
        return res.status(400).json({ error });
    }
    return res.json(report);
};

exports.getPagosReport = async (req, res) => {
    const [report, error] = await reportService.getPagosReport();
    if (error) {
        return res.status(400).json({ error });
    }
    return res.json(report);
};

exports.getPagosReportForUser = async (req, res) => {
    const [report, error] = await reportService.getPagosReportForUser(req.params.userId);
    if (error) {
        return res.status(400).json({ error });
    }
    return res.json(report);
};

exports.getDeudasReportForUserPDF = async (req, res) => {
    try {
        const [report, error] = await reportService.getDeudasReportForUser(req.params.userId);
        if (error) {
            return res.status(400).json({ error });
        }

        // Verificar que report y report.deudas existen y que report.deudas es un array
        if (!report || !report.deudas || !Array.isArray(report.deudas)) {
            console.error('report or report.deudas is not an array:', report);
            return res.status(500).json({ error: 'Se ha producido un error al generar el PDF.' });
        }

        // Definición del documento
        const docDefinition = {
            content: [
                { text: 'Informe de Deudas', style: 'header' },
                ...await Promise.all(report.deudas.map(async (deuda, index) => {
                    // Si la deuda es null o undefined, o no tiene las propiedades esperadas, devolver un array vacío
                    if (!deuda || !deuda.user || !deuda.serviceId || !deuda.initialDate || !deuda.finalDate || !deuda.actualamount || !deuda.numberOfPayments || !deuda.state) {
                        return [];
                    }

                    // Registrar el objeto deuda
                    console.log(`Deuda ${index}:`, deuda);

                    // Buscar el nombre del servicio y estado por su ID
                    const servicio = await Categoria.findOne({ name: deuda.serviceId });
                    const estado = await DebtStates.findOne({ name: deuda.state });

                    return [
                        { text: `Usuario: ${deuda.user}` },
                        { text: `Servicio: ${servicio ? servicio.name : 'No encontrado'}` },
                        { text: `Fecha inicial: ${new Date(deuda.initialDate).toLocaleDateString()}` },
                        { text: `Fecha final: ${new Date(deuda.finalDate).toLocaleDateString()}` },
                        { text: `Monto actual: ${deuda.actualamount.toLocaleString('es-Cl', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                        { text: `Número de pagos: ${deuda.numberOfPayments}` },
                        { text: `Estado: ${estado ? estado.name : 'No encontrado'}` },
                        '\n'
                    ];
                })),
                { 
                    text: [
                      { text: 'Total de Deudas: ', bold: true, fontSize: 14 },
                      { text: `${report.resumen.totalAmount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, fontSize: 12 }
                    ]
                  },
                  { 
                    text: [
                      { text: 'Promedio de Deudas: ', bold: true, fontSize: 14 },
                      { text: `${report.resumen.averageAmount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, fontSize: 12 }
                    ]
                  },
                  { 
                    text: [
                      { text: 'Total de Pagos: ', bold: true, fontSize: 14 },
                      { text: `${report.resumen.totalNumberOfPayments}`, fontSize: 12 }
                    ]
                  },
                  { 
                    text: [
                      { text: 'Promedio de Pagos: ', bold: true, fontSize: 14 },
                      { text: `${report.resumen.averageNumberOfPayments}`, fontSize: 12 }
                    ]
                  }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                }
            },
            footer: function(currentPage, pageCount) { return currentPage.toString() + ' de ' + pageCount; },
        };

        // Crear un PDF con pdfmake
        const pdfDoc = pdfmake.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => {
            // Convertir el búfer en un flujo
            const stream = new Readable();
            stream.push(buffer);
            stream.push(null);

            // Canalizar el flujo hacia la respuesta
            res.setHeader('Content-Type', 'application/pdf');
            stream.pipe(res);
        });
    } catch (err) {
        // Manejar error
        console.error(err);
        res.status(500).json({ error: 'Se ha producido un error al generar el PDF.' });
    }
};


exports.getPagosReportForUserPDF = async (req, res) => {
    try {
        const [report, error] = await reportService.getPagosReportForUser(req.params.userId);
        if (error) {
            return res.status(400).json({ error });
        }

        let totalAmount = 0;
        let count = 0;

        // Definición del documento
        const docDefinition = {
            content: [
                { text: 'Informe de Pagos', style: 'header' },
                ...report.map((pago, index) => {
                    // Si el pago es null o undefined, o no tiene las propiedades esperadas, devolver un array vacío
                    if (!pago || !pago.user || !pago.serviceId || !pago.date || !pago.type || !pago.status) {
                        return [];
                    }
        
                    // Registrar el objeto pago
                    console.log(`Pago ${index}:`, pago);
        
                    // Actualizar el total y el conteo
                    totalAmount += pago.amount;
                    count++;
        
                    return [
                        { text: `Usuario: ${pago.user}` },
                        { text: `Servicio: ${pago.serviceId}` },
                        { text: `Fecha: ${new Date(pago.date).toLocaleDateString()}` },
                        { text: `Monto: ${pago.amount ? pago.amount : 'No disponible'}` },
                        { text: `Tipo: ${pago.type}` },
                        { text: `Estado: ${pago.status}` },
                        '\n'
                    ];
                }),
                { 
                    text: [
                        { text: 'Total Pagado: ', style: 'boldText', },
                        { text: `${totalAmount}` }
                    ]
                },
                { 
                    text: [
                        { text: 'Promedio de Pagos: ', style: 'boldText' },
                        { text: `${count > 0 ? totalAmount / count : 'No disponible'}` }
                    ]
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                boldText: {
                    bold: true
                }
            },
            footer: function(currentPage, pageCount) { return currentPage.toString() + ' de ' + pageCount; },
        };

        // Crear un PDF con pdfmake
        const pdfDoc = pdfmake.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => {
            // Convertir el búfer en un flujo
            const stream = new Readable();
            stream.push(buffer);
            stream.push(null);

            // Canalizar el flujo hacia la respuesta
            res.setHeader('Content-Type', 'application/pdf');
            stream.pipe(res);
        });
    } catch (err) {
        // Manejar error
        console.error(err);
        res.status(500).json({ error: 'Se ha producido un error al generar el PDF.' });
    }
};