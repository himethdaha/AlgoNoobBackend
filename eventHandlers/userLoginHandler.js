const bcrypt = require("bcrypt");
const User = require("../database/models/userModel");
const generateJWT = require("../utils/generateJWT");

async function userAuthenticationHandler(body) {
  // Check if the username is in the database
  try {
    // Variables
    const user = await User.find({ userName: body["login-username"] }).exec();
    const err = {
      status: 400,
      message: "Incorrect username or password",
    };
    // Throw error for not being able to save the user to the database
    const resetPasswordRetryCountSaveError = {
      status: 500,
      message: "Unable to save the user",
    };

    // If no user is found in the database
    if (user.length === 0) {
      throw err;
    } else {
      // Variables
      // Get the user passwordRetryCount
      let userPasswordRetryCount = user[0].passwordRetryCount;
      // Get the max user passwordRetryCount
      let maxUserPasswordRetryCount = user[0].maxPasswordRetryCount;
      // Get the time remaining for the user to retry the password
      const timeRemaining = Math.floor(
        (user[0].passwordRetryCountExpiration - Date.now()) / (1000 * 60)
      );

      // Check if max passwordRetryCount is reached
      if (maxUserPasswordRetryCount === 6) {
        const usermaxPasswordRetryCountReached = {
          status: 403,
          message: "User login attempt exceeded maximum",
          userName: user[0].userName,
        };
        throw usermaxPasswordRetryCountReached;
      }
      // First check for the userPasswordRetryCount and the time limit expiration
      if (userPasswordRetryCount === 3 && timeRemaining > 0) {
        const passwordRetryErr = {
          status: 429,
          message: `Please try again in ${timeRemaining} minutes`,
        };
        throw passwordRetryErr;
      }
      // Validate the password
      const hashedPass = user[0].password;
      const userPass = body["login-password"];
      const match = await bcrypt.compare(userPass, hashedPass);

      // If the password matches the username
      if (match) {
        // Reset the passwordRetryCount if it's greater than zero
        if (userPasswordRetryCount > 0) {
          userPasswordRetryCount = 0;
          // Save the passwordRetryCount in to the database
          const resetPasswordRetryCount = await user[0].save(
            (user[0].passwordRetryCount = userPasswordRetryCount)
          );
          if (!resetPasswordRetryCount) {
            throw resetPasswordRetryCountSaveError;
          }
        }

        // Generate JWT
        try {
          const token = await new Promise((resolve, reject) => {
            generateJWT(user[0]._id, function (error, token) {
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
          return {
            jwtoken: token,
            userName: user[0].userName,
            status: 200,
          };
        } catch (error) {
          const err = {
            status: 500,
            message: `Error Generating JWT. ${error}`,
          };
          throw err;
        }
      }
      // If password does not match the username
      else {
        // If the user password expiration time has passed and userPasswordRetryCount is at 3
        if (userPasswordRetryCount === 3 && timeRemaining <= 0) {
          userPasswordRetryCount = 0;
        }
        // Increase passwordRetryCount by 1
        userPasswordRetryCount += 1;
        // Increase maxUserPasswordRetryCount
        maxUserPasswordRetryCount += 1;

        // If the passwordRetryCount happens for the first time, specify the time it happend
        if (userPasswordRetryCount === 1) {
          user[0].passwordRetryCountExpiration = Date.now() + 1000 * 60 * 10;
        }
        user[0].passwordRetryCount = userPasswordRetryCount;
        user[0].maxPasswordRetryCount = maxUserPasswordRetryCount;

        const savePasswordRetryCount = await user[0].save();
        if (!savePasswordRetryCount) {
          throw resetPasswordRetryCountSaveError;
        }
        // Throw the error for invalid password
        throw err;
      }
    }
  } catch (error) {
    if (error) {
      throw error;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

module.exports = userAuthenticationHandler;
