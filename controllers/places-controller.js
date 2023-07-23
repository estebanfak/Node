const fs = require('fs')
const HttpError = require('../models/http-error') // Importamos nuestro error personalizado
const { validationResult } = require('express-validator') // Importamos el validador de datos, pero acá hacemos la validación según lo que indicamos en los routers
const mongoose = require('mongoose')
const getCoordForAddress = require('../util/location')
const Place = require('../models/place');
const User = require('../models/user');


const getAllPlaces = async (req, res, next) => { // Métodos, siempre tienen la  estructura (req, res, next)
    const places = await Place.find().exec()
    res.json({places})
}
const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid; // Los parametros los encontramos en la peticion (req.params.nombreDelParametro)
    let place;
    try{
        place = await Place.findById(placeId)
    } catch(err){
        return next(new HttpError('Something went wrong, could not find a place.', 404))
    }
    if(!place){
        return next(new HttpError('Could not find a place for the provided id.', 404))
    }
    res.json({ place: place.toObject({ getters: true }) })
}
const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid
    // Método 1:
    let places;
    try{
        places = await Place.find({creator: userId})
    }catch(err){
        return next(new HttpError('Fetching places failed, please try again.', 500))
    }
    if(!places || places.length === 0){
        return next(new HttpError('Could not find a place for the provided user id.', 404))
    }
    res.json({places: places.map(place => place.toObject({ getters: true }))})

    // Método 2
    // let userWhitPlaces;
    // try{
    //     userWhitPlaces = await User.findById(userId).populate('places')
    // }catch(err){
    //     return next(new HttpError('Fetching places failed, please try again.', 500))
    // }
    // if(!userWhitPlaces || userWhitPlaces.places.length === 0){
    //     return next(new HttpError('Could not find a place for the provided user id.', 404))
    // }
    // res.json({places: userWhitPlaces.places.map(place => place.toObject({ getters: true }))})
}
const createPlace = async (req, res, next) => {
    const errors = validationResult(req) // Método que valida los campos de la req establecidos en el router
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    const { title, description, address } = req.body
    let coordinates
    try{
        coordinates = await getCoordForAddress(address)
    }catch(error){
        return next(error);
    }
    const createdPlace = new Place({
        title,
        description,
        image: req.file.path,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId
    })

    let user;
    try{
        user = await User.findById(req.userData.userId);
    }catch(err){
        return next(new HttpError('Creating place failed, please try again', 500))
    }

    if(!user){
        return next(new HttpError('Could not find user with the provided id', 404))
    }

    try{
        // Creamos una sesión
        const sess = await mongoose.startSession()
        // Dentro de la sesión, creamos una transacción para guardar 2 documentos en la bd.
        // Si falla el guardado de 1 documento, se cancela todo.
        // Sólo es exitoso si se completa todo en la sesión
        sess.startTransaction()
        await createdPlace.save({ session: sess })
        // Éste método push es propio de mongoose, no es el método de los arrays de js
        user.places.push(createdPlace)
        await user.save({session: sess})
        // Finalizamos la sesión para que recién ahora se guarden los datos a la bd
        await sess.commitTransaction()

    }catch(err){
        const error = new HttpError('Creating place failed, please try again', 500)
        return next(error)
    }
    res.status(201).json({ place: createdPlace }) // En la respuesta podemos indicar el status con su numero. Si se omite, se envía 200 por default
}
const updatePlace = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    const placeId = req.params.pid
    const { title, description } = req.body
    let place;

    try {
        place = await Place.findById(placeId)
    }catch(err){
        return next(new HttpError('Error trying to update the place.', 500))
    }
    
    if(place.creator.toString() !== req.userData.userId){
        return next(new HttpError('You are not allowed to update the place.', 500))
    }

    place.title = title
    place.description = description

    try{
        await place.save()
    }catch(err){
        return next(new HttpError('Error trying to update the place.', 500))
    }



    res.status(200).json({place: place.toObject({ getters: true })})
}
const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid
    let place;
    try{
        place = await Place.findById(placeId).populate('creator')
    }catch(err){
        return next(new HttpError('Error while trying to delete, please try again', 500))
    }
    if(!place){
        return next(new HttpError('Could not find the place with the provided id', 404))
    }
    if(place.creator.id !== req.userData.userId){
        return next(new HttpError('You are not allowed to delete the place.', 500))
    }

    const imagePath = place.image

    try{
        const sess = await mongoose.startSession()
        sess.startTransaction()
        place.creator.places.pull(place)
        await place.creator.save({session: sess})
        await Place.findByIdAndDelete(placeId).session(sess)
        await sess.commitTransaction()
    }catch(err){
        return next(new HttpError('Could not delete the place', 500))
    }

    fs.unlink(imagePath, err => {
        console.error(err);
    })

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