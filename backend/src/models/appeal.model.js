// src/models/appeal.model.js
const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({

    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    debtId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Debt', 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    files: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'File' 
        }
    ], // Referencia a los archivos
    status: { 
        type: String,
         enum: ['pending', 'approved', 'rejected'], 
         default: 'pending' 
        },
});

module.exports = mongoose.model('Appeal', appealSchema);