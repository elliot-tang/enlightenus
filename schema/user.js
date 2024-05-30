const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
module.exports = User;

module.exports = User;

// Test Case
// run().catch(err => console.log(err));

// async function run() {
//   await mongoose.connect('mongodb+srv://elliottang379:K09aaUaomW38T3SW@m0cluster.i2lyqzv.mongodb.net/enlightenus?retryWrites=true&w=majority&appName=M0Cluster');

//   const user = new User({
//     email: 'e1156752@u.nus.edu',
//     username: 'elliot-tangy',
//     password: 'password2',
//   });

//   try {
//     await user.save();
//   } catch (error) {
//     console.error(error);
//   }
//   await user.save();

//   console.log(user.email); 
// }

