// Conjunction with create-react-app from [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo)
const express = require("express");
// Require bcrypt for authentication
const bcrypt = require('bcryptjs');
// Access to local file system
const fs = require("fs");
const app = express();

/**
 * Read settings from file. Settings should contain:
 *  - Users: Path to users settings
 *  - Port: Default port used by node
 * @param {String} path to settings.json, default is set to "server_settings.json"
 * @return {Object} settings object
 */
function getSettings(path="server_settings.json") {
  const settings = readJSONFSSync(path);
  if (typeof settings === "undefined") {
    timeStampLog(`Cannot read settings at ${path}`, true);
  }
  return(settings);
}

/**
 * Read file from local file system as JSON
 * @param {String} path to file to read
 * @return {Object} of file in path
 */
function readJSONFSSync(path) {
  try {
    const filebuffer = fs.readFileSync(path);
    return(JSON.parse(filebuffer));
  } catch (readOrJsonErr) {
    timeStampLog(`readJSONFSSync: Cannot find file ${path}`);
  }
}
// Read in the settings
const settings = getSettings();

app.set("port", process.env.PORT || settings.port);

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
 * @param {Boolean} asError: Output message as error
 */
function timeStampLog (content, asError=false) {
  let currentdate = new Date();
  let output = `${currentdate.getDate()}/${currentdate.getMonth() + 1}/${currentdate.getFullYear()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()} ${content}`;
  if (asError)
    console.error(output);
  else
    console.log(output);
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
