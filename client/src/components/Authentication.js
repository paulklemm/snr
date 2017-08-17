/**
 * Using bcryptjs implementation
 * Example: [https://www.npmjs.com/package/bcryptjs](https://www.npmjs.com/package/bcryptjs)
 * Exchange with Node server should follow [https://medium.com/@alexmngn/from-reactjs-to-react-native-what-are-the-main-differences-between-both-d6e8e88ebf24](https://medium.com/@alexmngn/from-reactjs-to-react-native-what-are-the-main-differences-between-both-d6e8e88ebf24)
 */
class Authentication {
	/**
   * Authentication takes care of login and receiving and storing the login token
   * @param {Object} nodeBridge to the backend to perform login and receive the token
   */
	constructor(nodeBridge) {
		this.nodeBridge = nodeBridge;
	}

	/**
	 * Get user of local storage
	 * @return {String} User name in storage
	 */
	getUser() {
		return localStorage.getItem('sonarLoginUser');
	}

	/**
	 * Get token of local storage
	 * @return {String} Token in storage
	 */
	getToken() {
		return localStorage.getItem('sonarLoginToken');
	}

	/**
	 * Set user for current session
	 * @param {String} user: User name to set
	 */
	setUser(user) {
		localStorage.setItem('sonarLoginUser', user);
	}

	/**
	 * Set user for current session
	 * @param {String} token: Token name to set
	 */
	setToken(token) {
		localStorage.setItem('sonarLoginToken', token);
	}

	/**
	 * Checks if local storage items exist and whether you can login with them.
	 * @return Boolean of success
	 */
	async loginRequired() {
		// If there is no local storage for user or token, return true
		if (localStorage.getItem('sonarLoginToken') == null || localStorage.getItem('sonarLoginUser') == null)
			return true;
		// Check if login works
		const response = await this.nodeBridge.echoToken(`User and token handshake`);
		// Invert the success boolean and return it
		return !response.success;
	}

	/**
	 * Logs in user and returns boolean success. 
	 * If successfull, set localStorage items `sonarLoginToken` and `sonarLoginUser`
	 * @param {String} user: User to log in
	 * @param {String} password: Password for user
	 * @return {Boolean} Success of login
	 */
	async login(user, password) {
		const response = await this.nodeBridge.login(user, password);
		if (response.success) {
      localStorage.setItem('sonarLoginToken', response.token);
      localStorage.setItem('sonarLoginUser', user);
      return true;
		} else {
			console.error(`Login failed, reason: ${response.reason}`);
      return false;
		}
	}
}

export default Authentication;