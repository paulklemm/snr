// Conjunction with create-react-app from [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo)
// Node classes: https://stackoverflow.com/questions/42684177/node-js-es6-classes-with-require
const express = require("express");
// const UserManager = require("./UserManager");
const { timeStampLog, readJSONFSSync } = require('./Components/Helper')
const { UserManager } = require('./Components/UserManager');
const { OpenCPUBridge } = require('./Components/OpenCPUBridge');
const { Sessions } = require('./Components/Sessions');

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
 * Perform OpenCPU session validity check.
 * 
 * @param {String} session OpenCPU session string to check
 * @param {String} dataFolder Path to data folder that should contain the OpenCPU session
 * @return {Boolean} session is valid or not
 */
async function sessionValid(session, dataFolder) {
  // HACK:
  // Quick and Dirty try/catch statement to fix a bug where we have a session from sessions.json, but the
  // OpenCPU instance doesn't know the session. OpenCPU will terminate the command with for example
  // `Error 400 Session not found: x0f44385423\n`.
  // This fix returns false if any error happens during this command. This, however can also happen if the
  // server is temporary offline or something similar happens. For now this should work.
  try {
    return (await openCPU.runRCommand("sonaR", "session_valid", { session: session, data_folder: `'${dataFolder}'` }, "json"))['.val'][0];
  } catch (error) {
    return false;
  }
}

//////////// End of function declarations

// Read in the settings
const settings = getSettings();
// Create new usersManager object and pass path to users
const userManager = new UserManager(settings.users);
// Create the openCPU connection
const openCPU = new OpenCPUBridge(settings.opencpuPath);
// Set path to `session.json` file
const sessions = new Sessions(settings.sessionsPath);
// timeStampLog(sessions.getSession("test"));
// sessions.writeSession("bla", 'blubber');
// openCPU.runRCommand("sonaR", "load_data", { data_folder: `'${userManager.getUserSettings('debug').path}'` }, "json").then((result) => {
//   timeStampLog(result.sessionID);
//   return ({ name: 'loaddata', success: true, sessionId: result.sessionID });
// });
// TODO: Debug code to test OpenCPU bridge
// openCPU.runRCommand("sonaR", "getUserFolder", { user: "'paul'" }, "json").then((result) => {
//   timeStampLog(JSON.stringify(result));
// });
// openCPU.runRCommand("stats", "rnorm", { n: 3 }, "json").then((result) => {
//   timeStampLog(JSON.stringify(result, null, 2));
// });
// Show how to pass arrays into OpenCPU
// openCPU.runRCommand("base", "mean", { x:'c(1, 2, 3, 4, 5, 6)' }, "json").then((result) => {
//   timeStampLog(JSON.stringify(result, null, 2));
// });
// Alternative:
// openCPU.runRCommand("base", "mean", { x:'[1, 2, 3, 4, 5, 6]' }, "json").then((result) => {
//   timeStampLog(JSON.stringify(result, null, 2));
// });

const app = express();
app.set("port", process.env.PORT || settings.port);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

/**
 * IsOnline is checked by client to see if server is alive
 */
app.get("/api/isonline", (req, res) => {
  timeStampLog("Send `isonline` ping");
  res.json({ "isonline": true });
});

/**
 * Request R function to be executed on OpenCPU server
 */
app.get("/api/runrcommand", async (req, res) => {
  const result = await userManager.tokenApiFunction('runrcommand', req, async (req) => {
    // Destructure required commands in query
    const { rpackage, rfunction, valformat } = req.query;
    // Params come as JSON strings
    const params = JSON.parse(req.query.params);
    // Log the command for debugging
    timeStampLog(`${rpackage}.${rfunction}(${JSON.stringify(params)}), valformat: ${valformat }`);
    // Run the command
    const result = await openCPU.runRCommand(rpackage, rfunction, params, valformat);
    // Return success response
    return ({ name: 'runrcommand', success: true, result: result });
  });
  // Respond result
  res.json(result);
});

/**
 * Login takes user name and password.
 * The password is hashed and compared to the stored hashed.
 * If successful, create and return a token that is used for verification on each request
 */
app.get("/api/login", (req, res) => {
  const user = req.query.user;
  const password = req.query.password;
  // TODO: Debug statement, remove for production
  timeStampLog(`Login request User: ${user}, Password: ${password}`);
  // Check the password with the stored one
  const loginSuccessful = userManager.checkPasswordUser(password, user);
  if (loginSuccessful) {
    // Create the token on disk
    const token = userManager.createToken(user);
    // When creating the token fails, token will be undefined
    if (typeof token === 'undefined')
       res.json({ name: "login", success: false, reason: 'Access token cannot be created on server, please contact the admins'});
    // If everything works fine, return result
    else
      res.json({ name: "login", success: true, token: token});
  }
  // When login is not successfull
  else
    res.json({ name: "login", success: false, reason: "User and password do not match" });
});

/**
 * Simple echo function to see if the server works as expected
 */
app.get("/api/echo", (req, res) => {
  const param = req.query.q;
  timeStampLog(`Received echo of ${param}`);
  res.json({ name: "echo", "echo": param});
});

/**
 * Get requested dataset from OpenCPU session
 * TODO: To reduce load on OpenCPU server, this could also be done by reading the raw CSV files
 */
app.get("/api/getdataset", async (req, res) => {
  const result = await userManager.tokenApiFunction('getdataset', req, async (req) => {
    const { name, user } = req.query;
    // Load the data set using OpenCPU
    dataset = await openCPU.runRCommand("sonaR", "get_dataset", { datasets: sessions.getSession(user), name: `'${name}'` }, 'json');
    return({ name: "getdataset", success: true, dataset: dataset});
  });
  res.json(result);
});

/**
 * Get GO Summary for all GO terms
 */
app.get("/api/getgosummary", async (req, res) => {
  const result = await userManager.tokenApiFunction('getgosummary', req, async (req) => {
    const { name, user, ensembldataset, ensemblversion } = req.query;
    // Get the GO summary from OpenCPU
    timeStampLog(`Get GO summary for: \n \ \ ensembl dataset '${ensembldataset}'\n \ \ ensembl version: '${ensemblversion}'`);
    summary = await openCPU.runRCommand("sonaRGO", "get_go_summary", { ensembl_dataset: `'${ensembldataset}'`, ensembl_version: `'${ensemblversion}'` }, 'json');
    return ({ name: "getgosummary", success: true, go: summary });
  });
  res.json(result);
});

/**
 * Get Go terms for list of identifier
 */
app.get("/api/gettogo", async (req, res) => {
  const result = await userManager.tokenApiFunction('gettogo', req, async (req) => {
    const { name, user, ensembldataset, ensemblversion, identifier } = req.query;
    // Get the GO summary from OpenCPU
    timeStampLog(`Get GO terms for: \n \ \ ensembl dataset '${ensembldataset}'\n \ \ ensembl version: '${ensemblversion}'\n \ \ identifier: '${identifier}'`);
    summary = await openCPU.runRCommand("sonaRGO", "to_go", { input:`${identifier}`, ensembl_dataset: `'${ensembldataset}'`, ensembl_version: `'${ensemblversion}'` }, 'json');
    return ({ name: "getgosummary", success: true, go: summary });
  });
  res.json(result);
});

/**
 * Load data function
 * TODO: Change this to only return the listed files and do not pass session ID to the client
 */
app.get("/api/loaddata", async (req, res) => {
  // TokenAPIFunction returns a result object for authentication failure
  const result = await userManager.tokenApiFunction('loaddata', req, async (req) => {
    const user = req.query.user;
    timeStampLog(`Load data for user '${user}'`);
    // Get OpenCPU data session for user
    let session = sessions.getSession(user);
    // If we know the session ID, check if it is valid. If session is not undefined, check if contains all required files
    let sessionIsValid = (typeof session !== 'undefined') ? await sessionValid(session, userManager.getUserSettings(user).path) : false;
    let filenames;
    if (!sessionIsValid) {
      timeStampLog(`Call R to load data for user ${user}`);
      // We have to load the data with OpenCPU
      response = await openCPU.runRCommand("sonaR", "load_data", { data_folder: `'${userManager.getUserSettings(user).path}'` }, "json");
      timeStampLog(`Loading data for user ${user} successful, Session-ID: ${response.sessionID}. Note that for many files the JSON export may fail because the R child process of exporting JSON will die.`);
      // Save session Id
      sessions.writeSession(user, response.sessionID);
    }
    // Get filenames from datasets object
    filenames = await openCPU.runRCommand("sonaR", "get_loaded_filenames", { datasets: sessions.getSession(user) }, "json");
    filenames = filenames['.val'];
    // Return result response in case of success
    return({ name: 'loaddata', success: true, filenames: filenames });
  });
  // Return result of TokenApi function, either success or failure
  res.json(result);
});

/**
 * Load metadata for data set
 */
app.get("/api/getmetadata", async(req, res) => {
  const result = await userManager.tokenApiFunction('loadmetadata', req, async (req) => {
    const { name, user } = req.query;
    timeStampLog(`Received metadata query for file ${name}`)
    timeStampLog(`filename: ${name}, data_folder: '${userManager.getUserSettings(user).path}'`)
    // Load meta data through OpenCPU
    let metadata;
    try {
      metadata = await openCPU.runRCommand("sonaR", "get_metadata", { filename: `'${name}'`, data_folder: `'${userManager.getUserSettings(user).path}'` }, "json");
    } catch (e) { return({ name: 'loadmetadata', success: false, reason: e}); }

    return({ name: "loadmetadata", success: true, metadata: metadata['.val'] });
  });
  // Return result of TokenApi function, either success or failure
  res.json(result);
});

/**
 * Simple echo function to see if the server works as expected with user providing a token
 */
app.get("/api/echotoken", async (req, res) => {
  const result = await userManager.tokenApiFunction('echotoken', req, async (req) => {
    const { user, token } = req.query;
    const param = req.query.q;
    timeStampLog(`Received echo Token '${param}' of User '${user}', Token '${token}'`);
    return({name: 'echo', success: true, echo: param});
  });
  res.json(result);
});

app.listen(app.get("port"), () => {
  timeStampLog(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
