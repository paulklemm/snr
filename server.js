// Conjunction with create-react-app from [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo)
// Node classes: https://stackoverflow.com/questions/42684177/node-js-es6-classes-with-require
const express = require("express");
// Require bcrypt for authentication
const bcrypt = require('bcryptjs');
// const UserManager = require("./UserManager");
var { timeStampLog, readJSONFSSync } = require('./Components/Helper')
var { UserManager } = require('./Components/UserManager');

const userManager = new UserManager();
userManager.makeNoise();

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
 * @return Password hash or empty string if password is not defined
 */
function getPasswordHash(user, userFolderPath) {
  const userSettings = getUserSettings(user, userFolderPath);
  if (typeof userSettings === "undefined" || typeof userSettings.passwd === "undefined") {
    timeStampLog(`Password or user not defined for ${user}`, true);
    return('');
  } else 
    return(userSettings.passwd);
}

/**
 * Get users settings object from users name
 * @param {String} user name
 * @param {String} userFolderPath path to users folder
 * @return {Object} users settings file
 */
function getUserSettings(user, userFolderPath) {
  // Read the user settings
  const userSettings = readJSONFSSync(`${userFolderPath}${user}`);
  // If settings are empty, show error
  if (typeof userSettings === "undefined")
    timeStampLog(`Cannot find user ${user}. Either user folder (${userFolderPath}) is wrong or user does not exist.`, true);
  // Return user Settings if everything works properly
  return(userSettings);
}

//////////// End of function declarations

// Read in the settings
const settings = getSettings();

const app = express();
app.set("port", process.env.PORT || settings.port);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
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
