const fs = require("fs");
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

    // To send the default profile pic
    // Get the default profile pic path
    // const imagePath = path.join(
    //   __dirname,
    //   "resources/images/users/default.jpeg"
    // );
    // // Create a readable stream
    // const fileStream = fs.createReadStream(imagePath);

    return {
      jwtoken: token,
      userName: savedUser.userName,
      status: 200,
      imgURL: `http://localhost:3001/resources/images/users/default.jpeg`,
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
