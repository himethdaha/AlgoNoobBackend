const User = require("../database/models/userModel");

async function userForgotPassword(body) {
  // Variables
  const err = {
    status: 400,
    message: "Incorrect Email Address",
  };
  // Find the user via email provided
  const user = await User.findOne({ emailAddress: body["passwordResetEmail"] });
  console.log(user);
  if (!user) {
    throw err;
  } else {
    const resetToken = await user.createResetPasswordToken();
    console.log("resetToken", resetToken);
    await user.save();

    return { resetToken: resetToken, status: 200 };
  }
}
module.exports = userForgotPassword;
