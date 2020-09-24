const request = require('supertest');
const Task = require('../src/models/task.js');
const app = require('../src/app.js');
const { userOne, userTwo, taskOne, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase)

test('Should create a new task for user', async () => {
    const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Run some unit tests!'
        })
        .expect(201)
    
    const task = await Task.findById(res.body._id)
    expect(task).toBeTruthy();
    expect(task.description).toBe(task.description);
    expect(task.completed).toBe(false);
});

test('Should return all tasks for user one', async () => {
    const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(res.body.length).toBe(2);
});

test('Should not allow user to delete another users task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id);
    expect(task).toBeTruthy();
});