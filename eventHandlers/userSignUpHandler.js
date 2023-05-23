const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const User = require("../database/models/userModel");

async function userSignUpHandler(body) {
  // Variables
  const privateKey = fs.readFileSync("private.key");

  // Create user object
  const user = new User({
    emailAddress: body.email,
    userName: body.username,
    password: body.password,
    passwordConfirm: body.passwordConfirm,
  });

  try {
    // Save user to database
    const savedUser = await user.save();

    // Generate JWT
    const token = jwt.sign({ id: savedUser._id }, privateKey, {
      algorithm: "RS256",
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    if (token) {
      return { jwtoken: token, userName: savedUser.userName, status: 200 };
    } else {
      const err = {
        status: 500,
        message: "Error Generating JWT",
      };
      throw err;
    }
  } catch (error) {
    // If a user already exists with the signing in users username or email
    if (
      error.code === 11000 &&
      (error.keyPattern.username === 1 || error.keyPattern.emailAddress === 1)
    ) {
      const err = {
        status: 400,
        message: "User already exists. Please try again.",
      };
      throw err;
    } else {
      throw error;
    }
  }
}
module.exports = userSignUpHandler;
