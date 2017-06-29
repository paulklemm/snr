const express = require("express");

const app = express();

app.set("port", process.env.PORT || 3099);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.get("/api/food", (req, res) => {
  const param = req.query.q;
  console.log(`Received request ${param}`);

  res.json({"param": param});

});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
