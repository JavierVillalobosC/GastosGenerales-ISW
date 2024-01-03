const fileModel = require ('../models/file.model')
const fs = require('fs');
const path = require('path');
const Appeal = require('../models/appeal.model');
const { upload } = require('../middlewares/handleMulter.middleware');

const uploadNewFile = async (req, res) => {

    const user=req.user;
    const {appealId } = req.params;
    //console.log(req.files);
    /* console.log(req.body);

    const { userId, appealId } = req.body;

    if (!userId || !appealId) {
        return res.status(400).send({ message: "userId y appealId son requeridos" });
    } */

    const files = req.files.map(file => ({
        name: file.originalname,
        url: file.path,
        size: file.size,
        mimeType: file.mimetype,
        userId: user.id,
        appealId
    }));

    try {
        const savedFiles = await fileModel.insertMany(files);

        // Encuentra la apelación en la base de datos
        const appeal = await Appeal.findById(appealId);

        if (!appeal) {
            return res.status(404).send({ message: 'No se encontró ninguna apelación con el ID proporcionado' });
        }
        // Añade los IDs de los archivos al array `files` de la apelación
        savedFiles.forEach(file => appeal.files.push(file._id));

        // Guarda la apelación actualizada en la base de datos
        await appeal.save();

        res.status(201).send(savedFiles);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Hubo un error al subir los archivos" });
    }
};

const getFiles = async (req, res) => {
    try {
        const files = await fileModel.find({});
        res.status(200).send(files);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Hubo un error al obtener los archivos" });
    }
};


const getSpecificFile = async (req, res) => {
    const { id } = req.params;
    try {
        const file = await fileModel.findById(id);
        console.log('Documento de archivo:', file);
        if (!file) {
            return res.status(404).send({ message: "Archivo no existe" });
        }
        if (!file.url || !file.mimeType) {
            return res.status(500).send({ message: "Información de archivo incompleta" });
        }
        const filePath = path.resolve('./upload/', file.url); // Agrega la ubicación de la carpeta './upload/' a la ruta del archivo
        console.log('Ruta del archivo:', filePath);

        // Establece el encabezado 'Content-Disposition' con el nombre del archivo
        res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(filePath));
        // Establece el encabezado 'Content-Type' con el tipo de archivo
        res.setHeader('Content-Type', file.mimeType);

        return res.download(filePath, file.name);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error al obtener el archivo" });
    }
};

const deleteFile = async (req, res) => {
    console.log(req.params);
    const { id } = req.params;
    try {
        const file = await fileModel.findById(id);
        if (!file) {
            return res.status(404).send({ message: "Archivo no existe" });
        }

        // Construye la ruta del archivo desde el directorio raíz del proyecto
        const filePath = path.resolve('./', file.url);
        console.log(filePath);

        // Elimina el archivo del sistema de archivos
        fs.unlink(filePath, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: "Error al eliminar el archivo del sistema de archivos" });
            }

            // Elimina la entrada del archivo de la base de datos
            await fileModel.findByIdAndDelete(id);
            res.status(200).send({ message: "Archivo eliminado con éxito" });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error al eliminar el archivo" });
    }
};

const updateFile = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const file = await fileModel.findById(id);
        if (!file) {
            return res.status(404).send({ message: "El archivo no existe" });
        }

        // Actualizar la información del archivo
        Object.keys(updates).forEach((update) => file[update] = updates[update]);

        await file.save();
        res.status(200).send(file);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error al actualizar el archivo" });
    }
};

module.exports = {
    uploadNewFile,
    getFiles,
    getSpecificFile,
    deleteFile,
    updateFile
}