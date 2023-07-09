const HttpError = require('../models/http-error') // Importamos nuestro error personalizado
// const { v4: uuid } = require('uuid'); // Importamos un creador de id unicos
const { validationResult } = require('express-validator') // Importamos el validador de datos, pero acá hacemos la validación según lo que indicamos en los routers

const getCoordForAddress = require('../util/location')
const Place = require('../models/place');
const { default: mongoose } = require('mongoose');

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

const getAllPlaces = async (req, res, next) => { // Métodos, siempre tienen la  estructura (req, res, next)
    const places = await Place.find().exec()
    res.json({places})
}

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid; // Los parametros los encontramos en la peticion (req.params.nombreDelParametro)
    let place = {}
    try{
        place = await Place.findById(placeId)
    } catch(err){
        return next(new HttpError('Could not find a place for the provided id.', 404))
    }
    res.json({ place })
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid
    let places = []
    try{
        places = await Place.find({creator: userId})
    }catch(err){
        return next(new HttpError('Could not find a place for the provided user id.', 404))
    }
    res.json({places})
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
    const createdPlace = new Place({
        title,
        description,
        image: 'https://static-cse.canva.com/blob/562124/RightBackground4.jpg',
        address,
        location: coordinates,
        creator
    })
    
    try{
        await createdPlace.save()
    }catch(err){
        const error = new HttpError('Creating place failed, please try again', 500)
        return next(error)
    }
    res.status(201).json({ place: createdPlace }) // En la respuesta podemos indicar el status con su numero. Si se omite, se envía 200 por default
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        throw new HttpError('Invalid inputs passed, please check your data', 422)
    }
    const placeId = req.params.pid
    const { title, description } = req.body
    let placeToPatch = {}
    const newPlace = {
        title,
        description
    }
    try {
        placeToPatch = await Place.findByIdAndUpdate(placeId, {newPlace})
    }catch(err){
        return next(new HttpError('Error trying to update the place.', 500))
    }
    res.status(200).json({place: placeToPatch})
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid
    try{
        await Place.findByIdAndDelete(placeId)
    }catch(err){
        return next(new HttpError('Could not delete the place', 500))
    }
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