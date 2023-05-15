// Imports
const http = require("http");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config({ path: "./env" });

const routes = require("./routes/routes");
const User = require("./database/models/userModel");

const connectDB = require("./database/databaseConn");

// Conenct with the database
(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.log(`Error connecting with the database ${JSON.stringify(error)}`);
    return error;
  }
})();

// Server
const server = http.createServer((req, res) => {
  // Variables
  let body;
  const path = req.url;
  const errorMsg = { message: "404 Not Found" };

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Check if the url exists
  if (routes[path]) {
    // Call the function for the specified path
    routes[path](req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify(errorMsg));
  }

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
      })
      .catch((err) => {
        console.log("error saving user", err);
      });
  });
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening on port 8000");
});
