class DatasetHub {
	constructor() {
		this.datasets = {};
		this.names = [];
		this.enabled = {};
		this.loading = {};
	}
	push(dataset) {
		this.datasets[dataset.name] = dataset;
		this.update();
	}
	setData(name, data) {
		this.datasets[name].setData(data);
		// 'Loading' changes, so update
		this.update();
	}

	setLoading(name) {
		this.datasets[name].loading = true;
		this.update();
	}

	setEnable(datasetName, enabled) {
		this.datasets[datasetName].enabled = enabled;
		this.update();
		return (this.datasets[datasetName].loaded === false && enabled)
	}
	update() {
		let names = Object.keys(this.datasets);
		let enabled = {};
		let loading = {};
		// Iterate over all data sets and update information
		for (let i in names) {
			let name = names[i];
			enabled[name] = this.datasets[name].enabled;
			loading[name] = this.datasets[name].loading;
		}
		this.names = names;
		this.enabled = enabled;
		this.loading = loading;
	}
}

export default DatasetHub;