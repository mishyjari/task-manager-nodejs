const express = require('express');
const router = new express.Router();
const Task = require('../models/task.js');
const auth = require('../middleware/auth.js');

// GET All Tasks
router.get('/tasks', auth, async ( req, res ) => {
    const match = {};
    const sort = {};

    if ( req.query.completed ) {
        match.completed = req.query.completed === 'true' ? true : false
    };

    if ( req.query.sort ) {
        const query = req.query.sort.split('_');
        sort[query[0]] = query[1] === 'asc' ? 1 : -1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match, 
            options: {
                limit: parseInt(req.query.limit) || 10,
                skip: parseInt(req.query.skip) || 0,
                sort
            }
        }).execPopulate();
        res.send( req.user.tasks );
    }
    catch ( err ) {
        res.status( 500 ).send( err );
    }
});

// GET Task By Id
router.get('/tasks/:id', auth, async ( req, res ) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
        return task ? res.send( task ) : res.status( 404 ).send();
    }
    catch ( err ) {
        res.status( 500 ).send( err );
    }
});

// Update Task
router.patch('/tasks/:id', auth, async ( req, res ) => {
    const updateKeys = Object.keys( req.body );
    const validUpdateKeys = [ 'description', 'completed' ];
    const isValidUpdate = updateKeys.every( key => validUpdateKeys.includes( key) );

    if ( !isValidUpdate ) {
        return res.status( 400 ).send({ error: 'Invalid update properties' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
        updateKeys.forEach( key => task[key] = req.body[key] );

        await task.save();

        return task ? res.send( task ) : res.status( 404 ).send();
    }
    catch  ( err ) {
        res.status( 500 ).send( err )
    }
});

// POST New Task
router.post('/tasks', auth, async ( req, res ) => {
    const task = new Task({
        ...req.body,
        userId: req.user._id
    });

    try {
        await task.save();
        res.status( 201 ).send( task );
    }
    catch ( err ) {
        res.status( 500 ).send( err );
    }
});

// DELETE Task
router.delete('/tasks/:id', auth, async ( req, res ) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        return task ? res.send( task ) : res.status( 404 ).send();
    }
    catch ( err ) {
        res.status( 500 ).send( err )
    }
});

module.exports = router;