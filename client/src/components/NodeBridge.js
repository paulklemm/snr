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
    console.log("IsOnlinePromise");
    console.log(this.isOnlinePromise);
    this.testEcho('Wohooooo');
  }

  /**
   * Checks server availability and sets NodeBridge.isOnline
   * @return {Promise} of Check
   */
  checkServer() {
    return fetch(`api/isonline`)
      .then(() => {
        console.log("CheckServer Done");
        this.isOnline = true
      })
  }

  /**
   * Get echo from server to test availability
   * @param {String} query term to echo
   * @param {Function} cb callback after query
   * @return {Promise} of sendEcho fetch
   */
  sendEcho(query, cb) {
    return fetch(`api/echo?q=${query}`, {
      accept: "application/json"
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
   * 
   * @param {Object} response: Response from fetch on node server
   * @return Object containing the server answer
   */
  parseJSON(response) {
    return response.json();
  }
}

export default NodeBridge;