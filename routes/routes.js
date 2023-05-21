const bodyParser = require("body-parser");
const User = require("../database/models/userModel");
const userAuthenticationHandler = require("../eventHandlers/userLoginHandler");
const userSignUpHandler = require("../eventHandlers/userSignUpHandler");

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
            res.end(JSON.stringify(error.message));
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
            if (err.status >= 400 && err.status < 500) {
              res.status = err.status;
              res.end(JSON.stringify(err.message));
            } else {
              res.status = err.status;
              res.end(JSON.stringify(err.message));
            }
          });
      });
    }
  },
};

module.exports = routes;
