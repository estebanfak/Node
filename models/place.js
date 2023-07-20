const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    address: {type: String, required: true},
    location: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true}
    },
    // Acá indicamos que es requerido, de tipo id de mongoose, y que hace referencia al modelo 'User' para relacionarlo. Tiene un solo valor
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'} 
})

module.exports = mongoose.model('Place', placeSchema);