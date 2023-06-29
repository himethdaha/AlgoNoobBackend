const User = require("../database/models/userModel");

async function userSignUpVerification(body) {
  try {
    // Get the token
    const token = body.token;

    // Check if the token exists
    if (!token) {
      throw (err = {
        status: 400,
        message: "Verification token can not be found. Please try again",
      });
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
      if (user.verifiedExpiry <= new Date()) {
        throw (err = {
          status: 400,
          message: "Link expired. Please sign up again",
        });
      }
      // If all is good, remove the token/expiry an verified flag
    }
  } catch (error) {}
}
