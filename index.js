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

  // Set CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method == "OPTIONS") {
    res.writeHead(200);
    res.end();
  }

  // Check if the url exists
  if (routes[path]) {
    console.log("inside route: " + path);
    // Call the function for the specified path
    routes[path](req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify(errorMsg));
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening on port 8000");
});
