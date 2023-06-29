const fs = require("fs");
const bodyParser = require("body-parser");
const formidable = require("formidable");
const urlParser = require("url");
const validateJWT = require("../utils/jwt/validateJWT");
const User = require("../database/models/userModel");
const userAuthenticationHandler = require("../eventHandlers/userLoginHandler");
const userSignUpHandler = require("../eventHandlers/userSignUpHandler");
const userForgotPassword = require("../eventHandlers/userForgotPassword");
const userResetPassword = require("../eventHandlers/userResetPassword");
const userUpdate = require("../eventHandlers/userUpdate");

const routes = {
  "/": function (req, res) {
    if (req.method == "POST") {
      // Variables
      let body;
      let userSaved = {};

      // get the body from request
      bodyParser.json()(req, res, () => {
        body = req.body;
        console.log("signup");
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
        console.log("cred", req.credentials);
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
            const cookieOptions = Object.entries(options)
              .map(([key, value]) => {
                if (key === "Expires") {
                  const date = value.toUTCString();
                  return `${key}=${date}`;
                } else {
                  return `${key}=${value}`;
                }
              })
              .join("; ");

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
      console.log(req.headers.cookie);
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
            console.log("response", response);
            res.status = 200;
            res.end(JSON.stringify(response));
          })
          .catch((err) => {
            console.log("err");
            console.log(err);
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
        console.log("bodyParser req", req.headers.origin);
        body = req.body;
        // Call the forgot password event handler
        userForgotPassword(body, req)
          .then((response) => {
            console.log("response", response);
            res.status = 200;
            res.end(JSON.stringify(response));
          })
          .catch((err) => {
            console.log("err");
            console.log(err);
            res.status = err.status;
            res.end(JSON.stringify(err));
          });
      });
    }
  },
  "/reset_password": function (req, res) {
    if (req.method === "PATCH") {
      console.log("req", req.url);
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
  "/My_Account/Update": async function (req, res) {
    if (req.method === "PATCH") {
      // First check if user authenticated
      try {
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
};

module.exports = routes;
