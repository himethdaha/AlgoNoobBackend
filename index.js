// Imports
const http = require("http");

// Server
const server = http.createServer((req, res) => {
  res.end("Voila");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening on port 8000");
});
