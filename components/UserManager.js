// Require bcrypt for authentication
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { timeStampLog, readJSONFSSync, writeFSSync } = require('./Helper');

class UserManager {
	constructor(userPath) {
		// Store the number of maximum login tokens per user
		this.maximumTokensPerUser = 3;
		this.userPath = userPath;
		this.debug = false;
		if (this.debug)
			this.debugTestUserPassword('paul', 'bla');
	}

	/**
	 * This function can be deleted later on. It is used for debugging purposes to check 
	 * aspects of the UserManager component to be working properly
	 */
	debugTestUserPassword(user, password) {
		// Tests for UserManager function
		timeStampLog("Checking password that should work");
		timeStampLog(this.checkPassword(password, this.getPasswordHash(user)));
		timeStampLog("Checking password that should not work");
		timeStampLog(this.checkPassword(Math.random().toString(), this.getPasswordHash(user)));
	}
	/**
	 * Wrapper function for requests containing a token check for a user.
	 * If the the provided token is available for the user, then the apifunction will be executed
	 * @param {String} name name of the function so that errors can be traced properly
	 * @param {Object} req request containing `req.query.user` and `req.query.token`
	 * @param {Function} apiFunction 
	 * @return {Object} return object that indicated failure or return `apiFunction`
	 */
	tokenApiFunction(name, req, apiFunction) {
		// Destructure user and token from the query
		const {user, token} = req.query;
		// Check if token is available for the user
		if (this.checkToken(user, token))
			// Execute Api function
			return apiFunction(req);
		else
			// If not, report failure
			return {name: name, success: false, loginInvalid: true, message: 'Invalid token or user' };
	}

	/**
	 * Create a token for the user and store a hash of it in the users token database
	 * @param {String} user to create the token for
	 * @return {String} unhashed token or undefined if the save fails
	 */
	createToken(user) {
		const token = crypto.randomBytes(20).toString('hex');
		const result = this.storeToken(user, token) ? token : undefined;
		return result;
	}

	/**
	 * Token is stored in the users list of tokens
	 * @param {String} user to check
	 * @param {String} token to compare
	 * @return {Boolean} token is stored for user
	 */
	checkToken(user, token) {
		// Get settings for the user
		const userSettings = this.getUserSettings(user);
		// If user settings are undefined, return false
		if (typeof userSettings === 'undefined')
			return false;
		// When there are no tokens added, return false
		if (typeof userSettings.tokens !== 'object') return false;
		// Get the token keys that represent the tokens as string
		const tokens = Object.keys(userSettings.tokens);
		// Check if the array of tokens is not larger than the size of maximumTokens which could indicate a token attack
		if (tokens.length > this.maximumTokensPerUser) {
			timeStampLog(
				`Error, tokens of user ${user} exceed the maximum number of allowed tokens (${this
					.maximumTokensPerUser})`,
				true
			);
			return false;
		}
		// Check if token is in the keys of users token object
		if (tokens.indexOf(token) != -1) return true;
		else return false;
	}

	/**
	 * Store the token for the user and return success.
	 * This also checks for older tokens and removes them if the number of maximum tokens is exceeded.
	 * @param {String} user name
	 * @param {String} tokenHash to store on disk
	 * @return {Boolean} success of storing token
	 */
	storeToken(user, tokenHash) {
		// Construct the new token object
		const token = {
			created: Date.now()
		};
		// Get user settings
		const userSettings = this.getUserSettings(user);
		// Create tokens object if it doesn't already exist
		if (typeof userSettings.tokens !== 'object') userSettings.tokens = {};
		// Remove oldest tokens until it is smaller than the number of valid tokens
		while (Object.keys(userSettings.tokens).length >= this.maximumTokensPerUser)
			userSettings.tokens = this.removeOldestToken(userSettings.tokens);
		// Add the new token
		userSettings.tokens[tokenHash] = token;
		// Store the token to disk and return success
		return writeFSSync(this.getUserConfigPath(user), JSON.stringify(userSettings, null, 2));
	}

	/**
	 * Debug function to test removeOldestToken
	 */
	testRemoveOldestToken() {
		const now = Date.now();
		let tokens = { a: { created: now }, b: { created: now - 10 }, c: { created: now + 10 } };
		// b is the oldest one, so we should end up a and c
		tokens = this.removeOldestToken(tokens);
		console.log(tokens);
		return typeof tokens.b === 'undefined';
	}

	/**
	 * Removes the oldest token by comparing the `created` times
	 * @param {Object} tokens is the token list where each token consists of `created` property
	 * @return {Object} tokens object without oldest one
	 */
	removeOldestToken(tokens) {
		const tokenKeys = Object.keys(tokens);
		// Set oldest entry time to the first token
		let oldestEntryTime = tokens[tokenKeys[0]].created;
		let oldestEntryId = 0;
		for (let keyId in tokenKeys) {
			const token = tokens[tokenKeys[keyId]];
			// Check if the current token is older
			if (token.created < oldestEntryTime) {
				// If so, upadte the variables accordingly
				oldestEntryTime = token.created;
				oldestEntryId = keyId;
			}
		}
		// Now we know the Id of the oldest token and we will delete it
		delete tokens[tokenKeys[oldestEntryId]];
		return tokens;
	}

	/**
	 * Create bcrypt hash from password
	 * @param {String} password to hash
	 * @return {String} hash of password
	 */
	getHash(password, saltRounds = 10) {
		// Generate a salt
		const salt = bcrypt.genSaltSync(saltRounds);
		// Hash the password with the salt
		const hash = bcrypt.hashSync(password, salt);
		return hash;
	}

	/**
	 * Check if password stored hash of user are matching
	 * @param {String} password to check.
	 * @param {String} user to check
	 * @return {Bool} result of check
	 */
	checkPasswordUser(password, user) {
		// Get user password
		const storedPassword = this.getPasswordHash(user);
		return this.checkPassword(password, storedPassword);
	}

	/**
	 * Check if password and hash are matching
	 * @param {String} password to check
	 * @param {String} hash to check
	 * @return {Bool} result of check
	 */
	checkPassword(password, hash) {
		return bcrypt.compareSync(password, hash);
	}

	/**
	 * Get the password hash for specified user
	 * @param {String} user to retreive the hash for (do not append '.json', this function does this for you)
	 * @return {String} Password hash or empty string if password is not defined
	 */
	getPasswordHash(user) {
		const userSettings = this.getUserSettings(user);
		if (typeof userSettings === 'undefined' || typeof userSettings.passwd === 'undefined') {
			timeStampLog(`Password or user not defined for ${user}`, true);
			return '';
		} else return userSettings.passwd;
	}

	/**
	 * Get users settings object from users name
	 * @param {String} user name
	 * @return {Object} users settings file
	 */
	getUserSettings(user) {
		// Read the user settings
		const userSettings = readJSONFSSync(this.getUserConfigPath(user));
		// If settings are empty, show error
		if (typeof userSettings === 'undefined')
			timeStampLog(
				`Cannot find user ${user} at ${this.getUserConfigPath(user)}. Either user folder (${this
					.userPath}) is wrong or user does not exist.`,
				true
			);
		// Return user Settings if everything works properly
		return userSettings;
	}

	/**
	 * Get path to user config as a string
	 * @param {String} user name
	 * @return {String} path to user configuration file
	 */
	getUserConfigPath(user) {
		return `${this.userPath}${user}.json`;
	}
};

// Export UserManager object
exports.UserManager = UserManager;