const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = require('./auth-service');

const AuthRouter = express.Router()

AuthRouter
    .route('/login')
    .post(express.json(), (req, res, next) => {
        const { user_name, password } = req.body;
        const loginUser = { user_name, password };

        for( const [key, value] of Object.entries(loginUser))
            if(!value)
                return res.status(400).json({error: `Missing '${key}' in request body`})

        return AuthService.getUserWithUserName(req.app.get('db'), loginUser.user_name)
            .then(user => {
                if(!user)
                    return res.status(400).json({error: 'Invalid username or password'})

                return bcrypt.compare(password, user.password)
                    .then(passwordMatch => {
                        if(!passwordMatch)
                            return res.status(400).json({error: 'Invalid username or password'})
                    })

            })
        

        next()
    })


module.exports = AuthRouter;