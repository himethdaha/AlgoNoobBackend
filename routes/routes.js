const routes = {
  "/": function (req, res) {
    console.log(req);
    res.status = 200;
    res.writeHead(200, { "Content-Type": "application/json" });
    const dataSent = { message: "Successfully submitted" };
    res.end(JSON.stringify(dataSent));
  },
};

module.exports = routes;
