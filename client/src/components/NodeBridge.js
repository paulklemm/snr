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
	}

	/**
	 * Set Authentication object for verifying local user and token
	 * 
	 * @param {Object} authenticator 
	 */
	setAuthentication(authentication) {
		this.authentication = authentication;
	}

	/**
	 * This is a debug function that can be removed later on. It contains code for checking the
	 * Node server behavior
	 */
	debugTestServer() {
		console.log('IsOnlinePromise');
		console.log(this.isOnlinePromise);
		this.testEcho('Wohooooo');
		// this.login('paul', '$2a$10$GJl7RZ8xfKnLieVLPH3sMeAE/EM3Z2JVRI21/YDEaELMMbV3.XWhm');
		this.echoToken("Wohoo token", 'paul', localStorage.getItem('sonarLoginToken'));
		this.echoToken("Wohoo token should not work", 'paul', 'afffe72deb80f6519f20b1ab9696c74a7d5c45e4b');
	}

	/**
   * Checks server availability and sets NodeBridge.isOnline
   * @return {Promise} of Check
   */
	checkServer() {
		return fetch(`api/isonline`).then(() => {
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
	sendEchoToken(query, cb) {
		// Get User and Token
		const { user, token } = this.getUserAndToken();
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
   * Async Echo function with user and token.
   * @param {String} query: String to echo
	 * @param {Boolean} debug: Print echo and server response to console
	 * @return {Object} Response object of server
	 */
	async echoToken(query, debug = false) {
		// Get User and Token
		const { user, token } = this.getUserAndToken()
		if (debug) console.log(`Test async echo token query ${query}`);
		let response = await this.sendEchoToken(query, user, token);
		if (debug) console.log(response);
		return response;
	}

	/**
	 * Execute R command on OpenCPU backend and receive the result in specified valformat
	 * 
	 * @param {String} rpackage R package name
	 * @param {String} rfunction Function of R package
	 * @param {Object} params Params for function as JSON
	 * @param {String} valformat Format of .val attribute (ascii, json, tsv), refer to `https://opencpu.github.io/server-manual/opencpu-server.pdf`
	 * @return {Object} Response from Node server
	 */
	async sendRCommand(rpackage, rfunction, params, valformat) {
		// Get user and token
		const { user, token } = this.getUserAndToken();
		// Fetch result from server
		let response = fetch(`api/runrcommand?rpackage=${rpackage}&rfunction=${rfunction}&params=${JSON.stringify(params)}&valformat=${valformat}&user=${user}&token=${token}`, { accept: 'application/json' })
			.then(this.parseJSON)
		
		return response;
	}

	/**
	 * Get User and Token from Authentication
	 * @return {Object} { user: UserName, token: UserToken }
	 */
	getUserAndToken() {
		return ({ user: this.authentication.getUser(), token: this.authentication.getToken() })
	}

	/**
	 * Load data for user.
	 * 
	 * @return {Object} Server response
	 */
	async loadData() {
		let { user, token } = this.getUserAndToken();
		let response = await fetch(`api/loaddata?user=${user}&token=${token}`, { accept: 'application/json' })
			.then(this.parseJSON)

		return response;
	}

	/**
	 * Get dataset from OpenCPU back end
	 * 
	 * @param {String} name Name of the dataset to load
	 * @return {Object} Server response
	 */
	async getDataset(name) {
	// Get User and Token
		const { user, token } = this.getUserAndToken()
		let response = await fetch(`api/getdataset?user=${user}&token=${token}&name=${name}`, { accept: 'application/json' })
			.then(this.parseJSON)

		return response;
	}

	/**
   * Send login credentials to server and receive success status and token
   * @param {String} user 
   * @param {String} hashedPassword 
   */
	async login(user, hashedPassword) {
		let response = await this.sendLogin(user, hashedPassword);
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