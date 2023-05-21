const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../database/models/userModel");
const fs = require("fs");

async function userAuthenticationHandler(body) {
  // Check if the username is in the database
  try {
    // Variables
    const user = await User.find({ userName: body["login-username"] }).exec();
    const privateKey = fs.readFileSync("private.key");
    const publicKey = fs.readFileSync("public.key");
    const err = {
      status: 400,
      message: "User could not be found",
    };

    // If no user is found in the database
    if (user.length === 0) {
      console.log("user.length", user.length);
      throw err;
    } else {
      // Validate the password
      const hashedPass = user[0].password;
      const userPass = body["login-password"];
      const match = await bcrypt.compare(userPass, hashedPass);

      if (match) {
        // Generate JWT
        const token = jwt.sign({ id: user[0]._id }, privateKey, {
          algorithm: "RS256",
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
        if (token) {
          return { jwtoken: token, userName: user[0].userName };
        } else {
          const err = {
            status: 500,
            message: "Error Generating JWT",
          };
          throw err;
        }
      } else {
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
