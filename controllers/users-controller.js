const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const User = require('../models/user');

const getAllUsers = async (req, res, next) => {
    let users;
    try{
        users = await User.find({}, '-password');
    }catch(err){
        return next(new HttpError('Error while finding users, please try again', 500))
    }
    if(!users){
        return next(new HttpError('Could not find any user', 500))
    }
    res.json({users: users.map(u=>u.toObject({getters: true}))})
}
const addNewUser = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    const {name, email, password} = req.body

    if(await User.exists({email})){
        return next(new HttpError('Username already exists on database', 500))
    }
    const newUser = new User({
        name,
        email,
        password,
        image: 'https://static-cse.canva.com/blob/562124/RightBackground4.jpg',
        places: []
    })
    try{
        await newUser.save()
    }catch(err){
        return next(new HttpError('Error while creating user, please try again', 500))
    }
    newUser.password = null;
    res.status(201).json({newUser: newUser.toObject({getters: true})})
}
const login = async (req, res, next) => {
    const {email, password} = req.body
    let userDB;
    try{
        userDB = await User.findOne({email: email})
    }catch(err){
        return next(new HttpError('Something went wrong, please try again', 500))
    }

    if(!userDB || userDB.password !== password){
        return next(new HttpError('Username or password incorrect', 401))
        
    }
    res.json({message: 'User logged in correctly!', user: userDB.toObject({getters: true})})
}

module.exports = {
    getAllUsers,
    addNewUser,
    login
};