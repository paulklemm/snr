import {get, post} from 'axios';

// http://mediatemple.net/blog/tips/loading-and-using-external-data-in-react/
class OpenCPUBridge {
	constructor(address) {
		this.address = address;
		this.isOnline = false;
		this.checkServer();
		this.test();
	}

	checkServer() {
		this.isOnlinePromise = get(`${this.address}/ocpu`)
			.then((response) => {
				// If status is 200, everything is fine, otherwise return error
				response.status === 200 ? this.isOnline = true : console.error(`OpenCPU returns status ${response.status}, connection cannot be established`);
			})
			.catch((error) => {
				// Server cannot be reached
				console.error(`OpenCPU Server ${this.address} cannot be reached`);
				console.error(error);
				this.isOnline = false;
			})
	}

	test() {
		let that = this;
		this.isOnlinePromise.then(() => {
			post('http://localhost:8004/ocpu/library/stats/R/rnorm?', {
				n: 10,
				mean: 5
			})
			.then(function (response) {
				// console.log(response);
				if (response.status === 201)
					// console.log(response.data);
					that.getOutput(response.data)
			})
			.catch(function (error) {
				console.log(error);
			});
		});
	}
	/*
	 * The output of a successfull OpenCPU POST looks like this:
	 * /ocpu/tmp/x028712f57c/R/.val
	 * /ocpu/tmp/x028712f57c/stdout
	 * /ocpu/tmp/x028712f57c/source
	 * /ocpu/tmp/x028712f57c/console
	 * /ocpu/tmp/x028712f57c/info
	 * /ocpu/tmp/x028712f57c/files/DESCRIPTION
	 * This function gets the information for all these URLs and puts them into an object like the following:
	 * {
	 *   .val: ..GET URL..
	 *   stdout: ..GET URL..
	 *   source: ..GET URL..
	 *   console: ..GET URL..
	 *   info: ..GET URL..
	 *   DESCRIPTION: ..GET URL..
	 * }
	 */
	getOutput(data) {
		// Data is provided as relative URLs divided by newlines
		data = data.split('\n');
		// prepare empty result as well as the associated promises
		let result = {promises: []};
		for (let i in data) {
			const url = data[i];
			// Only proceed if the URL contains non-whitespaces
			if (/\S/.test(url)) {
				// Split at forward slashes and get the last element as key /ocpu/tmp/x028712f57c/R/.val => .val
				let key = url.split('/');
				key = key[key.length - 1];
				// Initiate the get for the current key
				const promise = get(this.address + url)
					.then((response) => { result[key] = response.data; })
					.catch((error) => { console.error(`Could not access ${url}`); });
				result.promises.push(promise);
			}
		}
		console.log(result);
		return result;
	}
}

export default OpenCPUBridge;