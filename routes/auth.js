const express = require('express');
const User = require('../schema/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
require('dotenv').config()

// registration
router.post('/register', async (req, res) => {
  try {
    const { email, username, password} = req.body;
    console.log(`Attempting registration: username: ${username}`);

    // check all fields filled in
    if (!email || !username || !password) {
      console.log('Failed login: incomplete fields');
      return res.status(400).json({ message: 'All fields required' });
    }

    // email already taken by other user
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log(`${ username } failed registration: Email already registered`);
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    // user already exists in db
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`${ username } failed registration: User already registered`);
      return res.status(409).json({ message: 'User already registered' });
    }
    
    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create and save new user into db
    const user = new User({ email, username, password: hashedPassword });
    await user.save();
    console.log(`${ username } registered successfully`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(`Failed registration: ${error.message}`);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Attempting login: username: ${username}`);

    // check all fields filled in
    if (!username || !password) {
      console.log('Failed login: incomplete fields');
      return res.status(400).json({ message: 'All fields required' });
    }

    const user = await User.findOne({ username });

    // user doesn't exist in db
    if (!user) {
      console.log(`${ username } failed login: User not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    // wrong password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log(`${ username } failed login: Wrong password`);
      return res.status(401).json({ message: 'Wrong password' });
    }

    // generate and return jwt
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '7' });
    res.status(200).json({ token: token, user: username});
    console.log(`${ username } logged in successfully`);
  } catch (error) {
    console.log(`Failed login: ${error.message}`);
    res.status(500).json({ message: 'Error logging in user', error });
  }
});

router.get('/', (req, res) => {
  res.send('Hello World!')
});

router.get('/register', (req, res) => {
  res.send('Hello Register!')
});

router.get('/login', (req, res) => {
  res.send('Hello Login!')
});

module.exports = router;