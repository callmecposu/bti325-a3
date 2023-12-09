const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

require("dotenv").config();

let UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User;

module.exports.initialize = () =>
  new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);
    db.on("error", (err) => reject(err));
    db.once("open", () => {
      User = db.model("users", UserSchema);
      resolve();
    });
  });

module.exports.registerUser = (userData) =>
  new Promise(async (resolve, reject) => {
    // check if passwords match
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    }
    // try create the new user
    try {
      try {
        const hashedPswd = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPswd;
      } catch (err) {
        reject("There was an error encrypting the password");
      }
      const newUser = new User(userData);
      await newUser.save();
      resolve();
    } catch (err) {
      if (err.code == 11000) {
        reject("User Name already taken");
      } else {
        reject(`There was an error creating the user: ${err}`);
      }
    }
  });

module.exports.checkUser = (userData) =>
  new Promise(async (resolve, reject) => {
    // try find the user with given userName
    try {
      const users = await User.find({ userName: userData.userName });
      try {
        if (users.length == 0) {
          reject(`Unable to find user: ${userData.userName}`);
        }
        const pswdMatch = await bcrypt.compare(
          userData.password,
          users[0].password
        );
        if (!pswdMatch) {
          reject(`Incorrent Password for user: ${userData.userName}`);
        }
        if (users[0].loginHistory.length == 8) {
          users[0].loginHistory.pop();
        }
        users[0].loginHistory.unshift({
          dateTime: new Date().toString(),
          userAgent: userData.userAgent,
        });
        await User.updateOne(
          { userName: users[0].userName },
          {
            $set: { loginHistory: users[0].loginHistory },
          }
        );
        resolve(users[0]);
      } catch (err) {
        reject(`There was an error verifying the user: ${err}`);
      }
    } catch (err) {
      reject(`Unable to find the user: ${userData.userName}`);
    }
  });
