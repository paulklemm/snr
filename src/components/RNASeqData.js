import {csv} from 'd3-request';

class RNASeqData {
	constructor(path, readCallback) {
		console.log(`Reading RNASeq data ${path}`);
		this.path = path;
		this.error = false;
		this.loading = true;
		this.read(readCallback);
	}

	read(readCallback){
		console.time('Loading RNASeq Data');
		csv(this.path, (error, data) => {
			if (error) {
				this.error = true;
			}
			this.data = data;
			this.loading = false;
			console.timeEnd('Loading RNASeq Data');
			readCallback(this.data);
		})
	}
}

export default RNASeqData;