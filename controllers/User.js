const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * create new user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.signup = (req, res, next) => {

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User ({
                email : req.body.email,
                password : hash
            });
            user.save()
                .then(() => {
                    const message = 'Utilisateur créé.';
                    res.status(201).json({ message });
                })
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};

/**
 * get one user and send token to front-end
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.login = (req, res, next) => {

    User.findOne({ email: req.body.email })
        .then(user => {
            if(!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé.' });
            }
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid) {
                    return res.status(401).json({ error: 'Utilisateur non trouvé.' });
                }
                res.status(200).json({
                    userId: user.id,
                    token: jwt.sign(
                        {userId: user.id},
                        "AdkeRet54eEazeYTmpo",
                        {expiresIn: '24h'}
                    )
                });
            })
            .catch(error => res.status(500).json({error}))
        })
        .catch(error => res.status(500).json({error}))

};