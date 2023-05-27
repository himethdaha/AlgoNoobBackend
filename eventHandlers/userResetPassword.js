const crypto = require("crypto");
const User = require("../database/models/userModel");

async function userResetPassword(body) {
  try {
    // Get the token
    const token = body.token;

    console.log("token", token);
    // If token is undefined
    if (!token) {
      throw (err = {
        status: 400,
        message: "Token can not be found in the request.",
      });
    }
    // Found token in the url
    else {
      // Encrypt the reset token
      const encryptedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      console.log("encryptToken", encryptedToken);
      // Compare the reset token with the encrypted tokens in the database
      const user = await User.findOne({
        passwordResetToken: encryptedToken,
      });
      console.log("user", user);
      // If a user is found for the token
      if (user) {
        // If they do match, check if the time has expired. If so return error
        if (user.passwordResetTokenExpirationTime < Date.now()) {
          throw (err = {
            status: 400,
            message: `Password reset token has expired. Please request a new token`,
          });
        } else {
          // Update user password
          user.password = body.newPassword;
          user.passwordConfirm = body.newPasswordConfirmation;
          // Remove the below fields
          user.passwordResetToken = undefined;
          user.passwordResetTokenExpirationTime = undefined;
          await user.save();
          return { status: 200, message: "Password Updated" };
        }
      }
      // If no user with the token
      else {
        throw (err = {
          status: 404,
          message: "No user for the token. Please request for a new token",
        });
      }
    }
  } catch (error) {
    console.log("err", error);
    if (error.status) {
      throw (err = {
        status: error.status,
        message: error.message,
      });
    } else {
      throw (err = {
        status: 500,
        message: `Couldn't update password due to backend failure: ${error}`,
      });
    }
  }
}
module.exports = userResetPassword;
