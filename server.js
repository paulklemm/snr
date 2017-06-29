const express = require("express");
// Require bcrypt for authentication
var bcrypt = require('bcryptjs');
const app = express();

// Conjunction with create-react-app from [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo)

app.set("port", process.env.PORT || 3099);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

/**
   * Check if password and hash are matching
   * @param {String} password to check
   * @param {String} hash to check
   * @return {Bool} result of check
   */
function checkPassword(password, hash) {
  return (bcrypt.compareSync(password, hash));
}

/**
 * Get the password hash for specified user
 * @param {String} user to retreive the hash for
 */
function getPasswordHash(user) {
  // TODO: Implement
}

/**
 * Log string with server time stamp
 * @param {String} content: String to log with timestamp
 */
function timeStampLog (content) {
  let currentdate = new Date();
  console.log(`${currentdate.getDate()}/${currentdate.getMonth() + 1}/${currentdate.getFullYear()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()} ${content}`);
}

/**
 * IsOnline is used as handshake function to see whether the server is online or not
 */
app.get("/api/isonline", (req, res) => {
  timeStampLog("Get Handshake request");
  res.json({ "isonline": true });
});

/**
 * Simple echo function to see if the server works as expected
 */
app.get("/api/echo", (req, res) => {
  const param = req.query.q;
  timeStampLog(`Received request ${param}`);
  res.json({"echo": param});
});

app.listen(app.get("port"), () => {
  timeStampLog(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
