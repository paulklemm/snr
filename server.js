// Conjunction with create-react-app from [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo)
// Node classes: https://stackoverflow.com/questions/42684177/node-js-es6-classes-with-require
const express = require("express");
// const UserManager = require("./UserManager");
const { timeStampLog, readJSONFSSync } = require('./Components/Helper')
const { UserManager } = require('./Components/UserManager');

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

//////////// End of function declarations

// Read in the settings
const settings = getSettings();
// Create new usersManager object and pass path to users
const userManager = new UserManager(settings.users);
// DEBUG: Tests for UserManager function
timeStampLog("Checking password that should work");
timeStampLog(userManager.checkUnhashedPassword('bla', userManager.getPasswordHash('paul')));
timeStampLog("Checking password that should not work");
timeStampLog(userManager.checkUnhashedPassword('blaa', userManager.getPasswordHash('paul')));

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
 * Login takes user name and hashed password to compare the two.
 * When the hashes match we'll create a token that will be send to the client
 * and is used for verification on each request
 */
app.get("/api/login", (req, res) => {
  const user = req.query.user;
  const passwordHashed = req.query.hashedpw;
  // TODO: Debug statement, remove for production
  timeStampLog(`Login request User: ${user}, Hashed Password: ${passwordHashed}`);
  // Check the password with the stored one
  const loginSuccessful = userManager.checkPassword(passwordHashed, user);
  if (loginSuccessful) {
    // Create the token on disk
    const token = userManager.createToken(user);
    // When creating the token fails, token will be undefined
    if (typeof token === 'undefined')
       res.json({ success: false, reason: 'Access token cannot be created on server, please contact the admins'});
    // If everything works fine, return result
    else
      res.json({ success: true, token: token});
  }
  // When login is not successfull
  else
    res.json({ success: false, reason: "User and password do not match" });
});

/**
 * Simple echo function to see if the server works as expected
 */
app.get("/api/echo", (req, res) => {
  const param = req.query.q;
  timeStampLog(`Received echo of ${param}`);
  res.json({"echo": param});
});

/**
 * Simple echo function to see if the server works as expected with user providing a token
 */
app.get("/api/echotoken", (req, res) => {
  const result = userManager.tokenApiFunction(req, (req) => {
    const param = req.query.q;
    timeStampLog(`Received echo Token of ${param}`);
    return({success: true, echo: param});
  });
  res.json(result);
});

app.listen(app.get("port"), () => {
  timeStampLog(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
