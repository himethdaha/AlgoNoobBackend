const User = require("../database/models/userModel");
const generateJWT = require("../utils/generateJWT");

async function userSignUpHandler(body) {
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
    };
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
