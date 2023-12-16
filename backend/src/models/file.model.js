const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
   /*  userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appeal',
        required: true
    } */
});

module.exports = mongoose.model('File', fileSchema);