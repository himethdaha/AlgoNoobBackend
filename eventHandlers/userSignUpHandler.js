const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const User = require("../database/models/userModel");
const generateJWT = require("../utils/generateJWT");

async function userSignUpHandler(body) {
  // Variables
  let image;
  // Create user object
  const user = new User({
    emailAddress: body.email,
    userName: body.username,
    password: body.password,
    passwordConfirm: body.passwordConfirm,
  });

  try {
    // Read default image
    try {
      // Create a buffer
      image = await readFileAsync(
        "C:\\Users\\himet\\OneDrive\\Documents\\React\\my-first-nodejs-backend\\resources\\images\\users\\default.jpeg"
      );
    } catch (error) {
      const err = {
        status: 500,
        message: `Can't read image: ${error}`,
      };

      throw err;
    }
    // Save user to database
    const savedUser = await user.save();
    console.log("saved user", savedUser);

    // Generate JWT
    const token = await new Promise((resolve, reject) => {
      generateJWT(savedUser._id, function (error, token) {
        if (error) {
          const err = {
            status: 500,
            message: `Error Generating JWT. ${error}`,
          };
          return reject(err);
        } else if (token) {
          resolve(token);
        } else {
          const err = {
            status: 500,
            message: `No token available`,
          };
          return reject(err);
        }
      });
    });

    return {
      jwtoken: token,
      userName: savedUser.userName,
      status: 200,
      image: image,
    };
  } catch (error) {
    // If a user already exists with the signing in users username or email
    if (
      error.code === 11000 &&
      (error.keyPattern.userName === 1 || error.keyPattern.emailAddress === 1)
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
