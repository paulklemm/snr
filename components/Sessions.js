const { timeStampLog } = require('./Helper')
const fs = require("fs");

/**
 * Manages OpenCPU sessions. Sessions are stored in `sessions.json` specified server_settings.json.
 */
class Sessions {
  constructor(sessionsPath) {
    this.sessionsPath = sessionsPath;
  }

  /**
   * Get OpenCPU session id from `sessions.json`.
   * 
   * @param {String} sessionName Session name
   * @return OpenCPU session id or undefined if session doesn't exist
   */
  getSession(sessionName) {
    return this.readSessions()[sessionName];
  }

  /**
   * Read sessions file from sessionsPath
   * @return Sessions object from disk or empty object when no sessions file is found
   */
  readSessions() {
    // Read sessions from local system
    let sessions;
    // Try to read sessions file
    try {
      // Successful, get Sessions file from path
      const filebuffer = fs.readFileSync(this.sessionsPath);
      sessions = JSON.parse(filebuffer);
    } catch (readOrJsonErr) {
      // Not successful, create empty project.
      timeStampLog(`Cannot find session file ${this.sessionsPath}. Error: "${readOrJsonErr}". Attempt to create it.`, true);
      sessions = {};
    }
    return sessions;
  }

  /**
   * Write session id to session name in `sessions.json`.
   * 
   * @param {String} sessionName  Session name
   * @param {String} sessionId OpenCPU session id
   */
  writeSession(sessionName, sessionId) {
    // Read existing sessions file
    let sessions = this.readSessions();
    sessions[sessionName] = sessionId;
    // Write the sessions file
    fs.writeFileSync(this.sessionsPath, JSON.stringify(sessions, null, 2));
  }
}

exports.Sessions = Sessions;