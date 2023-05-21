const bodyParser = require("body-parser");
const User = require("../database/models/userModel");
const userAuthenticationHandler = require("../eventHandlers/userLoginHandler");

const routes = {
  "/": function (req, res) {
    if (req.method == "POST") {
      // Variables
      let body;
      let userSaved = {};

      // get the body from request
      bodyParser.json()(req, res, () => {
        body = req.body;
        console.log("This is the body of the request " + JSON.stringify(body));
        const user = new User({
          emailAddress: body.email,
          userName: body.username,
          password: body.password,
          passwordConfirm: body.passwordConfirm,
        });

        user
          .save()
          .then((doc) => {
            userSaved = doc;
            res.status = 200;
            const dataSent = { userName: doc.userName };
            res.end(JSON.stringify(dataSent));
          })
          .catch((err) => {
            if (
              err.code === 11000 &&
              (err.keyPattern.username === 1 ||
                err.keyPattern.emailAddress === 1)
            ) {
              res.status = 400;
              res.end(JSON.stringify("User already exists. Please try again."));
            }
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
        console.log("parsed body: ", body);
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
