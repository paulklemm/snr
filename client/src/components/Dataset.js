import DimensionTypes from './DimensionTypes';

class Dataset {
	constructor(name, enabled = false) {
		this.name = name;
		this.enabled = enabled;
		this.loaded = false;
		this.loading = false;
		this.dimNames = [];
		// HTML Element representing the dataset icon
		this.icon = "";
	}

	/**
	 * Set dataset content
	 * 
	 * @param {Array} data Array of datapoints
	 * @param {Array} dimNames Names of the dimensions
	 */
	setData(data, dimNames) {
		this.data = data;
		this.loaded = true;
		this.loading = false;
		this.dimNames = dimNames;
		// Attach 'filtered' element
		this.filtered = [];
		for (let i in this.data)
			this.filtered[i] = false
		
		// Setup collection associating id of each entry with row-id for fast access
		this.ensemblToArrayIndex = this._updateEnsemblToArrayIndex(this.data);
		// Keep a copy of the unfiltered one
		this.ensemblToArrayIndexUnfiltered = {...this.ensemblToArrayIndex};
	}

	/**
	 * Get collection mapping row id to index in the array
	 * 
	 * @param {Boolean} wholeData Return indexing collection for whole data or apply filtered data
	 * @return {Object} Collection mapping row id to index in the array
	 */
	getEnsemblToArrayIndex(wholeData = false) {
		return wholeData ? this.ensemblToArrayIndexUnfiltered : this.ensemblToArrayIndex;
	}

	/**
	 * Get collection mapping row id to index in the array
	 * 
	 * @param {Array} data data to create the collection for
	 * @return {Object} Collection mapping row id to index in the array
	 */
	_updateEnsemblToArrayIndex(data) {
		let ensemblToArrayIndex = {};
		// Iterate over all entries in the data and create the index
		for (let rowIndex in data)
			ensemblToArrayIndex[data[rowIndex]['EnsemblID']] = rowIndex;
		
		return ensemblToArrayIndex;
	}

	/**
	 * Get array of the data set.
	 * 
	 * @param {Boolean} wholeData: Defaults to false. If set to true, will return the whole data set even if it is filtered 
	 * @return {Array} Data points as array
	 */
	getData(wholeData = false) {
		// TODO: This should me more efficiently, recalculate data array on filter, not on getData
		if (this.isFiltered() && !wholeData) {
			let dataFiltered = [];
			for (let i in this.data)
				if (!this.filtered[i])
					dataFiltered.push(this.data[i]);
			
			// Update element-ID to array index
			this.ensemblToArrayIndex = this._updateEnsemblToArrayIndex(dataFiltered);
			return dataFiltered;
		} else {
			return this.data;
		}
	}

	/**
	 * Apply filter to the dataset. This will fill the `filtered` class member array with boolean values associated with each data point
	 * to indicate the filtered status.
	 * 
	 * @param {Object} filter: Filter object in the Format `{name: 'fc', value: '3', operator: '>'}`
	 * @param {Boolean} debug: Print out debug statements
	 */
	setFilter(filter, debug = false) {
		const filterKeys = Object.keys(filter);
		if (debug) console.log(`Setfilter for ${this.name}`);
		for (let i in this.data) {
			// Init value with 'false' statement
			this.filtered[i] = false;
			for (let j in filterKeys) {
				const filterKey = filterKeys[j];
				const dimName = filter[filterKey].name
				// Added a dirty check on FPKM value names. Every variable with `FPKM` in it will be classified as number
				if (DimensionTypes[dimName] === 'number' || /FPKM/i.test(dimName)) {
					// Process Numbers
					if (filter[filterKey].operator === '<') {
						if (this.data[i][dimName] >= filter[filterKey].value)
							this.filtered[i] = true;
					} else if (filter[filterKey].operator === '>') {
						if (this.data[i][dimName] <= filter[filterKey].value)
							this.filtered[i] = true;
					}
				// Not a number
			} else {
					if (typeof this.data[i][dimName] === "undefined" || this.data[i][dimName].indexOf(filter[filterKey].value) === -1)
						this.filtered[i] = true;
				}
			}
		}
	}

	/**
	 * Check if a filter is applied to the data set.
	 * 
	 * @return {Boolean} `isFiltered` status
	 */
	isFiltered() {
		for (let i in this.filtered)
			if (this.filtered[i] === true)
				return true;
		return false;
	}
}

export default Dataset;
