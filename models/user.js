const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {type: String, require: true},
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    image: {type: String, require: true},
    // Acá indicamos que es requerido, de tipo id de mongoose, y que hace referencia al modelo 'Place' para relacionarlo.
    // Al encerrarlo en [], le decimos que puede tener varios places
    places: [{type: mongoose.Types.ObjectId, required: true, ref: 'Place'}]
})

// Paquete que valida si una propiedad tiene unique: true, que no lo agregue a la bd
userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)