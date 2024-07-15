const express = require('express');
const request = require('supertest');
const authRouter = require('../../routes/auth');
const User = require('../../schema/user');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json()); 
app.use('/', authRouter);
app.use('/auth', authRouter);

// describe('GET /', () => {
//   it('should return 200 OK with "Hello, world!"', async () => {
//     const response = await request(app).get('/');
//     expect(response.text).toBe('Hello World!');
//   });
// });

describe('Create user', () => {
  it('Should return 201 with token and username', async () => {
    const userData = {
      email: 'jest@gmail.com',
      username: 'jest',
      password: 'password1'
    };
    const response = await request(app).post('/auth/register').send(userData);

    // Checks for correct response information
    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('token');
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    expect(response.body.token).toMatch(jwtPattern);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toEqual(userData.username);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('User registered successfully');

    // Checks if user data is stored correctly in database
    const user = await User.findOne({ username: userData.username });
    expect(user).not.toBeNull();
    expect(user.email).toEqual(userData.email);
    expect(user.username).toEqual(userData.username);

    const isMatch = await bcrypt.compare(userData.password, user.password);
    expect(isMatch).toBe(true);
  });

  it('Should return 400 if email is missing', async () => {
    const userData = {
      username: 'jest2',
      password: 'password1'
    };
    const response = await request(app).post('/auth/register').send(userData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 400 if username is missing', async () => {
    const userData = {
      email: 'jest2@gmail.com',
      password: 'password1'
    };
    const response = await request(app).post('/auth/register').send(userData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 400 if password is missing', async () => {
    const userData = {
      email: 'jest3@gmail.com',
      username: 'jest3',
    };
    const response = await request(app).post('/auth/register').send(userData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 400 if everything is missing', async () => {
    const userData = {}
    const response = await request(app).post('/auth/register').send(userData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 400 if no request body is sent', async () => {
    const response = await request(app).post('/auth/register');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 409 Conflict if email conflicts with existing user', async () => {
    const userData = {
      email: 'jest@gmail.com',
      username: 'jest2',
      password: 'password1'
    };
    const response = await request(app).post('/auth/register').send(userData);
    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Email already registered');
  });

  it('Should return 409 Conflict if username conflicts with existing user', async () => {
    const userData = {
      email: 'jest2@gmail.com',
      username: 'jest',
      password: 'password1'
    };
    const response = await request(app).post('/auth/register').send(userData);
    expect(response.status).toBe(409);
    expect(response.body.message).toBe('User already registered');
  });
});

describe('Login user', () => {
  it('Should return 200 with token and username', async () => {
    const userData = {
      username: 'jest',
      password: 'password1'
    }
    const response = await request(app).post('/auth/login').send(userData);
    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('token');
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    expect(response.body.token).toMatch(jwtPattern);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toEqual(userData.username);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('User logged in successfully');
  });

  it('Should return 400 if username is missing', async () => {
    const userData = {
      password: 'password1'
    }
    const response = await request(app).post('/auth/login').send(userData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 400 if password is missing', async () => {
    const userData = {
      username: 'jest'
    }
    const response = await request(app).post('/auth/login').send(userData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 400 if everything is missing', async () => {
    const userData = {}
    const response = await request(app).post('/auth/login').send(userData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 400 if no request body is sent', async () => {
    const response = await request(app).post('/auth/login');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields required');
  });

  it('Should return 404 if username is not found', async () => {
    const userData = {
      username: 'jest2',
      password: 'password1'
    }
    const response = await request(app).post('/auth/login').send(userData);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('Should return 401 if password does not match', async () => {
    const userData = {
      username: 'jest',
      password: 'password2'
    }
    const response = await request(app).post('/auth/login').send(userData);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Wrong password');
  });
});