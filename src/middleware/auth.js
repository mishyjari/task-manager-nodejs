const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const jwtSecret = process.env.JWT_SECRET;

const auth = async ( req, res, next ) => {
    try {
        const token = req.header('Authorization').split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret)
        
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if ( !user ) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    }   
    catch ( err ) {
        res.status( 401 ).send({ error: 'Please authenticate.' })
    } 
};

module.exports = auth;