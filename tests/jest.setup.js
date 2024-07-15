const mongoose = require('mongoose');

const connectToTestDB = async () => {
  await mongoose.connect(process.env.MONGO_URL_TEST);
};

const disconnectFromTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

beforeAll(async () => {
  await connectToTestDB();
});

afterAll(async () => {
  await disconnectFromTestDB();
});

module.exports = {
  connectToTestDB,
  disconnectFromTestDB,
};