const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user.js');
const Task = require('../../src/models/task.js');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: "User One",
    email: "userOne@example.com",
    password: "pass1234",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: "User Two",
    email: "userTwo@example.com",
    password: "pass1234",
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Unit test task instance for taskOne',
    completed: false,
    userId: userOneId
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Unit test task instance for taskTwo',
    completed: true,
    userId: userOneId
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Unit test task instance for taskThree',
    completed: true,
    userId: userTwoId
};

const setupDatabase = async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};

module.exports = {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}