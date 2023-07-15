// Imported modules
const fs = require("fs");
const sharp = require("sharp");

const User = require("../database/models/userModel");
const { createObject } = require("../Cloud/s3Ops");
const { verifySignUp } = require("../utils/email/emailSender");

async function userSignUpHandler(body, req) {
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

    // Create the token to be sent to the user
    const verifierToken = await user.createResetPasswordToken("verifyMe");

    try {
      // Stpes in saving default img to S3
      // 1 - Get the image and convert to buffer
      const fileBuffer = fs.readFileSync(
        "C:\\Users\\himet\\OneDrive\\Documents\\React\\my-first-nodejs-backend\\resources\\images\\users"
      );
      // 2 - Resize it
      const imageBuffer = sharp(fileBuffer)
        .resize(110, 110)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toBuffer();
      // 3 - Add image buffer to S3 params
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${process.env.KEY}/${savedUser.profilepic}`,
        Body: imageBuffer,
      };

      // Call method to create object in S3
      createObject(params)
        .then((response) => {
          console.log(
            "🚀 ~ file: userSignUpHandler.js:43 ~ userSignUpHandler ~ response:",
            response
          );
        })

        .catch((err) => {
          console.log(
            "🚀 ~ file: userSignUpHandler.js:48 ~ userSignUpHandler ~ err:",
            err
          );
          const error = `Error while uploading default image to S3. ${err}`;
          throw error;
        });

      // Send email for verification
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
    } else if (error.status) {
      throw (err = {
        status: error.status,
        message: error.message,
      });
    } else {
      throw (err = {
        status: 500,
        message: `Couldn't verify user due to backend failure: ${error}`,
      });
    }
  }
}
module.exports = userSignUpHandler;
