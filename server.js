const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const AuthRouter = require("./routes/auth");
const QuizRouter = require("./routes/quiz");

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
app.use('/', AuthRouter);
app.use('/', QuizRouter);
app.use('/auth', AuthRouter);
app.use('/quiz', QuizRouter);

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

