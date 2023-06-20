const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const jwt = require("jsonwebtoken");
const publicKeyPath = "public.key";

const validateJWT = async (req, callback) => {
  try {
    // Read the public key
    const publicKey = await readFileAsync(publicKeyPath);

    // Also check if we have cookies in header
    if (req.headers.cookie) {
      // Get the jwt cookie
      const jwtValue = req.headers.cookie.split(";").map((cookie) => {
        // Split the cookie into name and value pairs
        const [name, value] = cookie.trim().split("=");

        // Check if the name matches with the 'jwt' cookie name
        if (name === "jwt") {
          return value;
        }
      });
      const jwtCookie = jwtValue[1];

      // If no jwt cookie sent
      if (!jwtCookie) {
        console.log("NO JWT cookie sent");
        const error = {
          status: 401,
          message: `Please login/signup to access`,
        };
        throw error;
      }

      try {
        // Verify the token
        jwt.verify(jwtCookie.toString(), publicKey, function (err, decoded) {
          if (err) {
            if (err.name === "TokenExpiredError") {
              const error = {
                status: 401,
                message: `Please login/signup to access. Session has expired`,
              };
              return callback(error);
            } else if (err.name === "JsonWebTokenError") {
              const error = {
                status: 401,
                message: `Please login/signup to access`,
              };
              return callback(error);
            }
          } else {
            return callback(null, true);
          }
        });
      } catch (error) {
        console.log("jwt error: " + error);
        throw error;
      }
    } else {
      const err = {
        status: 401,
        message: `Not logged in. Please log in to access the page`,
      };
      throw err;
    }
  } catch (error) {
    const err = {
      status: error.status || 500,
      message: error.message || `Error Validating JWT. ${error}`,
    };
    throw err;
  }
};

module.exports = validateJWT;
