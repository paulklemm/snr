const express = require("express");

const app = express();

app.set("port", process.env.PORT || 3099);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

/**
 * 
 * @param {String} content: String to log with timestamp
 */
function timeStampLog (content) {
  let currentdate = new Date();
  console.log(`${currentdate.getDate()}/${currentdate.getMonth() + 1}/${currentdate.getFullYear()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()} ${content}`);
}

app.get("/api/isonline", (req, res) => {
  timeStampLog("Get Handshake request");
  res.json({ "isonline": true });
});

app.get("/api/echo", (req, res) => {
  const param = req.query.q;
  console.log(`Received request ${param}`);
  res.json({"echo": param});
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
