import DimensionTypes from './DimensionTypes';
// const DimensionTypes = {
// 	fc: "number",
// 	pValue: "number",
// 	negLog10_p_value: "number",
// 	qValue: "number",
// 	fpkm_1: "number",
// 	fpkm_2: "number",
// 	name: "string",
// 	biotype: "string"
// };

class DatasetHub {
	constructor() {
		this.datasets = {};
		this.names = [];
		this.enabled = {};
		this.loading = {};
		this.filter = {};
		this.onFilter = this.onFilter.bind(this);
	}

	filterIsValid(name, val) {
		// Get type from the static object
		const type = DimensionTypes[name];
		let isValid = (type === "number") ? !isNaN(val) : true;
		return isValid;
	}

	parseFilterValue(name, val) {
		return (DimensionTypes[name] === "number") ? parseFloat(val) : val;
	}

	broadcastFilter() {
		for (let i in this.names) {
			let name = this.names[i];
			let dataset = this.datasets[name];
			// Only apply filter if the data set is really loaded
			if (dataset.loaded)
				this.datasets[name].setFilter(this.filter);
		}
	}

	onFilter(name, val, operator) {
		//console.log(`Set filter ${val} for ${name}`);
		const val_filter = this.parseFilterValue(name, val);
		if (this.filterIsValid(name, val_filter)) {
			this.filter[name] = {value: val_filter, operator: operator};
		} else {
			delete this.filter[name];
		}
		this.broadcastFilter();
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
	setData(name, data, dimNames) {
		this.datasets[name].setData(data, dimNames);
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