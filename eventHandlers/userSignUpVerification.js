const User = require("../database/models/userModel");
const getProfilePic = require("../utils/getProfilePic");
const generateJWT = require("../utils/jwt/generateJWT");
const crypto = require("crypto");

async function userSignUpVerification(body) {
  try {
    // Get the token
    const token = body.token;

    // Check if the token exists
    if (!token) {
    } else {
      // If token exists, encrypt it
      const encryptedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Get user based on token
      const user = await User.findOne({
        verifierToken: encryptedToken,
      });

      // If no user, send error message
      if (!user) {
        throw (err = {
          status: 404,
          message: "No user found to be verified. Please try again",
        });
      }
      // If token expired, send error message saying sign up again
      else if (user.verifiedExpiry <= new Date()) {
        throw (err = {
          status: 400,
          message: "Link expired. Please sign up again",
        });
      }
      // If all is good, remove the token/expiry an verified flag
      else {
        try {
          // Generate JWT
          const { token, cookie } = await new Promise((resolve, reject) => {
            // TODO: Remove the [0]
            generateJWT(user._id, function (error, { token, cookie }) {
              if (error) {
                const err = {
                  status: 500,
                  message: `Error Generating JWT. ${error}`,
                };
                return reject(err);
              } else if (token) {
                resolve({ token, cookie });
              } else {
                const err = {
                  status: 500,
                  message: `No token available`,
                };
                return reject(err);
              }
            });
          });
          user.verified = true;
          user.verifiedExpiry = undefined;
          user.verifierToken = undefined;

          // Read default user image
          const image = await getProfilePic(user);

          await user.save();

          return {
            status: 200,
            message: "User verified successfully",
            userName: user.userName,
            image: image,
            jwtoken: token,
            cookieOptions: cookie,
          };
        } catch (error) {
          throw (err = {
            status: 500,
            message: error,
          });
        }
      }
    }
  } catch (error) {
    if (error.status) {
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

module.exports = userSignUpVerification;
