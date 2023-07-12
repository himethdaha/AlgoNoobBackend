const fs = require("fs");
const bodyParser = require("body-parser");
const formidable = require("formidable");
const urlParser = require("url");
const validateJWT = require("../utils/jwt/validateJWT");
const createCookie = require("../utils/jwt/createCookie");
const User = require("../database/models/userModel");
const userAuthenticationHandler = require("../eventHandlers/userLoginHandler");
const userSignUpHandler = require("../eventHandlers/userSignUpHandler");
const userForgotPassword = require("../eventHandlers/userForgotPassword");
const userResetPassword = require("../eventHandlers/userResetPassword");
const userUpdate = require("../eventHandlers/userUpdate");
const userDelete = require("../eventHandlers/userDelete");
const userSignUpVerification = require("../eventHandlers/userSignUpVerification");

const routes = {
  "/": function (req, res) {
    if (req.method == "POST") {
      // Variables
      let body;
      let userSaved = {};

      // get the body from request
      bodyParser.json()(req, res, () => {
        body = req.body;
        // Call signup event handler
        userSignUpHandler(body, req)
          .then((response) => {
            res.status = 200;
            res.end(JSON.stringify(response));
          })
          .catch((error) => {
            res.status = error.status;
            res.end(JSON.stringify(error));
          });
      });
    }
  },
  "/login": function (req, res) {
    if (req.method === "POST") {
      let body;
      //Parse user request
      bodyParser.json()(req, res, () => {
        body = req.body;

        // Call login event handler
        userAuthenticationHandler(body)
          .then((response) => {
            res.status = 200;
            const { expires, secure, httpOnly } = response.cookieOptions;

            const options = {
              jwt: response.jwtoken,
              Expires: expires,
              Secure: secure,
              HttpOnly: httpOnly,
            };

            // Concatnate cookie options
            const cookieOptions = createCookie(options);

            // Set cookie in response header
            res.setHeader("Set-Cookie", cookieOptions);
            res.end(
              JSON.stringify({
                userName: response.userName,
                status: response.status,
                token: response.jwtoken,
                image: response.image,
              })
            );
          })
          .catch((err) => {
            res.status = err.status;
            res.end(JSON.stringify(err));
          });
      });
    }
  },
  "/logout": function (req, res) {
    if (req.method === "POST") {
      // Set a cookie to expire
      res.setHeader(
        "Set-Cookie",
        `jwt=; Max-Age=1; Secure=false; HttpOnly=true`
      );
      res.status = 200;
      res.end(JSON.stringify({ message: "Logged out" }));
    }
  },
  "/verifyme": function (req, res) {
    if (req.method === "POST") {
      let body;

      bodyParser.json()(req, res, () => {
        body = req.body;
        userSignUpVerification(body)
          .then((response) => {
            res.status = 200;
            const { expires, secure, httpOnly } = response.cookieOptions;

            const options = {
              jwt: response.jwtoken,
              Expires: expires,
              Secure: secure,
              HttpOnly: httpOnly,
            };

            // Concatnate cookie options
            const cookieOptions = createCookie(options);

            // Set cookie in response header
            res.setHeader("Set-Cookie", cookieOptions);
            res.end(JSON.stringify(response));
          })
          .catch((err) => {
            res.status = err.status;
            res.end(JSON.stringify(err));
          });
      });
    }
  },
  "/forgot_password": function (req, res) {
    if (req.method === "POST") {
      let body;

      bodyParser.json()(req, res, () => {
        body = req.body;
        // Call the forgot password event handler
        userForgotPassword(body, req)
          .then((response) => {
            res.status = 200;
            res.end(JSON.stringify(response));
          })
          .catch((err) => {
            res.status = err.status;
            res.end(JSON.stringify(err));
          });
      });
    }
  },
  "/reset_password": function (req, res) {
    if (req.method === "PATCH") {
      let body;
      bodyParser.json()(req, res, () => {
        body = req.body;

        userResetPassword(body)
          .then((response) => {
            res.status = 200;
            res.end(JSON.stringify(response));
          })
          .catch((err) => {
            res.status = err.status;
            res.end(JSON.stringify(err));
          });
      });
    }
  },
  "/my_Account/update": async function (req, res) {
    if (req.method === "PATCH") {
      try {
        // First check if user authenticated
        await validateJWT(req, function (err, response) {
          if (err) {
            res.status = err.status;
            res.end(JSON.stringify(err));
          } else {
            return response;
          }
        });

        userUpdate(req)
          .then((response) => {
            res.status = 200;
            res.end(JSON.stringify(response));
          })
          .catch((err) => {
            res.status = err.status;
            res.end(JSON.stringify(err));
          });
      } catch (err) {
        res.status = err.status;
        res.end(JSON.stringify(err));
      }
    }
  },
  "/my_Account/delete": async function (req, res) {
    if (req.method == "POST") {
      try {
        let decoded;
        // First check if user authenticated
        await validateJWT(
          req,
          function (err, response) {
            if (err) {
              res.status = err.status;
              res.end(JSON.stringify(err));
            } else {
              decoded = response;
            }
          },
          true
        );

        if (decoded) {
          userDelete(decoded)
            .then((response) => {
              res.status = 200;
              res.end(JSON.stringify(response));
            })
            .catch((err) => {
              res.status = err.status;
              res.end(JSON.stringify(err));
            });
        }
      } catch (error) {
        res.status = err.status;
        res.end(JSON.stringify(err));
      }
    }
  },
};

module.exports = routes;
