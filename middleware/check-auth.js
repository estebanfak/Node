const jwt = require('jsonwebtoken')

const HttpError = require("../models/http-error")

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS'){
        return next()
    }
    try{
        const token = req.headers.authorization.split(' ')[1]
        if(!token){
            throw new Error('Authentication failed!')
        }
        const decodedToken = jwt.decode(token, process.env.SECRET_PHRASE)
        req.userData = {userId: decodedToken.userId}
        next()
    }catch (err){
        next(new HttpError('Authentication failed!', 403))
    }
}