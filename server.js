const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./routes/auth");

const app = express();
require('dotenv').config()

// allows http requests from frontend
// const corsOptions = {
//   origin: process.env.FRONTEND_API,
//   methods: 'GET,HEAD,POST,PUT,DELETE',
//   credentials: true,
// };
// app.use(cors(corsOptions));
app.use(cors());

// defines routes for auth
app.use(express.json());
app.use('/', router);
app.use('/register', router);
app.use('/login', router);

// starts server and connects to database
if (process.env.MONGO_URL) {
  mongoose.connect(process.env.MONGO_URL)
  .then(() => {console.log('Database connected');})
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });
} else {
  console.log('Invalid connection string');
}

