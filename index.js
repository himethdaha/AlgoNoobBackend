// Imports
const http = require("http");
const bodyParser = require("body-parser");

const routes = require("./routes");

// Server
const server = http.createServer((req, res) => {
  // Variables
  let body;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // get the body from request
  bodyParser.json()(req, res, () => {
    body = req.body;
    console.log("This is the body of the request " + JSON.stringify(body));
  });
  // Get the url of the request
  const path = req.url;

  // Check if the url exists
  if (routes[path]) {
    // Call the function for the specified path
    routes[path](req, res);
  } else {
    const errorMsg = { message: "404 Not Found" };
    res.end(JSON.stringify(errorMsg));
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening on port 8000");
});
