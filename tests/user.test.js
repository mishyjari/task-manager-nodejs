const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/models/user.js');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase)

test('Should sign up a new user', async () => {
    const res = await request(app)
        .post('/users')
        .send({
            "name": "Mishy Jari",
            "email": "mishy@example.com",
            "password": "pass1234"
        })
        .expect(201)
    
    // Assert that the database was changed correctly
    const user = await User.findById(res.body.user._id);
    expect(user).toBeTruthy();

    // Assertions about the response
    expect(res.body).toMatchObject({
        user: {
            name: "Mishy Jari",
            email: "mishy@example.com"
        },
        token: user.tokens[0].token
    })

    // Make sure plain text password is not stored in db
    expect(user.password).not.toBe('pass1234')
});

test('Should log in existing user', async () => {
    const res = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    const user = await User.findById(userOne._id)
    expect(user).toBeTruthy();

    // Ensure new login token is saved
    expect(res.body.token).toBe(user.tokens[1].token)
});

test('Should not log in user with bad password', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: 'INCORRECT'
        })
        .expect(400)
});

test('Should not log in non-existent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'somebody@somewhere.com',
            password: 'password'
        })
        .expect(400)
});

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
});

test('Should not get profile for unathenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
});

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOne._id);
    expect(user).toBeFalsy();
});

test('Should not delete account for unathenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
});

test('Should upload image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/philly.jpg')
        .expect(200)
    
    const user = await User.findById(userOneId);
    expect(user).toBeTruthy();
    expect(user.avatar).toEqual(expect.any(Buffer))
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'One User'
        })
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user).toBeTruthy();
    expect(user.name).toBe('One User')
});

test('Should not update invalid field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Nowhere, really."
        })
        .expect(400)
});