const express = require('express');
const router = new express.Router();
const User = require('../models/user.js');
const auth = require('../middleware/auth.js');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account.js');

// Multer config for file upload
const upload = multer({ 
    limits: {
        fileSize: 1000000,
    },
    fileFilter( req, file, cb ) {
        const isJpg = file.originalname.match(/\.(jpg|jpeg|png)$/);
        return isJpg ? cb(null, true) : cb(new Error('File type must be jpg or png'))
    }
});

// GET current user
router.get('/users/me', auth, async ( req, res ) => {
    res.send(req.user)
});

// POST new User
router.post('/users', async ( req, res ) => {
    const user = new User( req.body );    
    try {
        const token = await user.generateAuthToken();
        user.tokens = [{token}]
     
        await user.save();

        sendWelcomeEmail(user.email,user.name);

        res.status( 201 ).send({ user, token });
    }
    catch ( err ) {
        res.status( 400 ).send( err );
    }
    
});

// PATCH to update user
router.patch('/users/me', auth, async ( req, res ) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [ 'name', 'email', 'password', 'age' ];
    const isValidOperation = updates.every( key => allowedUpdates.includes(key) );

    if ( !isValidOperation ) {
        return res.status( 400 ).send({ error: 'Invalid update property' });
    };

    try {
        updates.forEach( key => req.user[key] = req.body[key] );
        await req.user.save();
        
        return req.user ? res.send( req.user ) : res.status( 404 ).send();
    }
    catch ( err ) {
        res.status( 500 ).send( err );
    }
});

// DELETE to remove user
router.delete('/users/me', auth, async ( req, res ) => {
    try {
        await req.user.remove();
        sendGoodbyeEmail( req.user.email, req.user.name )
        return res.send( req.user );
    }
    catch ( err ) {
        res.status( 500 ).send( err );
    }
});

// POST new login
router.post('/users/login', async ( req, res ) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials( email, password );

        const token = await user.generateAuthToken();

        res.send({ user, token })
    }
    catch ( err ) {
        res.status( 400 ).send();
    }
});

// POST logout
router.post('/users/logout', auth, async ( req, res ) => {
    try {
        req.user.tokens = req.user.tokens.filter( token => {
            return token.token !== req.token 
        });
        await req.user.save();
        res.send();
    }
    catch {
        res.staus( 500 ).send();
    }
});

// POST Logout all sessions
router.post('/users/logout-all', auth, async ( req, res ) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }
    catch {
        res.staus( 500 ).send();
    }
});

// POST to upload user profile imaage via multer
router.post('/users/me/avatar', auth, upload.single('avatar'), async ( req, res ) => {
    const buffer = await sharp(req.file.buffer)
        .png()
        .resize({
            width: 250,
            height: 250
        })
        .toBuffer();

    req.user.avatar = buffer;
    
    await req.user.save();
    res.send();
}, ( err, req, res, next ) => {
    res.status( 400 ).send({ error: err.message })
});

// DELETE existing user avatar
router.delete('/users/me/avatar', auth, async ( req, res ) => {
    try {
        
        req.user.avatar = null;
        await req.user.save();
        res.status(200).send();
    }
    catch {
        res.status(500).send();
    }
});

// GET user avatar
router.get('/users/:id/avatar', async ( req, res ) => {
    try {
        const user = await User.findById( req.params.id );
        
        if ( !user || !user.avatar ) {
            throw new Error()
        };

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch {
        res.status( 404 ).send();
    }
});


module.exports = router;
