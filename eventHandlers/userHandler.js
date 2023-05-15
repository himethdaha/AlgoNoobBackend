const User = require("../database/models/userModel");

async function userSaveHandler(body) {
  const user = new User({
    emailAddress: body.email,
    userName: body.username,
    password: body.password,
    passwordConfirm: body.passwordConfirm,
  });

  try {
    const savedUser = await user.save();
    console.log("user saved", savedUser);
    return savedUser;
  } catch (error) {
    console.log("error saving user", error);
    throw error;
  }
}

module.exports = userSaveHandler;
