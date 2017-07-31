import Filter from './Filter'

class DatasetHub {
	constructor() {
		this.datasets = {};
		this.names = [];
		this.enabled = {};
		this.loading = {};
		this.broadcastFilter = this.broadcastFilter.bind(this);
		this.getDatasetIcon = this.getDatasetIcon.bind(this);
		this.filter = new Filter(this.broadcastFilter);
	}

	broadcastFilter() {
		for (let i in this.names) {
			let name = this.names[i];
			let dataset = this.datasets[name];
			// Only apply filter if the data set is really loaded
			if (dataset.loaded)
				this.datasets[name].setFilter(this.filter.getFilter());
		}
	}

	push(dataset) {
		this.datasets[dataset.name] = dataset;
		this.update();
	}

	/**
	 * Get dataset icon
	 * @param {string} datasetName Name of the dataset to retreive
	 */
	getDatasetIcon(datasetName) {
		if (Object.keys(this.datasets).indexOf(datasetName) === -1)
			throw (new Error(`Could not get icon for ${datasetName}, dataset does not exist in DatasetHub`));
		else
			return (this.datasets[datasetName].icon);
	}

	/**
	 * Set icon of dataset
	 * @param {String} datasetName 
	 * @param {String} icon name, get icon from DatasetIcons
	 */
	setDatasetIcon(datasetName, icon) {
		this.datasets[datasetName].icon = icon;
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