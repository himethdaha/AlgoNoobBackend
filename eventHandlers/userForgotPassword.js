const User = require("../database/models/userModel");
const { resetPasswordEmail } = require("../utils/email/emailSender");

async function userForgotPassword(body, req) {
  // Variables
  const err = {
    status: 400,
    message: "Incorrect Email Address",
  };
  // Find the user via email provided
  const user = await User.findOne({ emailAddress: body.passwordResetEmail });
  if (!user) {
    throw err;
  } else {
    // Create the token to be sent to the user
    const resetToken = await user.createResetPasswordToken("resetPassword");
    await user.save();

    try {
      await resetPasswordEmail({
        userEmail: user.emailAddress,
        subject: `Reset Password Token`,
        text: `Please use this link (${
          req.headers.origin + "/reset_password/" + resetToken
        }) to reset your password. Link will expire in 10 minutes. If this was not requested by you, please call "1-888-888888" or contact us via the contact form`,
      });
      return { status: 200, message: "Email sent successfully" };
    } catch (error) {
      // Remove the resetToken and resetToken expiration from the database in case of an error
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpirationTime = undefined;
      await user.save();

      const err = {
        status: 500,
        message: `Error occurred while sending email. ${error}`,
      };
      throw err;
    }
  }
}
module.exports = userForgotPassword;
