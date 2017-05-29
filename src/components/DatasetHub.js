const dimensionTypes = {
	fc: "number",
	pValue: "number",
	negLog10_p_value: "number",
	qValue: "number",
	fpkm_1: "number",
	fpkm_2: "number",
	name: "string",
	biotype: "string"
};

class DatasetHub {
	constructor() {
		this.datasets = {};
		this.names = [];
		this.enabled = {};
		this.loading = {};
		this.onFilter = this.onFilter.bind(this);
	}

	filterIsValid(name, val) {
		// Get type from the static object
		const type = dimensionTypes[name];
		let isValid = (type === "number") ? !isNaN(val) : true;
		return isValid;
	}

	parseFilterValue(name, val) {
		return (dimensionTypes[name] === "number") ? parseFloat(val) : val;
	}

	onFilter(name, val) {
		console.log(`Set filter ${val} for ${name}`);
		const val_filter = this.parseFilterValue(name, val);
		if (this.filterIsValid(name, val_filter)) {
			console.log("is Valid");
		} else {
			console.log("is not valid");
		}
	}

	filterFPKM(val) {
		for (let i in this.names) {
			let name = this.names[i];
			let dataset = this.datasets[name];
			// Only apply filter if the data set is really loaded
			if (dataset.loaded)
				this.datasets[name].filterFPKM(val);
		}
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