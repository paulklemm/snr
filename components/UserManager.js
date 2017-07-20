// Require bcrypt for authentication
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { timeStampLog, readJSONFSSync, writeFSSync } = require('./Helper');

class UserManager {
	constructor(userPath) {
		// Store the number of maximum login tokens per user
		this.maximumTokensPerUser = 3;
		this.userPath = userPath;
	}
	/**
	 * Check if password and hash are matching
	 * @param {String} password to check
	 * @param {String} hash to check
	 * @return {Bool} result of check
	 */
	checkUnhashedPassword(password, hash) {
		return bcrypt.compareSync(password, hash);
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

	checkToken(user) {
		// TODO: Implement
		// TODO: Check if the array of tokens is not larger than the size of maximumTokens which could indicate a token attack
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
		while(Object.keys(userSettings.tokens).length >= this.maximumTokensPerUser)
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
	 * Check if password and hash are matching
	 * @param {String} password to check. Password was already bcrypt hashed (usually on client side).
	 * @param {String} hash to check
	 * @return {Bool} result of check
	 */
	checkPassword(passwordHashed, user) {
		// Get user password
		const storedPassword = this.getPasswordHash(user);
		return storedPassword === passwordHashed;
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
			timeStampLog(`Cannot find user ${user} at ${this.getUserConfigPath(user)}. Either user folder (${this.userPath}) is wrong or user does not exist.`, true);
		// Return user Settings if everything works properly
		return userSettings;
	}

	/**
	 * Get path to user config as a string
	 * @param {String} user name
	 * @return {String} path to user configuration file
	 */
	getUserConfigPath(user) {
		return(`${this.userPath}${user}.json`);
	}
};

// Export UserManager object
exports.UserManager = UserManager;