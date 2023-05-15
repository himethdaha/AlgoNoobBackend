const bodyParser = require("body-parser");
const User = require("../database/models/userModel");

const routes = {
  "/": function (req, res) {
    if (req.method == "OPTIONS") {
      console.log("setting CORS");
      res.writeHeader(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
    } else if (req.method == "POST") {
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
            console.log("user saved", doc);
            userSaved = doc;
            res.status = 200;
            res.writeHead(200, {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            });
            const dataSent = { userName: doc.userName };
            res.end(JSON.stringify(dataSent));
          })
          .catch((err) => {
            console.log("error saving user", err);
          });
      });
    }
  },
};

module.exports = routes;
