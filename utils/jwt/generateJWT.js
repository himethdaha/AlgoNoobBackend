const fs = require("fs");
const jwt = require("jsonwebtoken");
const privateKeyPath = "private.key";

const generateJWT = (userId, callback) => {
  try {
    // Read the private key
    fs.readFile(privateKeyPath, function (err, privateKey) {
      if (err) {
        const error = {
          status: 500,
          message: `Error reading secret key for JWT. ${err}`,
        };
        return callback(error);
      } else {
        // Generate token
        jwt.sign(
          { id: userId },
          privateKey,
          {
            algorithm: "RS256",
            expiresIn: process.env.JWT_EXPIRES_IN,
          },
          function (err, token) {
            if (err) {
              const error = {
                status: 500,
                message: `Error generating JWT. ${err}`,
              };
              return callback(error);
            } else {
              const cookie = {
                expires: new Date(
                  Date.now() + process.env.COOKIE_EXP * 60 * 1000
                ),
                secure: false,
                httpOnly: true,
              };
              return callback(null, { token, cookie });
            }
          }
        );
      }
    });
  } catch (error) {
    throw (err = {
      status: 500,
      message: `Error Generating JWT. ${error}`,
    });
  }
};

module.exports = generateJWT;
