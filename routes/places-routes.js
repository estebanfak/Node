const express = require('express')  // Importamos express
const { check } = require('express-validator') // Importamos el validador de datos (body), acá decimos los campos que queremos validar

const placesController = require('../controllers/places-controller') // Controlador donde detallamos los métodos para cada una de las rutas

const routes = express.Router() // acá vamos a acumular todas las rutas de places de nuestra app

routes.get('/', placesController.getAllPlaces) // Indicamos el tipo de petición y el método a ejecutar
routes.get('/:pid', placesController.getPlaceById)
routes.get('/user/:uid', placesController.getPlacesByUserId) // Cuando solicitamos un parámetro por url, lo indicamos con ':nombreDelParametro'
routes.post('/', [
    check('title').not().isEmpty(), // Con check hacemos una validación previa
    check('description').isLength({min: 5}),
    check('address').not().isEmpty()
], placesController.createPlace)
routes.patch('/:pid', [
    check('title').optional().not().isEmpty(),
    check('description').optional().not().isEmpty()
], placesController.updatePlace)
routes.delete('/:pid', placesController.deletePlace)

module.exports = routes; // Exportamos las rutas para poder utilizarlas en app.js