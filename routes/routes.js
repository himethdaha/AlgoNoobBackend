const bodyParser = require("body-parser");
const User = require("../database/models/userModel");
const userAuthenticationHandler = require("../eventHandlers/userLoginHandler");
const userSignUpHandler = require("../eventHandlers/userSignUpHandler");
const userForgotPassword = require("../eventHandlers/userForgotPassword");

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
        userSignUpHandler(body)
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
            console.log("response: ", response);
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
  "/forgot_password": function (req, res) {
    if (req.method === "POST") {
      let body;

      bodyParser.json()(req, res, () => {
        body = req.body;
        console.log(body);
        // Call the forgot password event handler
        userForgotPassword(body)
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
};

module.exports = routes;
