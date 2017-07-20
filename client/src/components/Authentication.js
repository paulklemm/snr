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

	async login(user, password) {
		const response = await this.nodeBridge.login(user, password);
		if (response.success) {
      localStorage.setItem(response.token, response.token);
      return true;
		} else {
      console.error(`Login failed`);
      return false;
		}
	}
}

export default Authentication;