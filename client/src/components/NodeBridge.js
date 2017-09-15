
/**
 * Bridge to Node Backend
 * Code organized using the following posts:
 * [https://stackoverflow.com/questions/40469034/set-up-proxy-server-for-create-react-app](https://stackoverflow.com/questions/40469034/set-up-proxy-server-for-create-react-app)
 * [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo)
 */
class NodeBridge {
	constructor(addBusyState, removeBusyState) {
		this.isOnline = false;
		this.isOnlinePromise = this.checkServer();
		this.getMetadata = this.getMetadata.bind(this);
		this.getGoSummary = this.getGoSummary.bind(this);
		this.toGo = this.toGo.bind(this);
		// Add Busy State function from parent App class
		this.addBusyState = addBusyState;
		this.removeBusyState = removeBusyState;
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
   * Checks server availability and sets NodeBridge.isOnline
   * @return {Promise} of Check
   */
	checkServer() {
		return fetch(`api/isonline`).then(() => {
			this.isOnline = true;
		});
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
   * Async Echo function with user and token.
   * @param {String} query: String to echo
	 * @param {Boolean} debug: Print echo and server response to console
	 * @return {Object} Response object of server
	 */
	echoToken(query, debug = false) {
		let response = this.fetchWithUserAndToken(`api/echotoken?q=${query}`);
		if (debug) console.log(response);
		return response;
	}

	/**
	 * Wrapper function that calls the fetchURL on the node back-end with user credentials.
	 * If you provide no post-variables, be sure to end the fetchURL with a '?'.
	 * Examples:
	 *   fetchWithUserAndToken(`api/loaddata?`);
	 *   fetchWithUserAndToken(`api/getdataset?name=${name}`);
	 * 
	 * @param {String} fetchUrl URL to call. User and token will be appended with 
	 * @return {Object} Response from the server containing name of the call, success boolean and data
	 */
	async fetchWithUserAndToken(fetchUrl) {
		// Set busy state of the app
		this.addBusyState(fetchUrl);
		// Get User and Token
		const { user, token } = this.getUserAndToken();
		// Some functions like the getData functions do not take aruments, therefore we have to omit the first `&`
		const andSymbol = fetchUrl.endsWith('?') ? '' : '&';
		let response = await fetch(`${fetchUrl}${andSymbol}user=${user}&token=${token}`, { accept: 'application/json' })
			.then(this.parseJSON)

		// Set busy state of the app
		this.removeBusyState(fetchUrl);
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
	loadData() {
		return this.fetchWithUserAndToken(`api/loaddata?`);
	}

	/**
	 * Get dataset
	 * 
	 * @param {String} name Dataset to load
	 * @return {Object} Response
	 */
	getDataset(name) {
		return this.fetchWithUserAndToken(`api/getdataset?name=${name}`);
	}

	/**
	 * Get metadata for dataset
	 * 
	 * @param {String} name Dataset to load
	 * @return {Object} Response
	 */
	getMetadata(name) {
		return this.fetchWithUserAndToken(`api/getmetadata?name=${name}`);
	}

	/**
	 * Get summary table of all GO terms from the back-end.
	 * If ensemblDataset or ensemblVersion are undefined, defaults from `R` package will be used.
	 * @param {String} ensemblDataset Biomart dataset
	 * @param {String} ensemblVersion Ensembl version ('release') 
	 * @return {Object} Server response
	 */
	getGoSummary(ensemblDataset, ensemblVersion) {
		return this.fetchWithUserAndToken(`api/getgosummary?ensembldataset=${ensemblDataset}&ensemblversion=${ensemblVersion}`);
	}

	/**
	 * Get GO-Terms associated with identifier list
	 * If ensemblDataset or ensemblVersion are undefined, defaults from `R` package will be used.
	 * @param {array} identifier Array of identifier to relate to go-terms (e.g. ["ENSMUSG00000064370", "ENSMUSG00000065947"])
	 * @param {String} ensemblDataset Biomart dataset
	 * @param {String} ensemblVersion Ensembl version ('release') 
	 * @return {Object} Server response
	 */
	toGo(identifier, ensemblDataset, ensemblVersion) {
		// Get identifier into an array format that OpenCPU can read
		// For example, the array ["ENSMUSG00000064370", "ENSMUSG00000065947"] need to
		// be converted into the string '["ENSMUSG00000064370", "ENSMUSG00000065947"]'
		identifier = `["${identifier.join('","')}"]`;
		return this.fetchWithUserAndToken(`api/gettogo?identifier=${identifier}&ensembldataset=${ensemblDataset}&ensemblversion=${ensemblVersion}`);
	}

	/**
   * Send login credentials to server and receive success status and token
	 * 
   * @param {String} user 
   * @param {String} hashedPassword 
   */
	async login(user, hashedPassword) {
		let response = await this.sendLogin(user, hashedPassword);
		return response;
	}

	/**
	 * Parse json from node response object.
   * 
   * @param {Object} response: Response from fetch on node server
   * @return Object containing the server answer
   */
	parseJSON(response) {
		return response.json();
	}
}

export default NodeBridge;