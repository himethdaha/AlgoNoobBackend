const User = require("../database/models/userModel");

async function userForgotPassword(body) {
  // Variables
  const err = {
    status: 400,
    message: "Incorrect Email Address",
  };
  // Find the user via email provided
  const userFound = await User.findOne({ email: body["passwordResetEmail"] });
  console.log(userFound);
  if (!userFound) {
    throw err;
  } else {
  }
}
module.exports = userForgotPassword;
