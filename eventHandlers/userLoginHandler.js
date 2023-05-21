const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../database/models/userModel");

async function userAuthenticationHandler(body) {
  // Check if the username is in the database
  try {
    const user = await User.find({ userName: body["login-username"] }).exec();
    console.log(user);
    console.log(body["login-password"]);
    const hashedPass = user[0].password;
    const userPass = body["login-password"];
    if (user.length === 0) {
      console.log("user.length", user.length);

      const err = {
        status: 404,
        message: "User could not be found",
      };
      throw err;
    } else {
      // Validate the password
      const match = await bcrypt.compare(userPass, hashedPass);
      console.log(match);
      if (match) {
        return "Logged in";
      } else {
        const err = {
          status: 400,
          message: "Username or password is incorrect",
        };

        throw err;
      }
    }
  } catch (error) {
    console.log("error");
    console.log(error);
    if (error) {
      throw error;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

module.exports = userAuthenticationHandler;
