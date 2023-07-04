// Imports
const http = require("http");
const url = require("url");
const dotenv = require("dotenv");

dotenv.config({ path: "./env" });

const routes = require("./routes/routes");
const User = require("./database/models/userModel");
const removeUnverifiedUsers = require("./utils/cron/removeUnverified");

const connectDB = require("./database/databaseConn");

// Conenct with the database
(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.log(`Error connecting with the database`);
    console.log(error);
    return error;
  }
})();

// Server
const server = http.createServer(async (req, res) => {
  // Variables
  const path = req.url;
  console.log(path);
  console.log(req.method);

  const errorMsg = { message: "404 Not Found" };

  // Set CORS
  // res.setHeader is used to set single header values for each response. They are not persistent across IPs or requests
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Accept",
    "application/json, multipart/form-data",
    "image/jpeg",
    "image/png",
    "image/jpg"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  // For pre-flight requests
  if (req.method == "OPTIONS") {
    res.writeHead(200);
    res.end();
  }

  // Check if the url exists
  if (routes[path]) {
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

setInterval(removeUnverifiedUsers, 24 * 60 * 60 * 1000);
