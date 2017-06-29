class NodeBridge {
  constructor() {
    this.isOnline = false;
    this.isOnlinePromise = this.checkServer();
    console.log("IsOnlinePromise");
    console.log(this.isOnlinePromise);
    this.testEcho('Wohooooo');
  }

  checkServer() {
    return fetch(`api/isonline`)
      .then(() => {
        console.log("CheckServer Done");
        this.isOnline = true
      })
  }

  sendEcho(query, cb) {
    return fetch(`api/echo?q=${query}`, {
      // accept: "application/json"
    })
      .then(this.parseJSON)
      .then(cb);
  }

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