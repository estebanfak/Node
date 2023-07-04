const HttpError = require('../models/http-error') // Importamos nuestro error personalizado
const { v4: uuid } = require('uuid'); // Importamos un creador de id unicos
const { validationResult } = require('express-validator') // Importamos el validador de datos, pero acá hacemos la validación según lo que indicamos en los routers

const getCoordForAddress = require('../util/location')

const DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire StateBuilding',
        description: 'One big sky scrapers in the world!',
        location: {
            lat: 40.7484474,
            long: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Centro Civico',
        description: 'One big cement monument!',
        location: {
            lat: 80.7484474,
            long: -23.9871516
        },
        address: 'San Juan, Argentina',
        creator: 'u1'
    }
]

const getAllPlaces = (req, res, next) => { // Métodos, siempre tienen la  estructura (req, res, next)
    res.json({places: DUMMY_PLACES}) // Siempre hay que finalizar la respuesta para que no quede colgado. res.json()/res.end(), etc
}

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid; // Los parametros los encontramos en la peticion (req.params.nombreDelParametro)
    const place = DUMMY_PLACES.find(pl => pl.id === placeId)
    if (!place) {
        throw new HttpError('Could not find a place for the provided id.', 404) // EL throw finaliza el método (no queda colgado)
    }
    res.json({ place })
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(pl => pl.creator === userId)
    if (!places || places.length === 0) {
        return next( // Colocamos return no para que el método next retorne algo, sino para cortar el flujo del método
            new HttpError('Could not find a place for the provided user id.', 404)
        ); // Con el método next() se ejecuta la siguiente función que cumpla con el endpoint (puede ser no encotrado o error u otra)
    }
    res.json({places}) //
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req) // Método que valida los campos de la req establecidos en el router
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    const { title, description, address, creator } = req.body
    let coordinates
    try{
        coordinates = await getCoordForAddress(address)
    }catch(error){
        return next(error);
    }
    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }
    DUMMY_PLACES.push(createdPlace)
    res.status(201).json({ place: createdPlace }) // En la respuesta podemos indicar el status con su numero. Si se omite, se envía 200 por default
}

const updatePlace = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        throw new HttpError('Invalid inputs passed, please check your data', 422)
    }
    const placeId = req.params.pid
    const { title, description } = req.body
    const placeToPatch = {...DUMMY_PLACES.find(p=> p.id===placeId)}
    
    if(!placeToPatch){
        throw new HttpError('Could not find a place for the provided id.', 404)
    }
    
    const newPlace = {
        ...placeToPatch,
        title: title || placeToPatch.title,
        description: description || placeToPatch.description

    }
    DUMMY_PLACES[DUMMY_PLACES.findIndex(p=> p.id===placeId)] = newPlace

    res.status(200).json({newPlace: newPlace})
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid

// Si DUMMY_PLACES es una constante (const DUMMY_PLACES)
    const place = DUMMY_PLACES.find(p=>p.id===placeId)
    if(!place){
        throw new HttpError('Could not find a place for the provided id.', 404)
    }
    DUMMY_PLACES.splice(DUMMY_PLACES[DUMMY_PLACES.findIndex(p=> p.id===placeId)], 1)
// ------------------------------------------------------ 

// Si DUMMY_PLACES no es una constante (let DUMMY_PLACES)
// DUMMY_PLACES = DUMMY_PLACES.filter(p=> p.id===placeId)
// ------------------------------------------------------
    res.status(200).json({message: 'Deleted'})
}

module.exports = { // Exportamos todos los métodos
    getPlaceById, 
    getPlacesByUserId, 
    getAllPlaces, 
    createPlace, 
    updatePlace, 
    deletePlace 
}