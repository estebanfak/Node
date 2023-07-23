const express = require('express')  // Importamos express
const { check } = require('express-validator') // Importamos el validador de datos (body), acá decimos los campos que queremos validar
const fileUpload = require('../middleware/file-upload')

const usersController = require('../controllers/users-controller') // Controlador donde detallamos los métodos para cada una de las rutas

const routes = express.Router() // acá vamos a acumular todas las rutas de places de nuestra app

routes.get('/', usersController.getAllUsers) // Indicamos el tipo de petición y el método a ejecutar
routes.post('/signup', 
    fileUpload.single('image'),
    [
        check('name').not().isEmpty(),  // Con check hacemos una validación previa
        check('email').normalizeEmail().isEmail(),
        check('password').not().isEmpty(),

    ], usersController.addNewUser)
routes.post('/login', usersController.login)


module.exports = routes; // Exportamos las rutas para poder utilizarlas en app.js