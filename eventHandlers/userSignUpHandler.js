const User = require("../database/models/userModel");
const getProfilePic = require("../utils/getProfilePic");
const { verifySignUp } = require("../utils/email/emailSender");

const generateJWT = require("../utils/jwt/generateJWT");

async function userSignUpHandler(body, req) {
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
    // Read default or user image
    const image = await getProfilePic(user);

    // Save user to database
    const savedUser = await user.save();
    console.log("saved user", savedUser);

    // Create the token to be sent to the user
    const verifierToken = await user.createResetPasswordToken("verifyMe");

    // Send email for verification
    try {
      await verifySignUp({
        userEmail: savedUser.emailAddress,
        userName: savedUser.userName,
        subject: `User Verification`,
        url: `${req.headers.origin + "/verifyme/" + verifierToken}`,
        contact: `${req.headers.origin + "/contact/"}`,
      });

      return {
        status: 200,
        message:
          "Verification email sent successfully. Please check your email",
      };
    } catch (error) {
      // Delete user from database if an error occured with sending the email
      await User.findOneAndDelete({ _id: savedUser._id });
      const err = {
        status: 500,
        message: `Error occurred while signing up. Please try again. ${error}`,
      };
      throw err;
    }
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
