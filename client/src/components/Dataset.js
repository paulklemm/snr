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
	setData(data, dimNames) {
		this.data = data;
		this.loaded = true;
		this.loading = false;
		this.dimNames = dimNames;
		// Attach 'filtered' element
		this.filtered = [];
		for (let i in this.data)
			this.filtered[i] = false
	}

	/**
	 * Get array of the data set.
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
			return dataFiltered;
		} else {
			return this.data;
		}
	}

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

	isFiltered() {
		for (let i in this.filtered)
			if (this.filtered[i] === true)
				return true;
		return false;
	}
}

export default Dataset;
