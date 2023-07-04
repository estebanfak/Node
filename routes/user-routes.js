const express = require('express')  // Importamos express
const { check } = require('express-validator') // Importamos el validador de datos (body), acá decimos los campos que queremos validar

const usersController = require('../controllers/users-controller') // Controlador donde detallamos los métodos para cada una de las rutas

const routes = express.Router() // acá vamos a acumular todas las rutas de places de nuestra app

routes.get('/', usersController.getAllUsers) // Indicamos el tipo de petición y el método a ejecutar
routes.post('/signup', [
    check('username').normalizeEmail().isEmail(), // Con check hacemos una validación previa
    check('password').not().isEmpty(),

], usersController.addNewUser)
routes.post('/login', usersController.login)


module.exports = routes; // Exportamos las rutas para poder utilizarlas en app.js