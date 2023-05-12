const routes = {
  "/": function (req, res) {
    console.log(req);
    res.status = 200;
    res.setHeader("Content-Type", "application/json");
    const dataSent = { message: "Successfully submitted" };
    res.end(JSON.stringify(dataSent));
  },
};

module.exports = routes;
