import {get, post} from 'axios';

// http://mediatemple.net/blog/tips/loading-and-using-external-data-in-react/
class OpenCPUBridge {
	constructor(adress) {
		this.adress = adress;
		this.isOnline = false;
		this.checkServer();
		this.test();
	}

	checkServer() {
		this.isOnlinePromise = get(this.adress)
			.then((response) => {
				// If status is 200, everything is fine, otherwise return error
				response.status == 200 ? this.isOnline = true : console.error(`OpenCPU returns status ${response.status}, connection cannot be established`);
			})
			.catch((error) => {
				// Server cannot be reached
				console.error(`OpenCPU Server ${this.adress} cannot be reached`);
				console.error(error);
				this.isOnline = false;
			})
	}

	test() {
		this.isOnlinePromise.then(() => {
			post('http://localhost:8004/ocpu/library/stats/R/rnorm?', {
				n: 10,
				mean: 5
			})
			.then(function (response) {
				console.log(response);
				if (response.status == 201)
					console.log(response.data);
			})
			.catch(function (error) {
				console.log(error);
			});
		});
	}
}

export default OpenCPUBridge;