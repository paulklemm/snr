// Access to local file system
const fs = require("fs");

/**
 * Log string with server time stamp
 * @param {String} content: String to log with timestamp
 * @param {Boolean} asError: Output message as error
 */
function timeStampLog (content, asError=false) {
  let currentdate = new Date();
  let output = `${twoDigits(currentdate.getDate())}/${twoDigits(currentdate.getMonth() + 1)}/${currentdate.getFullYear()} @ ${twoDigits(currentdate.getHours())}:${twoDigits(currentdate.getMinutes())}:${twoDigits(currentdate.getSeconds())} ${content}`;
  if (asError)
    console.error(output);
  else
    console.log(output);
}

/**
 * Helper function for timeStampLog to make hours, minutes and seconds always two-digit
 * 
 * @param {Integer} number Number to make two-digits
 * @return {String} Two-digit number as string
 */
function twoDigits(number) {
  return (number < 10 ? '0' : '') + number
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
    timeStampLog(`readJSONFSSync: Cannot find file ${path}. Error: ${readOrJsonErr}`);
  }
}

/**
 * Try to write file to filesystem
 * @param {String} path to file to write
 * @param {Object} obj to write
 * @return {Boolean} success of writing to disk
 */
function writeFSSync(path, obj) {
  try {
    fs.writeFileSync(path, obj);
    return(true);
  } catch (writeError) {
    timeStampLog(`writeFSSync: Cannot write file ${path}. Error: ${writeError}`);
    return(false);
  }
}

// Export functions
exports.timeStampLog = timeStampLog;
exports.readJSONFSSync = readJSONFSSync;
exports.writeFSSync = writeFSSync;