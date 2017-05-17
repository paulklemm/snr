class DatasetHub {
	constructor() {
		this.datasets = {};
		this.names = [];
		this.enabled = {};
	}
	push(dataset) {
		this.datasets[dataset.name] = dataset;
		this.update();
	}
	setData(name, data) {
		this.datasets[name].setData(data);
	}

	setEnable(datasetName, enabled) {
		this.datasets[datasetName].enabled = enabled;
		this.update();
		return (this.datasets[datasetName].loaded === false && enabled)
	}
	update() {
		let names = Object.keys(this.datasets);
		let enabled = {};
		// Iterate over all data sets and update information
		for (let i in names) {
			let name = names[i];
			enabled[name] = this.datasets[name].enabled;
		}
		this.names = names;
		this.enabled = enabled;
	}
}

export default DatasetHub;