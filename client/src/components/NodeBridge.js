/**
 * Bridge to Node Backend
 * Code organized using the following posts:
 * [https://stackoverflow.com/questions/40469034/set-up-proxy-server-for-create-react-app](https://stackoverflow.com/questions/40469034/set-up-proxy-server-for-create-react-app)
 * [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo)
 */
class NodeBridge {
	constructor() {
		this.isOnline = false;
		this.isOnlinePromise = this.checkServer();
		// TODO: Debug statements that should later only output stuff when there is a problem
		console.log('IsOnlinePromise');
		console.log(this.isOnlinePromise);
		this.testEcho('Wohooooo');
		// this.login('paul', '$2a$10$GJl7RZ8xfKnLieVLPH3sMeAE/EM3Z2JVRI21/YDEaELMMbV3.XWhm');
		this.testEchoToken("Wohoo token", 'paul', 'fffe72deb80f6519f20b1ab9696c74a7d5c45e4b');
		this.testEchoToken("Wohoo token should not work", 'paul', 'afffe72deb80f6519f20b1ab9696c74a7d5c45e4b');
	}

	/**
   * Checks server availability and sets NodeBridge.isOnline
   * @return {Promise} of Check
   */
	checkServer() {
		return fetch(`api/isonline`).then(() => {
			console.log('CheckServer Done');
			this.isOnline = true;
		});
	}

	/**
   * Get echo from server to test availability
   * @param {String} query term to echo
   * @param {Function} cb callback after query
   * @return {Promise} of sendEcho fetch
   */
	sendEcho(query, cb) {
		return fetch(`api/echo?q=${query}`, {
			accept: 'application/json'
		})
			.then(this.parseJSON)
			.then(cb);
	}

	/**
   * Get echo from server to test availability
   * @param {String} query term to echo
   * @param {Function} cb callback after query
   * @return {Promise} of sendEcho fetch
   */
	sendEchoToken(query, user, token, cb) {
		return fetch(`api/echotoken?q=${query}&user=${user}&token=${token}`, { accept: 'application/json' })
			.then(this.parseJSON)
			.then(cb);
	}

	/**
   * Private function to send login data to the server
   * @param {String} user for login
   * @param {String} password for login
   * @param {Function} cb callback after query
   * @return {Promise} of sendLogin fetch
   */
	sendLogin(user, password, cb) {
		return fetch(`api/login?user=${user}&password=${password}`, {
			accept: 'application/json'
		})
			.then(this.parseJSON)
			.then(cb);
	}

	/**
   * Test function for sendEcho fetch
   * @param {String} query to echo
   */
	async testEcho(query) {
		console.log(`Test Async Echo query ${query}`);
		let response = await this.sendEcho(query);
		console.log(response);
	}

	/**
   * Test function for sendEcho with token
   * @param {String} query to echo
	 * @param {String} token to identify the client with
	 */
	async testEchoToken(query, user, token) {
		console.log(`Test Async Echo Token query ${query}`);
		let response = await this.sendEchoToken(query, user, token);
		console.log(response);
	}

	/**
   * Send login credentials to server and receive success status and token
   * @param {String} user 
   * @param {String} hashedPassword 
   */
	async login(user, hashedPassword) {
		// TODO: Clean this up
		console.log(`Send login with user ${user}, hashed password ${hashedPassword}`);
		let response = await this.sendLogin(user, hashedPassword);
		console.log(response);
		return response;
	}

	/**
   * 
   * @param {Object} response: Response from fetch on node server
   * @return Object containing the server answer
   */
	parseJSON(response) {
		return response.json();
	}
}

export default NodeBridge;