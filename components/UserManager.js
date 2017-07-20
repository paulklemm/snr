// Require bcrypt for authentication
const bcrypt = require('bcryptjs');
const { timeStampLog, readJSONFSSync } = require('./Helper')

class UserManager {
  constructor(userPath) {
    this.userPath = userPath;
  }
  /**
   * Check if password and hash are matching
   * @param {String} password to check
   * @param {String} hash to check
   * @return {Bool} result of check
   */
  checkUnhashedPassword(password, hash) {
    return (bcrypt.compareSync(password, hash));
  }

  /**
   * Create a token for the user and store a hash of it in the users token database
   * @param {String} user to create the token for
   * @return {String} unhashed token
   */
  createToken(user) {
    // TODO
    return('token')
  }

  /**
   * Check if password and hash are matching
   * @param {String} password to check. Password was already bcrypt hashed (usually on client side).
   * @param {String} hash to check
   * @return {Bool} result of check
   */
  checkPassword(passwordHashed, user) {
    // Get user password
    const storedPassword = this.getPasswordHash(user);
    return (storedPassword === passwordHashed);
  }

  /**
   * Get the password hash for specified user
   * @param {String} user to retreive the hash for (do not append '.json', this function does this for you)
   * @return {String} Password hash or empty string if password is not defined
   */
  getPasswordHash(user) {
    const userSettings = this.getUserSettings(user);
    if (typeof userSettings === "undefined" || typeof userSettings.passwd === "undefined") {
      timeStampLog(`Password or user not defined for ${user}`, true);
      return ('');
    } else
      return (userSettings.passwd);
  }

  /**
   * Get users settings object from users name
   * @param {String} user name
   * @return {Object} users settings file
   */
  getUserSettings(user) {
    // Read the user settings
    const userSettings = readJSONFSSync(`${this.userPath}${user}.json`);
    // If settings are empty, show error
    if (typeof userSettings === "undefined")
      timeStampLog(`Cannot find user ${user}. Either user folder (${this.userPath}) is wrong or user does not exist.`, true);
    // Return user Settings if everything works properly
    return (userSettings);
  }
};

// Export UserManager object
exports.UserManager = UserManager;