const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const User = require('../models/user');

const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('Error while finding users, please try again', 500))
    }
    if (!users) {
        return next(new HttpError('Could not find any user', 500))
    }
    res.json({ users: users.map(u => u.toObject({ getters: true })) })
}
const addNewUser = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    const { name, email, password } = req.body

    if (await User.exists({ email })) {
        return next(new HttpError('Username already exists on database', 500))
    }

    let hashedPassword;
    try {
        hashedPassword = await bycrypt.hash(password, 12)
    } catch (err) {
        const error = new HttpError('Could not create the user, please try again', 500)
        return next(error);
    }

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.path,
        places: []
    })
    try {
        await newUser.save()
    } catch (err) {
        return next(new HttpError('Error while creating user, please try again', 500))
    }

    let token
    try {
        token = jwt.sign(
            {
                userId: newUser.id, email: newUser.email
            },
            process.env.SECRET_PHRASE,
            { expiresIn: '1h' }
        )
    } catch (err) {
        return next(new HttpError('Error while creating user, please try again', 500))
    }


    res.status(201).json({ userId: newUser.id, email: newUser.email, token, token })
}
const login = async (req, res, next) => {
    const { email, password } = req.body
    let userDB;
    try {
        userDB = await User.findOne({ email: email })
    } catch (err) {
        return next(new HttpError('Something went wrong, please try again', 500))
    }

    if (!userDB) {
        return next(new HttpError('Username or password incorrect', 403))
    }

    let isValidPassword;
    try {
        isValidPassword = await bycrypt.compare(password, userDB.password)
    } catch (err) {
        return new HttpError('Could not log you in, please verify your credentials and try again', 500)
    }

    if (!isValidPassword) {
        return next(new HttpError('Username or password incorrect', 403))
    }

    let token
    try {
        token = jwt.sign(
            {
                userId: userDB.id, email: userDB.email
            },
            process.env.SECRET_PHRASE,
            { expiresIn: '1h' }
        )
    } catch (err) {
        return next(new HttpError('Error while logging in, please try again', 500))
    }
    res.json({ userId: userDB.id, email: userDB.email, token, token })
}

module.exports = {
    getAllUsers,
    addNewUser,
    login,
};