const HttpError = require('../models/http-error')
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator')

let DUMMY_USERS = [
    {
        id: "u1",
        username: 'Esteban@gmail.com',
        password: '123456'
    },
    {
        id: "u2",
        username: 'Cacho@gmail.com',
        password: '123456'
    },
    {
        id: "u3",
        username: 'Coco@gmail.com',
        password: '123456'
    }
]

const getAllUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS})
}

const addNewUser = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        throw new HttpError('Invalid inputs passed, please check your data', 422)
    }
    const {username, password} = req.body
    if(DUMMY_USERS.find(u=>u.username===username)){
        throw new HttpError('Username already exists in db', 422)
    }
    if(!username || !password){
        throw new HttpError('Username and Password are required!', 401)
    }
    let newUser = {
        id: uuid(),
        username,
        password
    }
    DUMMY_USERS.push(newUser)
    res.status(201).json({newUser})
}

const login = (req, res, next) => {
    const {username, password} = req.body
    userDB = DUMMY_USERS.find(u => u.username === username)
    if(!userDB || userDB.password !== password){
        throw new HttpError('Username or password incorrect', 401)
    }
    res.json({message: 'User logged in correctly!'})
}



module.exports = {
    getAllUsers,
    addNewUser,
    login
};