// Access to local file system
const fs = require("fs");

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
 * Read file from local file system as JSON
 * @param {String} path to file to read
 * @return {Object} of file in path
 */
function readJSONFSSync (path) {
  try {
    const filebuffer = fs.readFileSync(path);
    return (JSON.parse(filebuffer));
  } catch (readOrJsonErr) {
    timeStampLog(`readJSONFSSync: Cannot find file ${path}`);
  }
}

// Export functions
exports.timeStampLog = timeStampLog;
exports.readJSONFSSync = readJSONFSSync;